import { TogetherAI } from "@langchain/community/llms/togetherai";
import { TogetherAIEmbeddings } from "@langchain/community/embeddings/togetherai";

export const getTogetherConnection = ({
  model,
  isEmbeding = false,
}: {
  model?: string;
  isEmbeding?: boolean;
}) => {
  if (isEmbeding) {
    return new TogetherAIEmbeddings({
      model: model || "BAAI/bge-m3",
    });
  } else {
    return new TogetherAI({
      model: model || "meta-llama/Llama-3-8b-chat-hf",
      maxTokens: 256,
    });
  }
};
