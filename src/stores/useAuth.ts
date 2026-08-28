import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { AuthSession, AuthUser } from "../types/auth";

type AuthStore = {
  token: string | null;
  user: AuthUser | null;
  login: (session: AuthSession) => void;
  setUser: (user: AuthUser) => void;
  logout: () => void;
};

export const useAuth = create<AuthStore>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      login: (session) => set(session),
      setUser: (user) => set({ user }),
      logout: () => set({ token: null, user: null }),
    }),
    { name: "polaris-auth" },
  ),
);
