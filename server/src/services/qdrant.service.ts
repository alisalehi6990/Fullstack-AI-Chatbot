import { QdrantClient } from "@qdrant/js-client-rest";
import "dotenv/config";

export async function getClient() {
  if (!process.env.QDRANT_URL || !process.env.QDRANT_API_KEY) {
    throw new Error(
      "Qdrant URL and API key must be set in environment variables."
    );
  }

  const qdrantClient = new QdrantClient({
    url: process.env.QDRANT_URL,
    apiKey: process.env.QDRANT_API_KEY,
  });
  // const collection = process.env.QDRANT_COLLECTION;
  // if (!collection) {
  //   throw new Error("Collection is not defined!!");
  // }
  // await qdrantClient.collectionExists(collection).then((response) => {
  //   if (!response.exists) {
  //     qdrantClient
  //     .createCollection(collection, {
  //       vectors: { size: 1024, distance: "Cosine" },
  //     })
  //     .then((response) => {
  //       console.log("Collection created:", response);
  //     })
  //     .catch((error) => {
  //       console.error("Error creating collection:", error.data.status.error);
  //     });
  //   }
  // });

  return qdrantClient;
}

export async function addPointToQdrant(data: {
  id: number | string;
  vector: number[];
  payload:
    | Record<string, unknown>
    | {
        [key: string]: unknown;
      }
    | null
    | undefined;
  collection: string;
}) {
  const { id, vector, payload, collection } = data;
  if (!id || !vector || !payload || !collection) {
    console.error("Missing required fields: id, vector, payload, collection");
    return;
  }
  const qdrantClient = await getClient();
  qdrantClient
    .upsert(collection, {
      wait: true,
      points: [
        {
          id,
          vector,
          payload,
        },
      ],
    })
    .catch((error) => {
      console.error("Error upserting data:", error.data.status.error);
    });
}

export async function removeDocumentFromQdrant(documentId: string) {
  const client = await getClient();
  const collection = process.env.QDRANT_COLLECTION;
  if (!collection) {
    throw new Error("Collection is not defined!!");
  }
  await client
    .delete(collection, {
      filter: {
        must: [{ key: "documentId", match: { value: documentId } }],
      },
    })
    .catch((error) => {
      console.error("Error removing document:", error.data.status.error);
    });
}

export async function searchQdrant(
  queryVector: number[],
  documentIds: string[],
  limit = 5
) {
  const client = await getClient();
  const collection = process.env.QDRANT_COLLECTION;
  if (!collection) {
    throw new Error("Collection is not defined!!");
  }
  let options: { vector: number[]; limit: number; filter?: any } = {
    vector: queryVector,
    limit,
  };
  if (documentIds && documentIds.length > 0) {
    options.filter = {
      should: documentIds.map((docId) => ({
        key: "documentId",
        match: { value: docId },
      })),
    };
  }

  const result = await client.search(collection, options);
  return result.map((r) => r.payload?.text).filter(Boolean);
}
