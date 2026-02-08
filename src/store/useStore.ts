import { create } from "zustand";

interface AppState {
  isCartOpen: boolean;
  toggleCart: () => void;
  // Add more state here as needed
}

export const useStore = create<AppState>((set) => ({
  isCartOpen: false,
  toggleCart: () => set((state) => ({ isCartOpen: !state.isCartOpen })),
}));
