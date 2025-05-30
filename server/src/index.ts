import express, { Application, Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import { PrismaClient } from "@prisma/client";
import morgan from "morgan";
import { ApolloServer } from 'apollo-server-express';
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import compression from "compression";
// Express Routes
import authRoutes from "./routes/auth.route.js";
import chatRouter from "./routes/chat.route.js";

// GraphQL imports
import resolvers from "./graphql/resolvers.js";
import {
  attachCurrentUserMiddleware,
  context,
} from "./middlewares/auth.middleware.js";

const app: any = express();
const PORT = process.env.PORT || 4000;

// Polyfill for res.flush (for SSE, if not present)
(app as Application).use((req, res, next) => {
  if (typeof res.flush !== "function") {
    res.flush = () => {};
  }
  next();
});

app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));
app.use(compression());

export const prisma = new PrismaClient();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read GraphQL schema from file
const typeDefs = fs.readFileSync(
  path.join(__dirname, "graphql", "schema.graphql"),
  "utf8"
);

const startServer = async () => {
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

  app.use(attachCurrentUserMiddleware);

  app.use("/auth", authRoutes);
  app.use("/chat", chatRouter);

  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
};

startServer().catch((err) => {
  console.error("Failed to start server:", err);
});

export default app;
