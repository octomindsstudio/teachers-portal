"use client";

import { Button, User, Tooltip } from "@heroui/react";
import {
  LayoutDashboard,
  FilePlus2,
  LogOut,
  Sun,
  Moon,
  Menu,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { clsx } from "clsx";
import { authClient } from "@/lib/auth-client";

export default function Sidebar({
  isOpen,
  setIsOpen,
  user,
}: {
  isOpen: boolean;
  setIsOpen: (v: boolean) => void;
  user?: any;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();

  const handleLogout = async () => {
    await authClient.signOut();
    router.push("/login");
  };

  const menuItems = [
    { name: "Dashboard", icon: LayoutDashboard, href: "/admin" },
    { name: "Create Exam", icon: FilePlus2, href: "/admin/create" },
  ];

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <aside
      className={clsx(
        "fixed z-50 h-screen bg-background/80 backdrop-blur-xl border-r border-divider transition-all duration-300 ease-in-out flex flex-col",
        isOpen ? "w-64" : "w-20 hidden md:flex",
      )}
    >
      {/* Header */}
      <div className="h-20 flex items-center justify-between px-6 border-b border-divider">
        {isOpen && (
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
            Portal.
          </span>
        )}
        <Button
          isIconOnly
          variant="light"
          onPress={() => setIsOpen(!isOpen)}
          className="md:hidden"
        >
          <Menu size={20} />
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Tooltip
              key={item.href}
              content={!isOpen ? item.name : ""}
              placement="right"
            >
              <Link
                href={item.href}
                className={clsx(
                  "flex items-center gap-3 px-4 py-3 rounded-xl transition-colors",
                  isActive
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-foreground/70 hover:bg-default-100 hover:text-foreground",
                )}
              >
                <item.icon size={22} />
                {isOpen && <span>{item.name}</span>}
              </Link>
            </Tooltip>
          );
        })}
      </nav>

      {/* Footer / User Profile */}
      <div className="p-4 border-t border-divider space-y-4">
        <div
          className={clsx(
            "flex items-center gap-2",
            !isOpen && "justify-center",
          )}
        >
          <Button isIconOnly variant="flat" onPress={toggleTheme}>
            {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
          </Button>
          {isOpen && (
            <span className="text-xs text-default-500">Switch Theme</span>
          )}
        </div>

        <div
          className={clsx(
            "flex items-center gap-3",
            !isOpen && "justify-center",
          )}
        >
          {isOpen ? (
            <User
              name={user?.name || "Admin"}
              description={user?.email || "Teacher"}
              avatarProps={{
                src:
                  user?.image ||
                  "https://i.pravatar.cc/150?u=a042581f4e29026704d",
              }}
            />
          ) : (
            <Tooltip content={user?.name || "Admin"} placement="right">
              {user?.image ? (
                <img src={user.image} className="w-8 h-8 rounded-full" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-yellow-400 to-orange-500" />
              )}
            </Tooltip>
          )}
        </div>

        {isOpen && (
          <Button
            onPress={handleLogout}
            color="danger"
            variant="flat"
            startContent={<LogOut size={18} />}
            className="w-full"
          >
            Log Out
          </Button>
        )}
      </div>
    </aside>
  );
}
