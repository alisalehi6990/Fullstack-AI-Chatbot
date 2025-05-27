import { ApolloError } from "apollo-server-express";
import { promptGenerator, queryOllama } from "../services/llm.service";
import { InputJsonValue } from "@prisma/client/runtime/library";
import { fetchUserSession, updateSession } from "../services/session.service";
import { getContextFromQuery } from "../services/rag.service";

export type Message = {
  isUser: boolean;
  content: string;
};

export type MessageDocument = {
  id: string;
  name: string;
  type: string;
  sizeText: string;
};

const chatResolvers = {
  Mutation: {
    chat: async (
      _: any,
      {
        sessionId,
        message,
        messageDocuments,
      }: {
        sessionId?: string;
        message: string;
        messageDocuments?: MessageDocument[];
      },
      context: any
    ) => {
      const { currentUser } = context;
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
        const mappedChatHistory = Array.isArray(chatSession.messages)
          ? (chatSession.messages as Prompt[])
          : [];

        const prompt = await promptGenerator({
          messageHistory: chatSession.messages as any,
          currentUser,
          input: message,
          documents: chatSession.documents || [],
        });

        const reply = await queryOllama({ prompt });
        const aiMessage = { role: "ai", content: reply, createdAt: new Date() };
        const updatedMessages = [...mappedChatHistory, userMessage, aiMessage];
        await updateSession(chatSession.id, updatedMessages as InputJsonValue);
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
