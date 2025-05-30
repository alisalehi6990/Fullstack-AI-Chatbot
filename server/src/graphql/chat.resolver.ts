import { promptGenerator, llmQuery, Prompt } from "../services/llm.service";
import { InputJsonValue } from "@prisma/client/runtime/library";
import { fetchUserSession, updateSession } from "../services/session.service";
import { countTokens } from "gpt-tokenizer";
import { updateUserTokenUsage } from "../services/userManagement.service";
import { prisma } from "../app";
import { handleError, createError } from "../utils/errorHandler";

export type Message = {
  isUser: boolean;
  content: string;
};

export type MessageDocument = {
  id: string;
  name: string;
  type: string;
  sizeText: string;
};

const chatResolvers = {
  Mutation: {
    chat: async (
      _: any,
      {
        sessionId,
        message,
        messageDocuments,
      }: {
        sessionId?: string;
        message: string;
        messageDocuments?: MessageDocument[];
      },
      context: any
    ) => {
      try {
        const { currentUser } = context;
        if (!currentUser) {
          throw createError("Authentication required", "UNAUTHENTICATED", 401);
        }

        // Quota check
        const user = await prisma.user.findUnique({
          where: { id: currentUser.id },
          select: { inputTokens: true, outputTokens: true, quota: true },
        });

        if (!user) {
          throw createError("User not found", "NOT_FOUND", 404);
        }

        const usedToken = (user.inputTokens || 0) + (user.outputTokens || 0);
        if (user.quota !== null && usedToken >= user.quota) {
          throw createError("Token quota exceeded", "FORBIDDEN", 403);
        }

        const chatSession = await fetchUserSession({
          userId: currentUser.id,
          sessionId,
          messageDocuments,
        });

        if (!chatSession) {
          throw createError("Chat session not found", "NOT_FOUND", 404);
        }

        const userMessage = {
          role: "human",
          content: message,
          documents: messageDocuments,
          createdAt: new Date(),
        };

        const mappedChatHistory = Array.isArray(chatSession.messages)
          ? (chatSession.messages as Prompt[])
          : [];

        const prompt = await promptGenerator({
          messageHistory: chatSession.messages as any,
          currentUser,
          input: message,
          documents: chatSession.documents || [],
        });

        const reply = await llmQuery({ prompt });

        const promptText =
          typeof prompt === "string" ? prompt : JSON.stringify(prompt);

        const inputTokens = countTokens(promptText);
        const outputTokens = countTokens(reply as string);

        const aiMessage = { role: "ai", content: reply, createdAt: new Date() };
        const updatedMessages = [...mappedChatHistory, userMessage, aiMessage];

        await updateSession(
          chatSession.id,
          updatedMessages as InputJsonValue,
          inputTokens,
          outputTokens
        );

        await updateUserTokenUsage({
          userId: currentUser.id,
          inputTokens,
          outputTokens,
        });

        // Fetch updated user token usage
        const updatedUser = await prisma.user.findUnique({
          where: { id: currentUser.id },
          select: { inputTokens: true, outputTokens: true, quota: true },
        });

        if (!updatedUser) {
          throw createError("Failed to fetch updated user data", "INTERNAL_SERVER_ERROR", 500);
        }

        const usedTokenFinal =
          (updatedUser.inputTokens || 0) + (updatedUser.outputTokens || 0);

        return {
          messages: prompt
            .filter((p) => p.role !== "system")
            .map((p) => ({ content: p.content, isUser: p.role === "human" })),
          aiResponse: reply,
          sessionId: chatSession.id,
          usedToken: usedTokenFinal,
        };
      } catch (error: any) {
        return handleError(error, {
          userId: context.currentUser?.id,
          functionName: "chat",
          additionalInfo: { sessionId, messageDocuments }
        });
      }
    },
  },
};

export default chatResolvers;
