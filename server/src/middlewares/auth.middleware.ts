import { ExpressContext } from "apollo-server-express";
import jwt from "jsonwebtoken";
import { prisma } from "../app";
import { JWT_SECRET } from "../utils/jwt.utils";
import { NextFunction, Request, Response } from "express";

const findCurrentUser = async (authorization: string) => {
  const token = authorization.split("Bearer ")[1];
  try {
    const decoded: any = jwt.verify(token, JWT_SECRET);
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
    });

    if (user && user.isActive) {
      return user;
    }
  } catch (error) {
    // Token invalid or expired
    return null;
  }
};

export const context = async ({ req }: ExpressContext) => {
  const authHeader = req.headers.authorization;
  let currentUser = null;

  if (authHeader) {
    return {
      currentUser: await findCurrentUser(authHeader),
    };
  }

  return {
    currentUser,
  };
};

export const attachCurrentUserMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (authHeader) {
    req.currentUser = await findCurrentUser(authHeader);
  }

  next(); // Proceed to the next middleware or route
};
