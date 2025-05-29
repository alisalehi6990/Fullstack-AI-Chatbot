import { ChatHistory } from "@/store/chatStore";

export interface AuthFormData {
  email: string;
  password: string;
  confirmPassword?: string;
  displayName?: string;
}
export interface User {
  id: string;
  email: string;
  displayName?: string;
  role: string;
  isActive: boolean;
  chatHistories?: ChatHistory[];
  usedToken: number;
  quota: number;
}
