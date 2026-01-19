"use client";

import { Sidebar } from "./Sidebar";
import { ScrollShadow } from "@heroui/react";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen w-full bg-background overflow-hidden">
      {/* Sidebar - Hidden on mobile, handled via drawer in future or simple responsive hide for now */}
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <ScrollShadow className="h-full w-full overflow-auto">
          {children}
        </ScrollShadow>
      </main>
    </div>
  );
}
