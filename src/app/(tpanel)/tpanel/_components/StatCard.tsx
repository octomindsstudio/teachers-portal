"use client";

import { Card, CardBody, cn } from "@heroui/react";
import { ReactNode } from "react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  trend?: string;
  trendUp?: boolean;
  color?: "primary" | "secondary" | "success" | "warning" | "danger";
}

export const StatCard = ({
  title,
  value,
  icon,
  trend,
  trendUp,
  color = "primary",
}: StatCardProps) => {
  const colorStyles = {
    primary: "bg-blue-500/10 text-blue-500",
    secondary: "bg-purple-500/10 text-purple-500",
    success: "bg-emerald-500/10 text-emerald-500",
    warning: "bg-orange-500/10 text-orange-500",
    danger: "bg-rose-500/10 text-rose-500",
  };

  return (
    <Card className="border-none shadow-sm hover:shadow-md transition-shadow">
      <CardBody className="p-6">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-small font-bold text-default-400 uppercase tracking-wider mb-2">
              {title}
            </p>
            <h3 className="text-3xl font-black text-default-900">{value}</h3>
          </div>
          <div className={cn("p-3 rounded-xl", colorStyles[color])}>{icon}</div>
        </div>
        {trend && (
          <div
            className={cn(
              "mt-4 text-xs font-semibold flex items-center gap-1",
              trendUp ? "text-emerald-500" : "text-rose-500",
            )}
          >
            {trendUp ? "↑" : "↓"} {trend}{" "}
            <span className="text-default-400 font-normal">vs last month</span>
          </div>
        )}
      </CardBody>
    </Card>
  );
};
