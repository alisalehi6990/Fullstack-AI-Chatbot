import { User } from "@/types/auth";
import { Message } from "@/types/chat";
import { create } from "zustand";

type Chat = {
  id: string;
  messages: Message[];
};

interface AuthStore {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  login: (user: User, token: string) => void;
  logout: () => void;
  addUserChatHistory: (chat: Chat) => void;
  updateUsedToken: (usedToken: number) => void;
  updateQuota: (quota: number) => void;
}

export const useAuthStore = create<AuthStore>()((set) => ({
  isAuthenticated: false,
  token: null,
  user: null,
  login: (user, token) => {
    localStorage.setItem("token", token);
    set({ isAuthenticated: true, user, token });
  },
  logout: () => {
    localStorage.removeItem("token");
    set({ isAuthenticated: false, user: null, token: null });
  },
  addUserChatHistory: (chat) => {
    set((state) => {
      if (state.user?.chatHistories) {
        state.user?.chatHistories.push(chat);
      } else if (state.user) {
        state.user.chatHistories = [chat];
      }
      return state;
    });
  },
  updateUsedToken: (usedToken) =>
    set((state) => ({
      user: state.user ? { ...state.user, usedToken } : state.user,
    })),
  updateQuota: (quota) =>
    set((state) => ({
      user: state.user ? { ...state.user, quota } : state.user,
    })),
}));
