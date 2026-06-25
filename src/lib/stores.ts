import { create } from "zustand";
import { persist } from "zustand/middleware";

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

interface PreferencesStore {
  theme: "light" | "dark" | "system";
  language: "en" | "id";
  setTheme: (theme: "light" | "dark" | "system") => void;
  setLanguage: (language: "en" | "id") => void;
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

export const usePreferencesStore = create<PreferencesStore>()(
  persist(
    (set) => ({
      theme: "dark", // default premium theme
      language: "en", // default language
      setTheme: (theme) => set({ theme }),
      setLanguage: (language) => set({ language }),
    }),
    {
      name: "b-art-preferences",
    }
  )
);
