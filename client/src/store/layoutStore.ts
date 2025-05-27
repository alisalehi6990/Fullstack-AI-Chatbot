import { create } from "zustand";

interface LayoutStore {
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
}

export const useLayoutStore = create<LayoutStore>((set) => ({
  isSidebarOpen: false,
  setIsSidebarOpen: (open) => set({ isSidebarOpen: open }),
}));
