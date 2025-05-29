import { ApolloError } from "apollo-server-express";
import { prisma } from "../app";
import { InputJsonValue } from "@prisma/client/runtime/library";
import { MessageDocument } from "../graphql/chat.resolver";
import { ChatHistory, Documents } from "@prisma/client";

export function isValidObjectId(id: string): boolean {
  const objectIdRegex = /^[0-9a-fA-F]{24}$/;
  return objectIdRegex.test(id);
}
export const fetchUserSession = async ({
  userId,
  sessionId,
  messageDocuments,
}: {
  userId: string;
  sessionId?: string;
  messageDocuments?: MessageDocument[];
}) => {
  if (!userId) {
    throw new ApolloError("Authentication required", "UNAUTHENTICATED");
  }
  try {
    let chatSession: any | null = null;

    if (sessionId && isValidObjectId(sessionId)) {
      chatSession = await prisma.chatHistory.findUnique({
        where: {
          id: sessionId,
        },
        select: {
          id: true,
          userId: true,
          messages: true,
          updatedAt: true,
          createdAt: true,
          documents: {
            select: {
              id: true,
              name: true,
              type: true,
              sizeText: true,
            },
          },
        },
      });
    }
    if (chatSession) {
      return chatSession;
    }
    chatSession = await prisma.chatHistory.create({
      data: {
        userId,
        messages: [],
        outputTokens: 0,
        inputTokens: 0,
      },
    });
    if (messageDocuments && messageDocuments.length > 0) {
      const messageIds = messageDocuments.map((m) => m.id);
      await prisma.documents.updateMany({
        where: {
          id: {
            in: messageIds,
          },
        },
        data: {
          sessionId: chatSession.id,
        },
      });
      const updatedDocuments = await prisma.documents.findMany({
        where: { id: { in: messageIds } },
      });
      chatSession.documents = updatedDocuments;
    }

    return chatSession;
  } catch (error: any) {
    throw new ApolloError(error.message);
  }
};

export const updateSession = async (
  sessionId: string,
  updatedMessages: InputJsonValue,
  inputTokens: number = 0,
  outputTokens: number = 0
) => {
  await prisma.chatHistory.update({
    where: { id: sessionId },
    data: {
      messages: updatedMessages,
      inputTokens: { increment: inputTokens },
      outputTokens: { increment: outputTokens },
    },
  });
};
