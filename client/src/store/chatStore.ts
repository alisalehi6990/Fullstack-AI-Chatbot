import { Message } from "@/types/chat";
import { create } from "zustand";

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
  updateMessage: (message: Message, index: number) => void;
  setChatHistory: (chatHistory: ChatHistory[]) => void;
  addChatHistory: (chat: ChatHistory) => void;
  clearHistory: () => void;
  setLoading: (loading: boolean) => void;
  setSession: (sessionId: string | null) => void;
}

export const useChatStore = create<ChatStore>((set) => ({
  messages: [],
  sessionId: null,
  chatHistory: [],
  isLoading: false,

  setChatHistory: (chatHistory) => set({ chatHistory }),

  addChatHistory: (chat) =>
    set((state) => ({ chatHistory: [chat, ...state.chatHistory] })),

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

  setSession: (sessionId) =>
    set((state) => {
      if (!sessionId) {
        return {
          sessionId: null,
          messages: [],
        };
      }
      const existingSession = state.chatHistory.find(
        (chat) => chat.id === sessionId
      );
      return {
        sessionId: existingSession ? sessionId : null,
        messages: existingSession ? existingSession.messages : [],
      };
    }),

  addMessage: (message) =>
    set((state) => ({
      messages: [...state.messages, message],
      chatHistory: state.chatHistory.map((chat) =>
        chat.id === state.sessionId
          ? { ...chat, messages: [...chat.messages, message] }
          : chat
      ),
    })),

  updateMessage: (newMessage, index) =>
    set((state) => ({
      messages: state.messages.map((message, i) =>
        i === index ? newMessage : message
      ),
    })),
  setMessages: (messages) => set({ messages }),

  setLoading: (loading) => set({ isLoading: loading }),
}));
