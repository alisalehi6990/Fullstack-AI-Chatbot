import { QdrantClient } from "@qdrant/js-client-rest";
import "dotenv/config";

async function getClient() {
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

async function addPointToQdrant(data: {
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
    .then((response) => {
      console.log("Upserted data:", response);
    })
    .catch((error) => {
      console.error("Error upserting data:", error.data.status.error);
    });
}

async function searchQdrant(queryVector: number[], limit = 5) {
  const client = await getClient();
  const collection = process.env.QDRANT_COLLECTION;
  if (!collection) {
    throw new Error("Collection is not defined!!");
  }
  const result = await client.search(collection, {
    vector: queryVector,
    limit,
  });

  return result.map((r) => r.payload?.text).filter(Boolean);
}

export { getClient, addPointToQdrant, searchQdrant };
