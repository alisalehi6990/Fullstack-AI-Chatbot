import { ApolloError } from "apollo-server-express";
import { prisma } from "../app";
import { InputJsonValue } from "@prisma/client/runtime/library";

export function isValidObjectId(id: string): boolean {
  const objectIdRegex = /^[0-9a-fA-F]{24}$/;
  return objectIdRegex.test(id);
}
export const fetchUserSession = async ({
  sessionId,
  userId,
}: {
  sessionId?: string;
  userId: string;
}) => {
  if (!userId) {
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
          userId,
          messages: [],
        },
      });
    }
    return chatSession;
  } catch (error: any) {
    throw new ApolloError(error.message);
  }
};

export const updateSession = async (
  sessionId: string,
  updatedMessages: InputJsonValue
) => {
  await prisma.chatHistory.update({
    where: { id: sessionId },
    data: {
      messages: updatedMessages,
    },
  });
};
