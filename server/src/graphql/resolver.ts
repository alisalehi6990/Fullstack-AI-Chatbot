import { ApolloError } from "apollo-server-express";

const resolver = {
  Mutation: {
    chat: async (_: any, { message }: { message: string }) => {
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
export default resolver;
