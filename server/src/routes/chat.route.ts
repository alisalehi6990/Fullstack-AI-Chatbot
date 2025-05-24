import express, { Request, Response } from "express";
import { promptGenerator, queryOllama } from "../services/llm.service";
import { ApolloError } from "apollo-server-express";
import { fetchUserSession, updateSession } from "../services/session.service";
import { v4 as uuidv4 } from "uuid";
import multer from "multer";
import pdfParse from "pdf-parse";
import { chunkText } from "../utils/chunkText";
import {
  getContextFromQuery,
  processAndStoreChunks,
} from "../services/rag.service";

const upload = multer({ storage: multer.memoryStorage() });

const router = express.Router();
type Prompt = {
  role: string;
  content: string;
};

router.post("/stream", async (req: Request, res: Response) => {
  const { message, sessionId } = req.body;
  const currentUser = req.currentUser;
  if (!currentUser) {
    throw new ApolloError("Authentication required", "UNAUTHENTICATED");
  }
  try {
    const chatSession = await fetchUserSession({
      userId: currentUser.id,
      sessionId,
    });

    const mappedChatHistory = Array.isArray(chatSession.messages)
      ? (chatSession.messages as Prompt[])
      : [];
    const context = await getContextFromQuery(message, 3);
    const contextString = context.join("\n\n");

    const prompt = promptGenerator({
      currentUser,
      messageHistory: mappedChatHistory,
      input: message,
      context: contextString,
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

    const updatedMessages = [
      ...mappedChatHistory,
      { role: "human", content: message },
      { role: "ai", content: reply },
    ];
    await updateSession(chatSession.id, updatedMessages);
  } catch (error: any) {
    throw new ApolloError(error.message);
  }
});

router.post(
  "/upload",
  upload.single("file"),
  async (
    req: Request & { file?: Express.Multer.File },
    res: Response
  ): Promise<void> => {
    try {
      const currentUser = req.currentUser;
      if (!currentUser) {
        throw new ApolloError("Authentication required", "UNAUTHENTICATED");
      }
      const buffer = req.file?.buffer;
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

      const chunks = await chunkText(text, 5);

      const documentId = uuidv4();
      res.json({ message: "Document processed and stored", documentId });
      await processAndStoreChunks(documentId, chunks);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
);

export default router;
