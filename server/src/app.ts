import express, { Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import { PrismaClient } from "@prisma/client";
import morgan from "morgan";
import { ApolloServer } from "apollo-server-express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Express Routes
import authRoutes from "./routes/auth.route";

// GraphQL imports
import resolvers from "./graphql/resolvers";
import { context } from "./middlewares/auth.middleware";

const app = express();
const PORT = process.env.PORT || 4000;

app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));

export const prisma = new PrismaClient();

// ES module-compatible __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read GraphQL schema from file
const typeDefs = fs.readFileSync(
  path.join(__dirname, "graphql", "schema.graphql"),
  "utf8"
);

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context,
});
await server.start();
server.applyMiddleware({ app, path: "/graphql" });

app.get("/", (req: Request, res: Response) => {
  res.send(
    "Wellcome dear friend, to AI Chatbot backend. There isn't much here for you, but you can check my GitHub for the codes: https://github.com/alisalehi6990"
  );
});

app.use("/auth", authRoutes);

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
