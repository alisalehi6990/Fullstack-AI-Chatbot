import express, { Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import { PrismaClient } from "@prisma/client";
import morgan from "morgan";

const app = express();
const PORT = process.env.PORT || 4000;

app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));

const prisma = new PrismaClient();

app.get("/", (req: Request, res: Response) => {
  res.send("Hello from ChatBot Backend!");
});


app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
