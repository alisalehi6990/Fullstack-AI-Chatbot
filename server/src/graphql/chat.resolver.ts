import { ApolloError } from "apollo-server-express";
import { queryOllama } from "../services/llm.service";
type Message = {
  isUser: boolean;
  content: string;
};
const chatResolvers = {
  Mutation: {
    chat: async (
      _: any,
      {
        message,
        chatHistory,
      }: {
        message: string;
        chatHistory: Message[];
      },
      context: any
    ) => {
      const { currentUser } = context;
      if (!currentUser) {
        throw new ApolloError("Authentication required", "UNAUTHENTICATED");
      }

      try {
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
        const mappedChatHistory = chatHistory.map((message) => ({
          role: message.isUser ? "human" : "ai",
          content: message.content,
        }));

        const reply = await queryOllama([
          systemPrompt,
          userInfo,
          ...mappedChatHistory,
          { role: "human", content: message },
        ]);
        return {
          userMessage: message,
          aiResponse: reply,
        };
      } catch (error: any) {
        throw new ApolloError(error.message);
      }
    },
  },
};

export default chatResolvers;
