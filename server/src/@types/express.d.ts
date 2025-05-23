import * as express from "express";

declare global {
  namespace Express {
    interface Request {
      currentUser?: any; // Replace `any` with your user type if available
    }
    interface Response {
      flush: () => void;
    }
  }
}
