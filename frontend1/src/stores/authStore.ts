import { create } from "zustand";

export interface User {
  id: string;
  name: string;
  email: string;
  profession?: string;
  skills?: string[];
  coins?: number;
  createdAt: string;
  updatedAt?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  setUser: (user: User) => void;
  setToken: (token: string) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()((set) => ({
  user: null,
  token: typeof window !== "undefined" ? localStorage.getItem("token") : null,
  setUser: (user) => set({ user }),
  setToken: (token) => {
    set({ token });
    // Save to localStorage
    localStorage.setItem("token", token);
  },
  clearAuth: () => {
    set({ user: null, token: null });
    localStorage.removeItem("token");
  },
}));
