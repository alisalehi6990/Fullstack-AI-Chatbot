import express, { Request, Response } from "express";
import { promptGenerator, llmQuery, Prompt } from "../services/llm.service";
import { ApolloError } from "apollo-server-express";
import {
  fetchUserSession,
  isValidObjectId,
  updateSession,
} from "../services/session.service";
import multer from "multer";
import pdfParse from "pdf-parse";
import { processAndStoreChunks } from "../services/rag.service";
import { prisma } from "../app";
import { removeDocumentFromQdrant } from "../services/qdrant.service";
import { MessageDocument } from "../graphql/chat.resolver";
import { countTokens } from "gpt-tokenizer";
import { updateUserTokenUsage } from "../services/userManagement.service";
import { handleError, createError } from "../utils/errorHandler";

const upload = multer({ storage: multer.memoryStorage() });

const router = express.Router();

type FileInfo = {
  sizeText: string;
  name: string;
  type: string;
};

router.post("/stream", async (req: Request, res: Response) => {
  try {
    const { message, sessionId, messageDocuments } = req.body;
    const currentUser = req.currentUser;

    if (!currentUser) {
      throw createError("Authentication required", "UNAUTHENTICATED", 401);
    }

    // Quota check
    const user = await prisma.user.findUnique({
      where: { id: currentUser.id },
      select: { inputTokens: true, outputTokens: true, quota: true },
    });

    if (!user) {
      throw createError("User not found", "NOT_FOUND", 404);
    }

    const usedToken = (user.inputTokens || 0) + (user.outputTokens || 0);
    if (user.quota !== null && usedToken >= user.quota) {
      res.status(403).json({
        message: "Token quota exceeded",
        usedToken,
        quota: user.quota,
      });
      return;
    }

    const chatSession = await fetchUserSession({
      userId: currentUser.id,
      sessionId,
      messageDocuments,
    });

    if (!chatSession) {
      throw createError("Chat session not found", "NOT_FOUND", 404);
    }

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

    const stream = await llmQuery({ prompt, streaming: true });

    let reply = "";
    for await (const chunk of stream) {
      reply += chunk;
      res.write(`data: ${JSON.stringify({ content: chunk })}\n\n\n`);
      res.flush();
    }

    const mappedChatHistory = Array.isArray(chatSession.messages)
      ? (chatSession.messages as Prompt[])
      : [];
    const aiMessage = { role: "ai", content: reply, createdAt: new Date() };
    const updatedMessages = [...mappedChatHistory, userMessage, aiMessage];

    const promptText =
      typeof prompt === "string" ? prompt : JSON.stringify(prompt);

    const inputTokens = countTokens(promptText);
    const outputTokens = countTokens(reply as string);

    await updateSession(
      chatSession.id,
      updatedMessages,
      inputTokens,
      outputTokens
    );

    await updateUserTokenUsage({
      userId: currentUser.id,
      inputTokens,
      outputTokens,
    });

    // Fetch updated user token usage
    const updatedUser = await prisma.user.findUnique({
      where: { id: currentUser.id },
      select: { inputTokens: true, outputTokens: true },
    });

    if (!updatedUser) {
      throw createError(
        "Failed to fetch updated user data",
        "INTERNAL_SERVER_ERROR",
        500
      );
    }

    const usedTokenFinal =
      (updatedUser.inputTokens || 0) + (updatedUser.outputTokens || 0);

    // Send usedToken/quota as final SSE message
    res.write(
      `data: ${JSON.stringify({
        usedToken: usedTokenFinal,
        done: true,
      })}\n\n\n`
    );
    res.flush();
    res.end();
  } catch (error: any) {
    handleError(error, {
      userId: req.currentUser?.id,
      functionName: "stream",
      additionalInfo: { sessionId: req.body.sessionId },
    });
    res.status(error.statusCode || 500).json({
      message: error.message || "An unexpected error occurred",
    });
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
        throw createError("Authentication required", "UNAUTHENTICATED", 401);
      }

      const buffer = req.file?.buffer;
      const sessionId = req.body.sessionId;
      const fileInfo = JSON.parse(req.body.fileInfo);

      if (!buffer) {
        throw createError("No file uploaded", "BAD_REQUEST", 400);
      }

      let text;
      if (req.file?.mimetype === "application/pdf") {
        text = (await pdfParse(buffer)).text;
      } else if (req.file?.mimetype === "text/plain") {
        text = buffer.toString();
      } else {
        throw createError("Unsupported file type", "BAD_REQUEST", 400);
      }

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

      await processAndStoreChunks(document.id, text);
    } catch (error: any) {
      handleError(error, {
        userId: req.currentUser?.id,
        functionName: "documents",
        additionalInfo: {
          sessionId: req.body.sessionId,
          fileType: req.file?.mimetype,
        },
      });
      res.status(error.statusCode || 500).json({
        message: error.message || "An unexpected error occurred",
      });
    }
  }
);

router.delete("/documents/:id", async (req: Request, res: Response) => {
  try {
    const currentUser = req.currentUser;
    if (!currentUser) {
      throw createError("Authentication required", "UNAUTHENTICATED", 401);
    }

    const { id } = req.params;
    if (!isValidObjectId(id)) {
      throw createError("Invalid document ID", "BAD_REQUEST", 400);
    }

    const document = await prisma.documents.findUnique({
      where: { id },
    });

    if (!document) {
      throw createError("Document not found", "NOT_FOUND", 404);
    }

    if (document.userId !== currentUser.id) {
      throw createError(
        "Unauthorized to delete this document",
        "FORBIDDEN",
        403
      );
    }

    await prisma.documents.delete({
      where: { id },
    });

    await removeDocumentFromQdrant(id);

    res.json({ message: "Document deleted successfully" });
  } catch (error: any) {
    handleError(error, {
      userId: req.currentUser?.id,
      functionName: "deleteDocument",
      additionalInfo: { documentId: req.params.id },
    });
    res.status(error.statusCode || 500).json({
      message: error.message || "An unexpected error occurred",
    });
  }
});

router.post("/clearhistory", async (req: Request, res: Response) => {
  const currentUser = req.currentUser;
  const keepSession = req.body.keepSession;
  try {
    if (!currentUser) {
      res.status(401).json({ message: "Authentication required" });
      return;
    }
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
