import express from "express";
import { registerUser, loginUser, verifyToken, clerkSignIn } from "../controllers/auth.controller";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/verify", verifyToken);
router.post("/clerk", clerkSignIn);

export default router;
