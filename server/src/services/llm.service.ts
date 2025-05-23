import getOllamaConnection from "./ollama.service";

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
  model = "llama3",
  streaming = false,
}: QueryOllamaProps) {
  const llmConnection = getOllamaConnection(model);

  if (streaming) {
    return await llmConnection.stream(prompt);
  }
  return await llmConnection.invoke(prompt);
}

export function promptGenerator({
  currentUser,
  messageHistory = [],
  input,
}: {
  currentUser: User;
  messageHistory: Prompt[];
  input: string;
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
  prompt.push(...messageHistory);
  prompt.push({ role: "human", content: input });

  return prompt;
}
