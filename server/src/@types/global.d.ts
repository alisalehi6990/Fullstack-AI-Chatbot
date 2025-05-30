enum Role {
  USER = "USER",
  ADMIN = "ADMIN",
}

interface User {
  id: string;
  email?: string;
  password?: string;
  displayName?: string;
  isActive: boolean;
  clerkId?: string;
  role: Role;
  createdAt: Date;
  updatedAt: Date;
  chatHistories: ChatHistory[];
}

interface ChatHistory {
  id: string;
  userId: string;
  user: User;
  messages: any;
  createdAt: Date;
  updatedAt: Date;
}

type Prompt = {
  role: string;
  content: string;
};

export {};
