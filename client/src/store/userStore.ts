import { create } from "zustand";

interface User {
  id: string;
  email: string;
  displayName?: string;
  role: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  setUser: (user: User | null | undefined, token: string | null) => void;
  clearUser: () => void;
}

export const useUserStore = create<AuthState>((set) => ({
  user: null,
  token: localStorage.getItem("token"),
  setUser: (user, token) => {
    if (token) localStorage.setItem("token", token);
    set({ user, token });
  },
  clearUser: () => {
    localStorage.removeItem("token");
    set({ user: null, token: null });
  },
}));
