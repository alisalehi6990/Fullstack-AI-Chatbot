import getOllamaConnection from "./ollama.service";
type Prompt = {
  role: string;
  content: string;
};
export async function queryOllama(prompt: Prompt[], model: string = "llama3") {
  const llmConnection = getOllamaConnection(model);
  const reply = await llmConnection.invoke(prompt);
  return reply;
}
