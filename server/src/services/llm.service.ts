import { Ollama, OllamaEmbeddings } from "@langchain/ollama";
import { getOllamaConnection } from "./ollama.service";
import { getContextFromQuery } from "./rag.service";
import { MessageDocument } from "../graphql/chat.resolver";
import { getTogetherConnection } from "./together.service";
import { TogetherAI } from "@langchain/community/llms/togetherai";
import { TogetherAIEmbeddings } from "@langchain/community/embeddings/togetherai";

type Prompt = {
  role: string;
  content: string;
};

interface LLMQueryProps {
  model?: string;
  prompt: Prompt[] | string;
  streaming?: boolean;
}

export async function llmQuery({
  prompt,
  model,
  streaming = false,
}: LLMQueryProps) {
  const isProd = process.env.NODE_ENV === "production";
  const llmConnection = isProd
    ? (getTogetherConnection({ model }) as TogetherAI)
    : (getOllamaConnection({ model }) as Ollama);
  if (streaming) {
    return await llmConnection.stream(prompt);
  }
  return await llmConnection.invoke(prompt);
}

export async function promptGenerator({
  documents = [],
  currentUser,
  input,
  messageHistory = [],
}: {
  currentUser: any;
  messageHistory: any[];
  documents: MessageDocument[];
  input: string;
}) {
  const prompt: Prompt[] = [];

  // 1. System Instruction - Define Role and Behavior
  const systemPrompt = {
    role: "system",
    content: `You are an expert document analyst assistant. Your job is to answer questions based on provided documents only. 
      If the question cannot be answered from the given context, clearly state that the information is not available in the documents.
      Always cite the source or reference when possible.`,
  };
  prompt.push(systemPrompt);

  // 2. Optional: User Info (don't show in final answer)
  if (currentUser) {
    const userInfoPrompt = {
      role: "system",
      content: `User info (do not include in response): ${JSON.stringify(
        currentUser
      )}`,
    };
    prompt.push(userInfoPrompt);
  }

  let contextString = "";
  if (documents.length > 0) {
    const context = await getContextFromQuery(
      input,
      documents.map((d) => d.id),
      5
    );
    contextString = context.join("\n\n");
  }

  // 4. Inject Retrieved Context as System Prompt
  if (contextString) {
    const contextPrompt = {
      role: "system",
      content: `Use the following documents to answer the user's query:\n\n${contextString}\n\nAnswer based strictly on this information.`,
    };
    prompt.push(contextPrompt);
  }

  // 5. Add Message History (if any)
  prompt.push(...messageHistory);

  // 6. Add User Input at the End
  prompt.push({ role: "human", content: input });

  return prompt;
}

export async function getEmbeddings(input: string, model?: string) {
  const isProd = process.env.NODE_ENV === "production";
  const llmConnection = isProd
    ? (getTogetherConnection({
        model,
        isEmbeding: true,
      }) as TogetherAIEmbeddings)
    : (getOllamaConnection({
        model,
        isEmbeding: true,
      }) as OllamaEmbeddings);

  return await llmConnection.embedQuery(input);
}
