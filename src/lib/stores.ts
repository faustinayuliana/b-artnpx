import { create } from "zustand";

export interface UserState {
  id: string;
  email: string;
  username: string;
  role: string;
  avatar?: string | null;
  bio?: string | null;
  wallet: number;
  badge?: string | null;
}

interface AuthStore {
  user: UserState | null;
  isGuest: boolean;
  setUser: (user: UserState | null) => void;
  setGuest: (value: boolean) => void;
  reset: () => void;
}

interface CartStore {
  count: number;
  setCount: (value: number) => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isGuest: false,
  setUser: (user) => set({ user, isGuest: false }),
  setGuest: (value) => set({ isGuest: value, user: null }),
  reset: () => set({ user: null, isGuest: false }),
}));

export const useCartStore = create<CartStore>((set) => ({
  count: 0,
  setCount: (value) => set({ count: value }),
}));
