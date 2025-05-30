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
      model: model || "BAAI-Bge-Base-1.5",
    });
  } else {
    return new TogetherAI({
      model: model || "meta-llama/Llama-3.3-70B-Instruct-Turbo-Free",
      maxTokens: 256,
    });
  }
};
