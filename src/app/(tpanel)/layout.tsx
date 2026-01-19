import { DashboardShell } from "@/components/tpanel/DashboardShell";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Teacher Dashboard | TeachersPortal",
  description: "Manage your exams and students",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardShell>{children}</DashboardShell>;
}
