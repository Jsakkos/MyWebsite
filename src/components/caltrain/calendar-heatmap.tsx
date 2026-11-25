"use client";

import { useMemo, useState } from "react";
import type { DailyPerformance } from "@/lib/api";
import { parseLocalDate, toLocalDateKey } from "@/lib/utils";
import { CHART, performanceColor } from "@/components/caltrain/palette";
import { isBadFeedDay } from "@/lib/caltrain-dashboard";


/** Hover card for one day; a bad-feed day shows only the date and why, never its untrusted figures. */
export function DayTooltip({ day }: { day: DailyPerformance }) {
  return (
    <>
      <div className="font-semibold">
        {parseLocalDate(day.date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
      </div>
      {isBadFeedDay(day) ? (
        <div>Feed unreliable</div>
      ) : (
        <>
          <div>On-time: {day.on_time_pct}%</div>
          <div>{day.total_trips} trips</div>
          <div>Avg delay: {day.avg_delay_min} min</div>
        </>
      )}
    </>
  );
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
    const startDate = parseLocalDate(sorted[0].date);
    const endDate = parseLocalDate(sorted[sorted.length - 1].date);

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
      const dateStr = toLocalDateKey(cursor);
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

  const hasBadFeed = data.some(isBadFeedDay);
  const cellSize = 16;
  const gap = 3;
  const labelH = 20;
  const dayLabelW = 28;
  const svgW = dayLabelW + weeks.length * (cellSize + gap);
  const svgH = labelH + 7 * (cellSize + gap) + 10;
  const dayNames = ["Mon", "", "Wed", "", "Fri", "", ""];

  return (
    <section>
      <h2 className="mb-4 font-serif text-2xl tracking-tight text-ink">Daily Performance Calendar</h2>
      <div className="rounded-md border border-rule bg-paper p-4">
        <p className="mb-4 text-sm text-muted">
          Each square represents one day. Color shows on-time percentage.
        </p>
        {hasBadFeed && (
          <p className="mb-4 flex items-center gap-2 text-sm text-muted">
            <span aria-hidden="true" className="inline-block h-3.5 w-3.5 rounded-[3px] bg-field" />
            Feed unreliable: the position feed was stale or partial that day.
          </p>
        )}
        <div className="overflow-x-auto">
          <svg width={svgW} height={svgH} onMouseLeave={() => setTooltip(null)}>
            {/* Month labels */}
            {monthLabels.map((ml, i) => (
              <text
                key={i}
                x={dayLabelW + ml.weekIndex * (cellSize + gap)}
                y={labelH - 5}
                fontSize={11}
                className="fill-muted"
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
                className="fill-muted"
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
                  fill={day ? (isBadFeedDay(day) ? CHART.field : performanceColor(day.on_time_pct)) : "var(--paper-2)"}
                  opacity={day ? 1 : 0.15}
                  className="cursor-pointer transition-opacity hover:opacity-80"
                  onMouseEnter={(e) => {
                    if (day) {
                      const rect = (e.target as SVGRectElement).getBoundingClientRect();
                      setTooltip({ day, x: rect.x + rect.width / 2, y: rect.y });
                    }
                  }}
                  onMouseLeave={() => setTooltip(null)}
                >
                  {day && isBadFeedDay(day) && <title>{`${day.date}: feed unreliable`}</title>}
                </rect>
              )),
            )}
          </svg>
        </div>

        {tooltip && (
          <div
            className="pointer-events-none fixed z-50 rounded-md bg-ink px-3 py-2 text-xs text-paper"
            style={{ left: tooltip.x, top: tooltip.y - 8, transform: "translate(-50%, -100%)" }}
          >
            <DayTooltip day={tooltip.day} />
          </div>
        )}
      </div>
    </section>
  );
}
