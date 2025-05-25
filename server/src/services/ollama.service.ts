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
      baseUrl: "http://localhost:11434",
    });
  } else {
    return new Ollama({
      model: model || "llama3",
      baseUrl: "http://localhost:11434",
    });
  }
};
