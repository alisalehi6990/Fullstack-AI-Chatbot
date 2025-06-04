import { Ollama, OllamaEmbeddings } from "@langchain/ollama";

export const getOllamaConnection = ({
  model,
  isEmbeding = false,
}: {
  model?: string;
  isEmbeding?: boolean;
}) => {
  if (isEmbeding) {
    return new OllamaEmbeddings({
      model: model || "mxbai-embed-large",
      baseUrl: process.env.OLLAMA_LOCAL_URL,
    });
  } else {
    return new Ollama({
      model: model || "llama3",
      baseUrl: process.env.OLLAMA_LOCAL_URL,
    });
  }
};
