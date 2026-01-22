"use client";

import { HeroUIProvider, ToastProvider } from "@heroui/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, useEffect, Suspense } from "react";
import { GlobalShortcutProvider } from "./GlobalShortcutProvider";
import { useAuthStore } from "@/store/auth-store";
import { Progress } from "@/lib/progress";
import { ConfirmProvider } from "./ConfirmProvider";

export default function Provider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  const { syncSession } = useAuthStore();

  useEffect(() => {
    syncSession();
  }, [syncSession]);

  return (
    <HeroUIProvider>
      <QueryClientProvider client={queryClient}>
        <GlobalShortcutProvider>
          <ConfirmProvider>
            <Suspense fallback={null}>
              <Progress />
            </Suspense>
            <ToastProvider />
            {children}
          </ConfirmProvider>
        </GlobalShortcutProvider>
      </QueryClientProvider>
    </HeroUIProvider>
  );
}
