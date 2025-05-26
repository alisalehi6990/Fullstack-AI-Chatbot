import { create } from "zustand";
import { Message } from "../pages/Home";

type Chat = {
  id: string;
  messages: Message[];
};
interface User {
  email: string;
  displayName?: string;
  isActive: boolean;
  role: string;
  chatHistories?: Chat[];
}

interface AuthStore {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  login: (user: User, token: string) => void;
  logout: () => void;
  addUserChatHistory: (chat: Chat) => void;
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
}));
