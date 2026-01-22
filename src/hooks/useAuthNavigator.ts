import { useRouter } from "@/hooks/useRouter";
import { authClient } from "@/lib/auth-client";
import { useAuthStore } from "@/store/auth-store";

export const useAuthNavigator = () => {
  const router = useRouter();
  const { resetStore } = useAuthStore();

  const navigate = (url: string, callbackUrl?: string) => {
    if (typeof window === "undefined") return;
    const target = new URL(url, window.location.origin);
    target.searchParams.set("callbackUrl", callbackUrl || window.location.href);
    router.push(`${target.pathname}${target.search}`);
  };

  return {
    signIn: (url?: string, options?: { callbackUrl?: string }) =>
      navigate(url || "/signin", options?.callbackUrl),
    signUp: (url?: string, options?: { callbackUrl?: string }) =>
      navigate(url || "/signup", options?.callbackUrl),
    signOut: async (options?: { callbackUrl?: string }) => {
      if (typeof window === "undefined") return;
      await authClient.signOut({
        fetchOptions: {
          onSuccess: () => {
            resetStore();
            router.push(options?.callbackUrl || "/");
            router.refresh();
          },
        },
      });
    },
  };
};
