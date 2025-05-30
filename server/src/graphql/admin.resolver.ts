import { prisma } from "../index.js";
import { handleError, createError } from "../utils/errorHandler.js";

const adminResolvers = {
  Query: {
    pendingUsers: async (_: any, __: any, context: any) => {
      try {
        const { currentUser } = context;

        if (!currentUser || currentUser.role !== "ADMIN") {
          throw createError("Forbidden", "FORBIDDEN", 403);
        }

        return await prisma.user.findMany({
          where: {
            isActive: false,
          },
        });
      } catch (error: any) {
        return handleError(error, {
          userId: context.currentUser?.id,
          functionName: "pendingUsers",
          additionalInfo: { query: "pendingUsers" }
        });
      }
    },
  },
  Mutation: {
    approveUser: async (_: any, { id }: { id: string }, context: any) => {
      try {
        const { currentUser } = context;

        if (!currentUser || currentUser.role !== "ADMIN") {
          throw createError("Forbidden", "FORBIDDEN", 403);
        }

        const user = await prisma.user.findUnique({ where: { id } });
        if (!user) {
          throw createError("User not found", "NOT_FOUND", 404);
        }

        return await prisma.user.update({
          where: { id },
          data: {
            isActive: true,
          },
        });
      } catch (error: any) {
        return handleError(error, {
          userId: context.currentUser?.id,
          functionName: "approveUser",
          additionalInfo: { targetUserId: id }
        });
      }
    },
    removeUser: async (_: any, { id }: { id: string }, context: any) => {
      try {
        const { currentUser } = context;

        if (!currentUser || currentUser.role !== "ADMIN") {
          throw createError("Forbidden", "FORBIDDEN", 403);
        }

        const user = await prisma.user.findUnique({ where: { id } });
        if (!user) {
          throw createError("User not found", "NOT_FOUND", 404);
        }

        return await prisma.user.delete({
          where: { id },
        });
      } catch (error: any) {
        return handleError(error, {
          userId: context.currentUser?.id,
          functionName: "removeUser",
          additionalInfo: { targetUserId: id }
        });
      }
    },
  },
};

export default adminResolvers;
