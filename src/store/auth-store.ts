import { create } from "zustand";
import { authClient } from "@/lib/auth-client";
import { AuthState, User } from "@/types/auth";

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  session: null,
  isLoading: true,
  setUser: (user) => set({ user }),
  setSession: (session) => set({ session }),
  syncSession: async () => {
    set({ isLoading: true });
    try {
      const { data } = await authClient.getSession();
      if (data) {
        set({ user: data.user as User, session: data.session });
      } else {
        set({ user: null, session: null });
      }
    } catch (error) {
      console.error("Failed to sync session:", error);
      set({ user: null, session: null });
    } finally {
      set({ isLoading: false });
    }
  },
  resetStore: () => set({ user: null, session: null }),
}));
