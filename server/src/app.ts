import express, { Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import { PrismaClient } from "@prisma/client";
import morgan from "morgan";
import authRoutes from "./routes/auth.route";

const app = express();
const PORT = process.env.PORT || 4000;

app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));

export const prisma = new PrismaClient();

app.get("/", (req: Request, res: Response) => {
  res.send("Hello from ChatBot Backend!");
});

app.use("/auth", authRoutes);

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
