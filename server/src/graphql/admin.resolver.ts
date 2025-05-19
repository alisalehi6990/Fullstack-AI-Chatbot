import { ApolloError } from "apollo-server-express";
import { prisma } from "../app";

const adminResolvers = {
  Query: {
    pendingUsers: async (_: any, __: any, context: any) => {
      const { currentUser } = context;

      if (!currentUser || currentUser.role !== "ADMIN") {
        throw new ApolloError("Forbidden", "FORBIDDEN");
      }

      return await prisma.user.findMany({
        where: {
          isActive: false,
        },
      });
    },
  },
  Mutation: {
    approveUser: async (_: any, { id }: { id: string }, context: any) => {
      const { currentUser } = context;

      if (!currentUser || currentUser.role !== "ADMIN") {
        throw new ApolloError("Forbidden", "FORBIDDEN");
      }

      return await prisma.user.update({
        where: { id },
        data: {
          isActive: true,
        },
      });
    },
    removeUser: async (_: any, { id }: { id: string }, context: any) => {
      const { currentUser } = context;

      if (!currentUser || currentUser.role !== "ADMIN") {
        throw new ApolloError("Forbidden", "FORBIDDEN");
      }

      return await prisma.user.delete({
        where: { id },
      });
    },
  },
};

export default adminResolvers;
