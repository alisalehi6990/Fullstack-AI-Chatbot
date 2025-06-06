import { addPointToQdrant, searchQdrant } from "./qdrant.service.js";
import { getEmbeddings } from "./llm.service.js";
import { v4 as uuidv4 } from "uuid";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";

export async function processAndStoreChunks(documentId: string, text: string) {
  const splitter = new RecursiveCharacterTextSplitter({
    separators: ["\n\n", "\n", ". ", " ", ""],
    chunkSize: 500,
    chunkOverlap: 50,
  });

  const chunks = await splitter.splitText(text);

  const collection = process.env.QDRANT_COLLECTION;

  if (!collection) {
    throw new Error("Collection is not defined!!");
  }
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
      collection,
    });
  }
}

export async function getContextFromQuery(
  query: string,
  documentIds: string[] = [],
  limit = 5
) {
  try {
    const queryVector = await getEmbeddings(query);
    return await searchQdrant(queryVector, documentIds, limit);
  } catch (e: any) {
    throw new Error(`Error in getContextFromQuery: ${e.message}`);
  }
}
