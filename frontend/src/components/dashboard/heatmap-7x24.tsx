"use client";

import { cn } from "@/lib/utils";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

interface Heatmap7x24Props {
  values: number[][];
  className?: string;
}

function getMax(values: number[][]) {
  let max = 0;
  for (const row of values) {
    for (const cell of row) {
      if (cell > max) max = cell;
    }
  }
  return max;
}

export function Heatmap7x24({ values, className }: Heatmap7x24Props) {
  const max = getMax(values);
  const safeValues = values.length === 7 ? values : Array.from({ length: 7 }, () => Array.from({ length: 24 }, () => 0));

  return (
    <div className={cn("space-y-3", className)}>
      <div className="overflow-x-auto">
        <div className="min-w-[760px] space-y-2">
          <div className="grid grid-cols-[48px_repeat(24,minmax(0,1fr))] gap-1 text-[10px] text-muted-foreground">
            <div />
            {Array.from({ length: 24 }).map((_, hour) => (
              <div key={hour} className="text-center">
                {hour}
              </div>
            ))}
          </div>

          {safeValues.map((dayRow, dayIndex) => (
            <div key={DAYS[dayIndex]} className="grid grid-cols-[48px_repeat(24,minmax(0,1fr))] gap-1">
              <div className="pr-1 text-xs font-medium text-muted-foreground">{DAYS[dayIndex]}</div>
              {Array.from({ length: 24 }).map((_, hour) => {
                const value = dayRow?.[hour] ?? 0;
                const intensity = max > 0 ? value / max : 0;
                return (
                  <div
                    key={`${dayIndex}-${hour}`}
                    title={`${DAYS[dayIndex]} ${hour}:00 - ${value} bookings`}
                    className="h-4 rounded-[3px] border border-primary/10 transition-opacity hover:opacity-90"
                    style={{
                      backgroundColor: `hsl(var(--primary) / ${0.08 + intensity * 0.75})`,
                    }}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-end gap-2 text-[11px] text-muted-foreground">
        <span>Low</span>
        <div className="h-2 w-20 rounded-full bg-gradient-to-r from-primary/15 to-primary/80" />
        <span>High</span>
      </div>
    </div>
  );
}

