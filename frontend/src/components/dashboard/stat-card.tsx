"use client";

import type { ReactNode } from "react";
import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  trendPercent?: number;
  trendLabel?: string;
  icon?: ReactNode;
  className?: string;
}

export function StatCard({
  title,
  value,
  trendPercent = 0,
  trendLabel = "vs previous period",
  icon,
  className,
}: StatCardProps) {
  const isPositive = trendPercent > 0;
  const isNegative = trendPercent < 0;

  return (
    <Card className={cn("rounded-2xl border-border/70 shadow-sm transition-all duration-200 hover:shadow-md", className)}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1.5">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{title}</p>
            <p className="text-2xl font-semibold tracking-tight">{value}</p>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              {isPositive ? (
                <ArrowUpRight className="h-3.5 w-3.5 text-emerald-500" />
              ) : isNegative ? (
                <ArrowDownRight className="h-3.5 w-3.5 text-red-500" />
              ) : (
                <Minus className="h-3.5 w-3.5" />
              )}
              <span
                className={cn(
                  "font-medium",
                  isPositive && "text-emerald-600 dark:text-emerald-400",
                  isNegative && "text-red-600 dark:text-red-400"
                )}
              >
                {trendPercent > 0 ? "+" : ""}
                {trendPercent.toFixed(1)}%
              </span>
              <span>{trendLabel}</span>
            </div>
          </div>
          {icon ? (
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              {icon}
            </div>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}

