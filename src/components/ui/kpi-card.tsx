import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface KPICardProps {
  title: string;
  value: string | number;
  trend?: {
    value: number;
    isPositive: boolean;
    label?: string;
  };
  icon?: LucideIcon;
  className?: string;
}

export function KPICard({ title, value, trend, icon, className }: KPICardProps) {
  const isPositiveTrend = trend ? trend.value > 0 : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "p-6 rounded-lg bg-card text-card-foreground shadow-sm",
        className
      )}
    >
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
        {icon && <div className="text-muted-foreground">{React.createElement(icon, { size: 20 })}</div>}
      </div>
      
      <div className="mt-2 flex items-baseline">
        <div className="text-2xl font-semibold">{value}</div>
        {trend && (
          <motion.span
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className={cn(
              "ml-2 text-sm",
              isPositiveTrend ? "text-green-600" : "text-red-600"
            )}
          >
            {isPositiveTrend ? "↑" : "↓"} {Math.abs(trend.value)}%
            <span className="text-xs text-muted-foreground ml-1">
              {trend.label}
            </span>
          </motion.span>
        )}
      </div>
    </motion.div>
  );
}