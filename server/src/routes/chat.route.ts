import express, { Request, Response } from "express";
import { promptGenerator, queryOllama } from "../services/llm.service";
import { ApolloError } from "apollo-server-express";
import { fetchUserSession, updateSession } from "../services/session.service";

const router = express.Router();
type Prompt = {
  role: string;
  content: string;
};
router.post("/stream", async (req: Request, res: Response) => {
  const currentUser = req.currentUser;
  const { message, sessionId } = req.body;
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

    const prompt = promptGenerator({
      currentUser,
      messageHistory: mappedChatHistory,
      input: message,
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

export default router;
