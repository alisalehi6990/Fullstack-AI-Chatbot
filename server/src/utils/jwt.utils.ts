import jwt from "jsonwebtoken";

export const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-here";