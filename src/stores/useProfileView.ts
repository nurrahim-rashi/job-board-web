import { create } from "zustand";
import { persist } from "zustand/middleware";

type ProfileViewStore = {
  userId: number | null;
  openProfile: (userId: number) => void;
};

export const useProfileView = create<ProfileViewStore>()(persist(
  (set) => ({ userId: null, openProfile: (userId) => set({ userId }) }),
  { name: "polaris-profile-view" },
));
