import express, { Request, Response } from "express";
import { promptGenerator, queryOllama } from "../services/llm.service";
import { ApolloError } from "apollo-server-express";
import {
  fetchUserSession,
  isValidObjectId,
  updateSession,
} from "../services/session.service";
import multer from "multer";
import pdfParse from "pdf-parse";
import { chunkText } from "../utils/chunkText";
import { processAndStoreChunks } from "../services/rag.service";
import { prisma } from "../app";
import { removeDocumentFromQdrant } from "../services/qdrant.service";
import { MessageDocument } from "../graphql/chat.resolver";

const upload = multer({ storage: multer.memoryStorage() });

const router = express.Router();

type Prompt = {
  role: string;
  content: string;
  documents?: MessageDocument[];
};

type FileInfo = {
  sizeText: string;
  name: string;
  type: string;
};

router.post("/stream", async (req: Request, res: Response) => {
  const { message, sessionId, messageDocuments } = req.body;
  const currentUser = req.currentUser;
  if (!currentUser) {
    throw new ApolloError("Authentication required", "UNAUTHENTICATED");
  }
  try {
    const chatSession = await fetchUserSession({
      userId: currentUser.id,
      sessionId,
      messageDocuments,
    });
    const userMessage = {
      role: "human",
      content: message,
      documents: messageDocuments,
      createdAt: new Date(),
    };

    const prompt = await promptGenerator({
      messageHistory: chatSession.messages as any,
      currentUser,
      input: message,
      documents: chatSession.documents || [],
    });
    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    });

    const stream = await queryOllama({ prompt, streaming: true });

    let reply = "";
    for await (const chunk of stream) {
      reply += chunk;
      res.write(`data: ${JSON.stringify({ content: chunk })}\n\n\n`);
      res.flush();
    }

    res.end();

    const mappedChatHistory = Array.isArray(chatSession.messages)
      ? (chatSession.messages as Prompt[])
      : [];
    const aiMessage = { role: "ai", content: reply, createdAt: new Date() };
    const updatedMessages = [...mappedChatHistory, userMessage, aiMessage];
    await updateSession(chatSession.id, updatedMessages);
  } catch (error: any) {
    throw new ApolloError(error.message);
  }
});

router.post(
  "/documents",
  upload.single("file"),
  async (
    req: Request & {
      file?: Express.Multer.File;
      sessionId?: string;
      fileInfo?: FileInfo;
    },
    res: Response
  ): Promise<void> => {
    try {
      const currentUser = req.currentUser;
      if (!currentUser) {
        throw new ApolloError("Authentication required", "UNAUTHENTICATED");
      }
      const buffer = req.file?.buffer;
      const sessionId = req.body.sessionId;
      const fileInfo = JSON.parse(req.body.fileInfo);
      if (!buffer) {
        res.status(400).json({ error: "No file uploaded" });
        return;
      }

      let text;
      if (req.file?.mimetype === "application/pdf") {
        text = (await pdfParse(buffer)).text;
      } else if (req.file?.mimetype === "text/plain") {
        text = buffer.toString();
      } else {
        res.status(400).json({ error: "Unsupported file type" });
        return;
      }

      const chunks = await chunkText(text, 50);

      const document = await prisma.documents.create({
        data: {
          sessionId,
          userId: currentUser.id,
          name: fileInfo.name,
          type: fileInfo.type,
          sizeText: fileInfo.sizeText,
        },
      });
      res.json({
        message: "Document processed and stored",
        documentId: document.id,
      });
      await processAndStoreChunks(document.id, chunks);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
);

router.delete("/documents/:id", async (req: Request, res: Response) => {
  try {
    const currentUser = req.currentUser;
    if (!currentUser) {
      throw new ApolloError("Authentication required", "UNAUTHENTICATED");
    }
    const { id } = req.params;
    await prisma.documents
      .delete({
        where: {
          id,
          userId: currentUser.id,
        },
      })
      .catch((e) => {
        console.log("Document FAILED to delete from Mongo", e.message);
      });
    await removeDocumentFromQdrant(id);
    res.json({ message: "Document deleted" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/clearhistory", async (req: Request, res: Response) => {
  const currentUser = req.currentUser;
  const keepSession = req.body.keepSession;
  try {
    if (keepSession) {
      if (!isValidObjectId(keepSession)) {
        res.status(400).json({ message: "Keep Session not found" });
        return;
      }
      await prisma.chatHistory.deleteMany({
        where: {
          id: {
            not: keepSession,
          },
          userId: currentUser.id,
        },
      });

      await prisma.documents.deleteMany({
        where: {
          sessionId: {
            not: keepSession,
          },
          userId: currentUser.id,
        },
      });
    } else {
      await prisma.chatHistory.deleteMany({
        where: {
          userId: currentUser.id,
        },
      });

      await prisma.documents.deleteMany({
        where: {
          userId: currentUser.id,
        },
      });
    }

    res.json({ message: "Session history cleared" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});
export default router;
