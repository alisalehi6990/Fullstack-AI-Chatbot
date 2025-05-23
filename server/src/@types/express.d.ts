import * as express from "express";

declare global {
  namespace Express {
    interface Request {
      currentUser?: any;
    }
    interface Response {
      flush: () => void;
    }
  }
}
