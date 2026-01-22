"use client";

import { useSidebarResize } from "@/hooks/useSidebarResizer";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  PlusCircle,
  LogOut,
  Tags,
} from "lucide-react";
import { usePathname } from "next/navigation";
import {
  Button,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  User,
} from "@heroui/react";
import { cn } from "@heroui/react";
import { useRouter } from "@/hooks/useRouter";
import { useAuthStore } from "@/store/auth-store";
import { useAuthNavigator } from "@/hooks/useAuthNavigator";

const NAV_ITEMS = [
  {
    id: "dashboard",
    label: "Dashboard",
    href: "/tpanel",
    icon: LayoutDashboard,
  },
  {
    id: "create-exam",
    label: "Create Exam",
    href: "/tpanel/create",
    icon: PlusCircle,
  },
  {
    id: "categories",
    label: "Categories",
    href: "/tpanel/categories",
    icon: Tags,
  },
];

export function Sidebar() {
  const router = useRouter();
  const { sidebarRef, startResizing, sidebarWidth } = useSidebarResize();
  const pathname = usePathname();
  const { user } = useAuthStore();
  const authNavigator = useAuthNavigator();

  const handleLogout = async () => {
    await authNavigator.signOut();
    authNavigator.signIn();
  };

  return (
    <motion.aside
      initial={false}
      animate={{
        width: sidebarWidth,
      }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="h-full border-r border-sidebar-border flex flex-col relative overflow-hidden z-50 bg-sidebar"
      ref={sidebarRef as React.RefObject<HTMLDivElement>}
    >
      <div
        ref={sidebarRef}
        className="relative flex flex-col h-screen bg-sidebar border-r border-sidebar-border"
        style={{ width: sidebarWidth }}
      >
        <div className="flex items-center justify-center px-4 border-b border-sidebar-border/50 py-4">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <img
              src="/logo.svg"
              alt="TeachersPortal Logo"
              className="w-full h-10"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1 px-2 py-4">
          <div className="px-2 mb-2">
            <span className="text-xs font-semibold text-sidebar-muted-foreground uppercase tracking-wider">
              Explorer
            </span>
          </div>
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Button
                key={item.id}
                onPress={() => router.push(item.href)}
                className={cn(
                  "justify-start px-3 py-2 text-sm font-medium transition-all duration-200 w-full rounded-lg group relative",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-primary"
                    : "text-sidebar-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-foreground custom-hover",
                )}
                variant="light"
                radius="sm"
              >
                {isActive && (
                  <motion.div
                    layoutId="active-nav"
                    className="absolute inset-0 bg-sidebar-accent rounded-lg z-0"
                    transition={{ duration: 0.2 }}
                  />
                )}
                <Icon size={18} className="relative z-10" />
                <span className="relative z-10">{item.label}</span>
              </Button>
            );
          })}
        </div>

        <div className="mt-auto border-t border-sidebar-border bg-sidebar-accent/20 p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 w-full">
              <Dropdown placement="top-start" className="w-full">
                <DropdownTrigger>
                  <Button
                    variant="flat"
                    radius="sm"
                    className="w-full justify-start min-h-auto h-14 p-2 bg-transparent"
                  >
                    <User
                      name={user?.name}
                      description={user?.email}
                      avatarProps={{
                        src:
                          user?.image ||
                          `/avatar?seed=${`${user?.name}:${user?.email}:${user?.id}`}`,
                      }}
                    />
                  </Button>
                </DropdownTrigger>
                <DropdownMenu
                  aria-label="Settings Actions"
                  disabledKeys={["settings", "help"]}
                  className="w-56"
                  variant="flat"
                >
                  <DropdownItem
                    key="logout"
                    className="text-danger"
                    color="danger"
                    onPress={handleLogout}
                    startContent={<LogOut size={16} />}
                  >
                    Log Out
                  </DropdownItem>
                </DropdownMenu>
              </Dropdown>
            </div>
          </div>
        </div>

        {/* Resizer Handle */}
        <div
          className="absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-sidebar-primary/25 transition-all duration-100 z-10"
          onMouseDown={startResizing}
        />
      </div>
    </motion.aside>
  );
}
