import { Ollama } from "@langchain/ollama";

export async function queryOllama(prompt: string, model: string = "llama3") {
  const llmConnection = new Ollama({
    model,
    baseUrl: "http://localhost:11434",
  });
  return await llmConnection.invoke(prompt);
}
