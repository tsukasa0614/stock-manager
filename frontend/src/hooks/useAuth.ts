import { create } from "zustand";

interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "user";
}

interface AuthState {
  user: User | null;
  setUser: (user: User | null) => void;
}

export const useAuth = create<AuthState>((set) => ({
  user: {
    id: "1",
    name: "管理者",
    email: "admin@example.com",
    role: "admin",
  },
  setUser: (user) => set({ user }),
})); 