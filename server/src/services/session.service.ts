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
    let chatSession:
      | (ChatHistory & {
          documents?: Documents[];
        })
      | null = null;

    if (sessionId && isValidObjectId(sessionId)) {
      const existingSession = await prisma.chatHistory.findUnique({
        where: {
          id: sessionId,
        },
      });
      if (existingSession) {
        chatSession = existingSession;
        const documents = await prisma.documents.findMany({
          where: {
            sessionId: existingSession?.id,
          },
        });
        chatSession.documents = documents;
      }
    }
    if (!chatSession) {
      chatSession = await prisma.chatHistory.create({
        data: {
          userId,
          messages: [],
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
