import { Message } from "@/types/chat";
import { create } from "zustand";

type Chat = {
  id: string;
  messages: Message[];
};
interface User {
  id: string;
  email: string;
  displayName?: string;
  isActive: boolean;
  role: string;
  chatHistories?: Chat[];
}

interface AuthState {
  user: User | null;
  token: string | null;
  setUser: (user: User | null | undefined, token: string | null) => void;
  clearUser: () => void;
  addUserChatHistory: (chat: Chat) => void;
}

export const useUserStore = create<AuthState>((set) => ({
  user: null,
  token: localStorage.getItem("token"),
  setUser: (user, token) => {
    if (token) localStorage.setItem("token", token);
    set({ user, token });
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
  clearUser: () => {
    localStorage.removeItem("token");
    set({ user: null, token: null });
  },
}));
