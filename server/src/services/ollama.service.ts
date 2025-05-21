import { Ollama } from "@langchain/ollama";
const getOllamaConnection = (model: string = "llama3") => {
  const llmConnection = new Ollama({
    model,
    baseUrl: "http://localhost:11434",
  });
  return llmConnection;
};
export default getOllamaConnection;
