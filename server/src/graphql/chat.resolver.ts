import { ApolloError } from "apollo-server-express";
import { promptGenerator, llmQuery } from "../services/llm.service";
import { InputJsonValue } from "@prisma/client/runtime/library";
import { fetchUserSession, updateSession } from "../services/session.service";
import { countTokens } from "gpt-tokenizer";
import { updateUserTokenUsage } from "../services/userManagement.service";
import { prisma } from "../app";

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
      const { currentUser } = context;
      if (!currentUser) {
        throw new ApolloError("Authentication required", "UNAUTHENTICATED");
      }

      // Quota check
      const user = await prisma.user.findUnique({
        where: { id: currentUser.id },
        select: { inputTokens: true, outputTokens: true, quota: true },
      });
      const usedToken = (user?.inputTokens || 0) + (user?.outputTokens || 0);
      if (user && user.quota !== null && usedToken >= user.quota) {
        throw new ApolloError("Token quota exceeded", "FORBIDDEN");
      }

      try {
        const chatSession = await fetchUserSession({
          userId: currentUser.id,
          sessionId,
          messageDocuments,
        });
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
        const usedTokenFinal =
          (updatedUser?.inputTokens || 0) + (updatedUser?.outputTokens || 0);

        return {
          messages: prompt
            .filter((p) => p.role !== "system")
            .map((p) => ({ content: p.content, isUser: p.role === "human" })),
          aiResponse: reply,
          sessionId: chatSession.id,
          usedToken: usedTokenFinal,
        };
      } catch (error: any) {
        throw new ApolloError(error.message);
      }
    },
  },
};

export default chatResolvers;
