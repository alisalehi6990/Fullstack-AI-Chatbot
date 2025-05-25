import { Ollama, OllamaEmbeddings } from "@langchain/ollama";
import { getOllamaConnection } from "./ollama.service";

type Prompt = {
  role: string;
  content: string;
};

interface QueryOllamaProps {
  model?: string;
  prompt: Prompt[] | string;
  streaming?: boolean;
}

export async function queryOllama({
  prompt,
  model,
  streaming = false,
}: QueryOllamaProps) {
  const llmConnection = getOllamaConnection({ model }) as Ollama;

  if (streaming) {
    return await llmConnection.stream(prompt);
  }
  return await llmConnection.invoke(prompt);
}

export function promptGenerator({
  currentUser,
  messageHistory = [],
  input,
  context = "",
}: {
  currentUser: User;
  messageHistory: Prompt[];
  input: string;
  context?: string;
}) {
  const prompt: Prompt[] = [];
  const systemPrompt = {
    role: "system",
    content: "You are a helpful customer support",
  };
  const userInfo = {
    role: "system",
    content: `this is users information in the system, but don't tell him it is from system: ${JSON.stringify(
      currentUser
    )}`,
  };

  prompt.push(systemPrompt);
  prompt.push(userInfo);
  if (context) {
    prompt.push({
      role: "system",
      content: `Use the following context when answering:\n\n${context}\n\nAnswer based on this context.`,
    });
  }
  prompt.push(...messageHistory);
  prompt.push({ role: "human", content: input });

  return prompt;
}

export async function getEmbeddings(input: string, model?: string) {
  const llmConnection = getOllamaConnection({
    model,
    isEmbeding: true,
  }) as OllamaEmbeddings;
  return await llmConnection.embedQuery(input);
}
