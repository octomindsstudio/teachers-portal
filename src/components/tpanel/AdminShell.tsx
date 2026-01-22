"use client";

import { useState, useEffect } from "react";
import { Sidebar } from "@/components/tpanel/Sidebar";
import { Button } from "@heroui/react";
import { Menu } from "lucide-react";

export default function AdminShell({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background text-foreground flex">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Wrapper */}
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ease-in-out md:ml-64`}
      >
        <main className="flex-1 p-6 md:p-10 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
