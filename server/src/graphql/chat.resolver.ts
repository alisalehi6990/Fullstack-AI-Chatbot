import { ApolloError } from "apollo-server-express";
import { queryOllama } from "../services/llm.service";

const chatResolvers = {
  Mutation: {
    chat: async (_: any, { message }: { message: string }, context: any) => {
      const { currentUser } = context;
      if (!currentUser) {
        throw new ApolloError("Authentication required", "UNAUTHENTICATED");
      }
      try {
        const reply = await queryOllama(message);
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
