import { Response, Request } from "express";
import { prisma } from "../app";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../utils/jwt.utils";
import { Role } from "@prisma/client";

export const registerUser = async (req: Request, res: Response) => {
  const { displayName, email, password } = req.body;

  try {
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      res.status(400).json({ message: "User already exists" });
      return;
    }

    // Create new user
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        displayName,
        role: Role.USER,
        inputTokens: 0,
        outputTokens: 0,
        quota: 1000,
      },
    });

    res.status(201).json({ message: "User created. Awaiting admin approval." });
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const loginUser = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        displayName: true,
        role: true,
        password: true,
        isActive: true,
        inputTokens: true,
        outputTokens: true,
        quota: true,
        chatHistories: {
          select: {
            id: true,
            messages: true,
            createdAt: true,
            documents: {
              select: {
                id: true,
                name: true,
                type: true,
                sizeText: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
          take: 5,
        },
      },
    });

    if (!user || !user.password) {
      res.status(400).json({ message: "Invalid credentials" });
    } else if (!user.isActive) {
      res.status(403).json({ message: "Account is not active" });
    } else {
      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!isPasswordValid) {
        res.status(400).json({ message: "Invalid credentials" });
      } else {
        // Generate JWT token
        const token = jwt.sign({ id: user.id }, JWT_SECRET, {
          expiresIn: "1d",
        });

        user.chatHistories.forEach((chat) => {
          chat.messages = (chat.messages as any[]).map((message) => ({
            content: message.content,
            documents: message.documents,
            isUser: message.role === "human",
          }));
        });
        res.status(200).json({
          user: {
            displayName: user.displayName,
            role: user.role,
            isActive: user.isActive,
            chatHistories: user.chatHistories,
            inputTokens: user.inputTokens,
            outputTokens: user.outputTokens,
            quota: user.quota,
          },
          token,
          message: "Login successful",
        });
      }
    }
  } catch (error) {
    console.error("Error logging in user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const verifyToken = async (req: Request, res: Response) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    res.status(401).json({ message: "No token provided" });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        email: true,
        displayName: true,
        role: true,
        inputTokens: true,
        outputTokens: true,
        quota: true,
        isActive: true,
        chatHistories: {
          select: {
            id: true,
            messages: true,
            createdAt: true,
            documents: {
              select: {
                id: true,
                name: true,
                type: true,
                sizeText: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
          take: 5,
        },
      },
    });

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    if (!user.isActive) {
      res.status(403).json({ message: "Account is not active" });
      return;
    }
    user.chatHistories.forEach(
      (chat) =>
        (chat.messages = (chat.messages as any[]).map((message) => ({
          content: message.content,
          documents: message.documents,
          isUser: message.role === "human",
        })))
    );
    res.status(200).json({ user });
  } catch (error) {
    console.error("Error verifying token:", error);
    res.status(401).json({ message: "Invalid token" });
  }
};

export const clerkSignIn = async (req: Request, res: Response) => {
  const { clerkId, email, displayName } = req.body;

  try {
    let user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        clerkId: true,
        email: true,
        displayName: true,
        role: true,
        isActive: true,
        inputTokens: true,
        outputTokens: true,
        quota: true,
        chatHistories: {
          select: {
            id: true,
            messages: true,
            createdAt: true,
            documents: {
              select: {
                id: true,
                name: true,
                type: true,
                sizeText: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
          take: 5,
        },
      },
    });

    if (!user) {
      const createdUser = await prisma.user.create({
        data: {
          clerkId,
          email,
          displayName,
          role: Role.USER,
          isActive: true,
          inputTokens: 0,
          outputTokens: 0,
          quota: 1000,
        },
      });
      user = { ...createdUser, chatHistories: [] };
    } else if (!user.clerkId) {
      await prisma.user.update({
        where: { email },
        data: { clerkId, isActive: true },
      });
      user.isActive = true;
    }

    if (!user.isActive) {
      res.status(403).json({ message: "Account is not active" });
      return;
    }
    const token = jwt.sign({ id: user.id }, JWT_SECRET, {
      expiresIn: "1d",
    });

    res.status(200).json({
      token,
      user: {
        email,
        displayName: user.displayName,
        isActive: user.isActive,
        role: user.role,
      },
      message: "Login successful",
    });
  } catch (error) {
    console.error("Error signing in with Clerk:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
