import { User } from "@prisma/client";
import * as express from "express";

declare global {
  namespace Express {
    interface Request {
      currentUser?: User | null;
    }
    interface Response {
      flush: () => void;
    }
  }
}
