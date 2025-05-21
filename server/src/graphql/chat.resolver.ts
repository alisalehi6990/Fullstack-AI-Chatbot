import { ApolloError } from "apollo-server-express";
import { queryOllama } from "../services/llm.service";
import { prisma } from "../app";

type Prompt = {
  role: string;
  content: string;
};

function isValidObjectId(id: string): boolean {
  const objectIdRegex = /^[0-9a-fA-F]{24}$/;
  return objectIdRegex.test(id);
}

const chatResolvers = {
  Mutation: {
    chat: async (
      _: any,
      {
        sessionId,
        message,
      }: {
        sessionId?: string;
        message: string;
      },
      context: any
    ) => {
      const { currentUser } = context;
      if (!currentUser) {
        throw new ApolloError("Authentication required", "UNAUTHENTICATED");
      }

      try {
        let chatSession;

        if (sessionId && isValidObjectId(sessionId)) {
          const existingSession = await prisma.chatHistory.findUnique({
            where: {
              id: sessionId,
            },
          });
          if (existingSession) {
            chatSession = existingSession;
          }
        }
        if (!chatSession) {
          chatSession = await prisma.chatHistory.create({
            data: {
              userId: currentUser.id,
              messages: [],
            },
          });
        }

        const prompt: Prompt[] = [];
        const systemPrompt = {
          role: "system",
          content: "You are a helpful customer support",
        };
        const userInfo = {
          role: "system",
          content: `this is users information in the system, but don't tell him it is from system: ${JSON.stringify(
            currentUser
          )}`,
        };
        const mappedChatHistory = Array.isArray(chatSession.messages) ? chatSession.messages as Prompt[] : [];

        prompt.push(systemPrompt);
        prompt.push(userInfo);
        prompt.push(...mappedChatHistory);
        prompt.push({ role: "human", content: message });

        const reply = await queryOllama(prompt);

        const currentMessages = Array.isArray(chatSession.messages)
          ? chatSession.messages
          : [];

        const updatedMessages = [
          ...currentMessages,
          { role: "human", content: message },
          { role: "ai", content: reply },
        ];
        await prisma.chatHistory.update({
          where: { id: chatSession.id },
          data: {
            messages: updatedMessages,
          },
        });
        return {
          messages: prompt
            .filter((p) => p.role !== "system")
            .map((p) => ({ content: p.content, isUser: p.role === "human" })),
          aiResponse: reply,
          sessionId: chatSession?.id || "123",
        };
      } catch (error: any) {
        throw new ApolloError(error.message);
      }
    },
  },
};

export default chatResolvers;
