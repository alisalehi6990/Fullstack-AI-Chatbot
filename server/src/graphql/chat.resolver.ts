import { ApolloError } from "apollo-server-express";
import { promptGenerator, queryOllama } from "../services/llm.service";
import { InputJsonValue } from "@prisma/client/runtime/library";
import { fetchUserSession, updateSession } from "../services/session.service";

export type Message = {
  isUser: boolean;
  content: string;
};

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
        const reply = await queryOllama({ prompt });

        const updatedMessages = [
          ...mappedChatHistory,
          { role: "human", content: message },
          { role: "ai", content: reply },
        ];
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
