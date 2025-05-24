import { addPointToQdrant, getClient, searchQdrant } from "./qdrant.service";
import { getEmbeddings } from "./llm.service";
import { v4 as uuidv4 } from "uuid";

export async function processAndStoreChunks(
  documentId: string,
  chunks: string[]
) {
  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    const vector = await getEmbeddings(chunk);
    const pointId = uuidv4();

    await addPointToQdrant({
      id: pointId,
      vector: vector,
      payload: {
        text: chunk,
        documentId,
        chunkIndex: i,
      },
      collection: "AiChatBot",
    });
  }
}

export async function getContextFromQuery(query: string, limit = 5) {
  try {
    const queryVector = await getEmbeddings(query);
    return await searchQdrant(queryVector, limit);
  } catch (e: any) {
    throw new Error(`Error in getContextFromQuery: ${e.message}`);
  }
}
