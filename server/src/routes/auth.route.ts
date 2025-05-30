import express, { Request, Response, NextFunction } from "express";
import { registerUser, loginUser, verifyToken, clerkSignIn } from "../controllers/auth.controller";
import { handleError, createError } from "../utils/errorHandler";

const router = express.Router();

router.post("/register", async (req: Request, res: Response, next: NextFunction) => {
  try {
    await registerUser(req, res);
  } catch (error: any) {
    handleError(error, {
      functionName: "register",
      additionalInfo: { email: req.body.email }
    });
    res.status(error.statusCode || 500).json({ 
      message: error.message || "An unexpected error occurred" 
    });
  }
});

router.post("/login", async (req: Request, res: Response, next: NextFunction) => {
  try {
    await loginUser(req, res);
  } catch (error: any) {
    handleError(error, {
      functionName: "login",
      additionalInfo: { email: req.body.email }
    });
    res.status(error.statusCode || 500).json({ 
      message: error.message || "An unexpected error occurred" 
    });
  }
});

router.get("/verify", async (req: Request, res: Response, next: NextFunction) => {
  try {
    await verifyToken(req, res);
  } catch (error: any) {
    handleError(error, {
      functionName: "verifyToken",
      additionalInfo: { token: req.headers.authorization }
    });
    res.status(error.statusCode || 500).json({ 
      message: error.message || "An unexpected error occurred" 
    });
  }
});

router.post("/clerk", async (req: Request, res: Response, next: NextFunction) => {
  try {
    await clerkSignIn(req, res);
  } catch (error: any) {
    handleError(error, {
      functionName: "clerkSignIn",
      additionalInfo: { token: req.body.token }
    });
    res.status(error.statusCode || 500).json({ 
      message: error.message || "An unexpected error occurred" 
    });
  }
});

export default router;
