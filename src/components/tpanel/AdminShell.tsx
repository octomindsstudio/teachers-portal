"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/tpanel/Sidebar";
import { Button } from "@heroui/react";
import { Menu } from "lucide-react";

export default function AdminShell({
  children,
  user,
}: {
  children: React.ReactNode;
  user?: any;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Auto-collapse on mobile on mount
  useEffect(() => {
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} user={user} />

      {/* Main Content Wrapper */}
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ease-in-out ${
          sidebarOpen ? "md:ml-64" : "md:ml-20"
        }`}
      >
        {/* Mobile Header */}
        <header className="h-16 flex items-center px-4 border-b border-divider md:hidden bg-background/80 backdrop-blur-md sticky top-0 z-40">
          <Button
            isIconOnly
            variant="light"
            onPress={() => setSidebarOpen(!sidebarOpen)}
          >
            <Menu size={24} />
          </Button>
          <span className="ml-4 font-bold text-lg">Admin Portal</span>
        </header>

        <main className="flex-1 p-6 md:p-10 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
