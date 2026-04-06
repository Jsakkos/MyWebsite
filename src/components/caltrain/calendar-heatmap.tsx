"use client";

import { useMemo, useState } from "react";
import type { DailyPerformance } from "@/lib/api";

function getColor(pct: number): string {
  if (pct >= 95) return "#059669";
  if (pct >= 90) return "#10b981";
  if (pct >= 85) return "#34d399";
  if (pct >= 80) return "#6ee7b7";
  if (pct >= 75) return "#fbbf24";
  if (pct >= 70) return "#f59e0b";
  if (pct >= 60) return "#f97316";
  return "#ef4444";
}

interface CalendarHeatmapProps {
  data: DailyPerformance[];
}

export function CalendarHeatmap({ data }: CalendarHeatmapProps) {
  const [tooltip, setTooltip] = useState<{ day: DailyPerformance; x: number; y: number } | null>(null);

  const { weeks, monthLabels } = useMemo(() => {
    if (!data.length) return { weeks: [], monthLabels: [] };

    const lookup = new Map(data.map((d) => [d.date, d]));
    const sorted = [...data].sort((a, b) => a.date.localeCompare(b.date));
    const startDate = new Date(sorted[0].date);
    const endDate = new Date(sorted[sorted.length - 1].date);

    // Align to start of week (Monday)
    const start = new Date(startDate);
    start.setDate(start.getDate() - ((start.getDay() + 6) % 7));

    const weeks: (DailyPerformance | null)[][] = [];
    const labels: { month: string; weekIndex: number }[] = [];
    let currentWeek: (DailyPerformance | null)[] = [];
    let lastMonth = "";

    const cursor = new Date(start);
    while (cursor <= endDate || currentWeek.length > 0) {
      const dayOfWeek = (cursor.getDay() + 6) % 7; // Mon=0
      const dateStr = cursor.toISOString().split("T")[0];
      const dayData = lookup.get(dateStr) ?? null;

      if (dayOfWeek === 0 && currentWeek.length > 0) {
        weeks.push(currentWeek);
        currentWeek = [];
      }

      const monthStr = cursor.toLocaleDateString("en-US", { month: "short" });
      if (monthStr !== lastMonth) {
        labels.push({ month: monthStr, weekIndex: weeks.length });
        lastMonth = monthStr;
      }

      if (cursor > endDate) {
        currentWeek.push(null);
      } else {
        currentWeek.push(dayData);
      }

      cursor.setDate(cursor.getDate() + 1);

      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
    }

    if (currentWeek.length > 0) {
      while (currentWeek.length < 7) currentWeek.push(null);
      weeks.push(currentWeek);
    }

    return { weeks, monthLabels: labels };
  }, [data]);

  const cellSize = 16;
  const gap = 3;
  const labelH = 20;
  const dayLabelW = 28;
  const svgW = dayLabelW + weeks.length * (cellSize + gap);
  const svgH = labelH + 7 * (cellSize + gap) + 10;
  const dayNames = ["Mon", "", "Wed", "", "Fri", "", ""];

  return (
    <section>
      <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">Daily Performance Calendar</h2>
      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
          Each square represents one day. Color shows on-time percentage.
        </p>
        <div className="overflow-x-auto">
          <svg width={svgW} height={svgH} onMouseLeave={() => setTooltip(null)}>
            {/* Month labels */}
            {monthLabels.map((ml, i) => (
              <text
                key={i}
                x={dayLabelW + ml.weekIndex * (cellSize + gap)}
                y={labelH - 5}
                fontSize={11}
                className="fill-gray-500 dark:fill-gray-400"
              >
                {ml.month}
              </text>
            ))}

            {/* Day labels */}
            {dayNames.map((name, i) => (
              <text
                key={i}
                x={dayLabelW - 6}
                y={labelH + i * (cellSize + gap) + cellSize / 2 + 4}
                textAnchor="end"
                fontSize={10}
                className="fill-gray-400 dark:fill-gray-500"
              >
                {name}
              </text>
            ))}

            {/* Cells */}
            {weeks.map((week, wi) =>
              week.map((day, di) => (
                <rect
                  key={`${wi}-${di}`}
                  x={dayLabelW + wi * (cellSize + gap)}
                  y={labelH + di * (cellSize + gap)}
                  width={cellSize}
                  height={cellSize}
                  rx={3}
                  fill={day ? getColor(day.on_time_pct) : "#f3f4f6"}
                  opacity={day ? 1 : 0.15}
                  className="cursor-pointer transition-opacity hover:opacity-80"
                  onMouseEnter={(e) => {
                    if (day) {
                      const rect = (e.target as SVGRectElement).getBoundingClientRect();
                      setTooltip({ day, x: rect.x + rect.width / 2, y: rect.y });
                    }
                  }}
                  onMouseLeave={() => setTooltip(null)}
                />
              )),
            )}
          </svg>
        </div>

        {tooltip && (
          <div
            className="pointer-events-none fixed z-50 rounded-lg bg-gray-900 px-3 py-2 text-xs text-white shadow-lg"
            style={{ left: tooltip.x, top: tooltip.y - 70, transform: "translateX(-50%)" }}
          >
            <div className="font-semibold">
              {new Date(tooltip.day.date).toLocaleDateString("en-US", {
                weekday: "short",
                month: "short",
                day: "numeric",
              })}
            </div>
            <div>On-time: {tooltip.day.on_time_pct}%</div>
            <div>{tooltip.day.total_trips} trips</div>
            <div>Avg delay: {tooltip.day.avg_delay_min} min</div>
          </div>
        )}
      </div>
    </section>
  );
}
