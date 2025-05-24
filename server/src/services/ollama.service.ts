import { Ollama, OllamaEmbeddings } from "@langchain/ollama";

export const getQueryConnection = (model: string = "llama3") => {
  const llmConnection = new Ollama({
    model,
    baseUrl: "http://localhost:11434",
  });
  return llmConnection;
};

export function getEmbeddingsConnection(
  model: string = "mxbai-embed-large"
) {
  const embeddingsConnection = new OllamaEmbeddings({
    model,
    baseUrl: "http://localhost:11434",
  });
  return embeddingsConnection;
}
