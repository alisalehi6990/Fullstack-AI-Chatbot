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
      model: model || "togethercomputer/m2-bert-80M-8k-retrieval",
    });
  } else {
    return new TogetherAI({
      model: model || "meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo",
      maxTokens: 256,
    });
  }
};
