import { create } from "zustand";
import { Message } from "../pages/Home";

export interface ChatHistory {
  id: string;
  createdAt?: string;
  messages: Message[];
}

interface ChatStore {
  messages: Message[];
  chatHistory: ChatHistory[];
  isLoading: boolean;
  sessionId: string | null;
  addMessage: (message: Message) => void;
  setMessages: (messages: Message[]) => void;
  setChatHistory: (chatHistory: ChatHistory[]) => void;
  clearHistory: () => void;
  setLoading: (loading: boolean) => void;
}

export const useChatStore = create<ChatStore>((set) => ({
  messages: [],
  sessionId: null,
  chatHistory: [],
  isLoading: false,

  addMessage: (message) =>
    set((state) => ({
      messages: [...state.messages, message],
    })),

  setMessages: (messages) => set({ messages }),

  setChatHistory: (chatHistory) => set({ chatHistory }),

  clearHistory: () =>
    set((state) => {
      if (state.sessionId) {
        const currentChat = state.chatHistory.find(
          (chat) => chat.id === state.sessionId
        );
        return { chatHistory: currentChat ? [currentChat] : [] };
      } else {
        return { chatHistory: [] };
      }
    }),

  setLoading: (loading) => set({ isLoading: loading }),
}));
