import { ApolloError } from "apollo-server-express";

const chatResolvers = {
  Mutation: {
    chat: async (_: any, { message }: { message: string }, context: any) => {
      const { currentUser } = context;
      if (!currentUser) {
        throw new ApolloError("Authentication required", "UNAUTHENTICATED");
      }
      try {
        // Simulate a chat response
        const reply = `You said: ${message}`;
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