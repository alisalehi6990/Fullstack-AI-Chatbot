import { ExpressContext } from "apollo-server-express";
import jwt from "jsonwebtoken";
import { prisma } from "../app";
import { JWT_SECRET } from "../utils/jwt.utils";

export const context = async ({ req }: ExpressContext) => {
  const authHeader = req.headers.authorization;
  let currentUser = null;

  if (authHeader) {
    const token = authHeader.split("Bearer ")[1];
    try {
      const decoded: any = jwt.verify(token, JWT_SECRET);
      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
      });

      if (user && user.isActive) {
        currentUser = user;
      }
    } catch (error) {
      // Token invalid or expired
    }
  }

  return {
    currentUser,
  };
};
