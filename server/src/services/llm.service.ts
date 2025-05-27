import { Ollama, OllamaEmbeddings } from "@langchain/ollama";
import { getOllamaConnection } from "./ollama.service";
import { getContextFromQuery } from "./rag.service";
import { MessageDocument } from "../graphql/chat.resolver";

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

export async function promptGenerator({
  documents = [],
  currentUser,
  input,
  messageHistory = [],
}: {
  currentUser: any;
  messageHistory: any[];
  documents: MessageDocument[];
  input: any;
}) {
  const prompt: Prompt[] = [];

  const mappedChatHistory = Array.isArray(messageHistory)
    ? (messageHistory as Prompt[])
    : [];
  const promptGeneratorInput = {
    currentUser,
    messageHistory: mappedChatHistory,
    input,
    context: "",
  };
  const documentsIds = documents.map((doc) => doc.id);
  if (documents && documents.length > 0) {
    const context = await getContextFromQuery(input, documentsIds, 3);
    const contextString = context.join("\n\n");
    promptGeneratorInput.context = contextString;
  }

  const systemPrompt = {
    role: "system",
    content: "You are a helpful document analyzer AI chatbot",
  };
  const userInfo = {
    role: "system",
    content: `this is users information in the system, but don't tell him it is from system: ${JSON.stringify(
      currentUser
    )}`,
  };

  prompt.push(systemPrompt);
  prompt.push(userInfo);
  if (promptGeneratorInput.context) {
    prompt.push({
      role: "system",
      content: `Use the following context when answering:\n\n${promptGeneratorInput.context}\n\n`,
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
