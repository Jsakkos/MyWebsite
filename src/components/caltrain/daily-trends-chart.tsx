"use client";

import { useState, useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
  Legend,
} from "recharts";
import type { DailyPerformance } from "@/lib/api";
import { parseLocalDate } from "@/lib/utils";
import { CHART, tooltipStyle } from "@/components/caltrain/palette";
import { isBadFeedDay, trendSeries, type TrendRow } from "@/lib/caltrain-dashboard";

const RANGES = [
  { label: "7d", days: 7 },
  { label: "30d", days: 30 },
  { label: "90d", days: 90 },
  { label: "All", days: Infinity },
] as const;

const longDate = (date: string) =>
  parseLocalDate(date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });

interface TooltipEntry {
  name?: string | number;
  value?: number | string | null;
  color?: string;
  payload?: TrendRow;
}

/** Tooltip body: the day's shares, or just "feed unreliable" on a bad-feed day. */
export function DailyTooltip({ active, label, payload }: { active?: boolean; label?: string; payload?: TooltipEntry[] }) {
  if (!active || !label) return null;
  const bad = payload?.[0]?.payload?.bad_feed === true;
  return (
    <div style={{ ...tooltipStyle, padding: "8px 12px" }}>
      <p className="font-semibold">{bad ? `${longDate(label)} (feed unreliable)` : longDate(label)}</p>
      {bad ? (
        <p>No figures: the position feed was stale or partial.</p>
      ) : (
        (payload ?? [])
          .filter((e) => typeof e.value === "number")
          .map((e) => (
            <p key={String(e.name)} style={{ color: e.color }}>
              {e.name}: {Number(e.value).toFixed(1)}%
            </p>
          ))
      )}
    </div>
  );
}

interface DailyTrendsChartProps {
  data: DailyPerformance[];
}

export function DailyTrendsChart({ data }: DailyTrendsChartProps) {
  const [range, setRange] = useState<number>(Infinity);

  const filtered = useMemo(() => {
    if (range === Infinity) return data;
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - range);
    return data.filter((d) => parseLocalDate(d.date) >= cutoff);
  }, [data, range]);

  const series = useMemo(() => trendSeries(filtered), [filtered]);
  const badDays = useMemo(() => filtered.filter(isBadFeedDay).map((d) => d.date), [filtered]);

  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-serif text-2xl tracking-tight text-ink">Daily Trends</h2>
        <div className="flex gap-1 rounded-lg bg-paper-2 p-1">
          {RANGES.map((r) => (
            <button
              key={r.label}
              onClick={() => setRange(r.days)}
              className={`rounded-md px-3 py-1 text-sm font-medium transition-colors ${
                range === r.days
                  ? "bg-paper text-accent "
                  : "text-ink-2 hover:text-ink"
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-md border border-rule bg-paper p-4">
        <ResponsiveContainer width="100%" height={350}>
          <AreaChart data={series} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="gradOnTime" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--ontime)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="var(--ontime)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gradMinor" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--minor)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="var(--minor)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gradMajor" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--major)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="var(--major)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 12 }}
              tickFormatter={(d) => parseLocalDate(d).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              stroke="var(--chart-axis)"
            />
            <YAxis
              domain={[0, 100]}
              tick={{ fontSize: 12 }}
              tickFormatter={(v) => `${v}%`}
              stroke="var(--chart-axis)"
            />
            <Tooltip content={<DailyTooltip />} filterNull={false} />
            <Legend />
            {badDays.map((date) => (
              <ReferenceLine key={date} x={date} stroke={CHART.field} strokeWidth={4} />
            ))}
            <Area
              type="monotone"
              dataKey="on_time_pct"
              name="On Time"
              stroke="var(--ontime)"
              fill="url(#gradOnTime)"
              strokeWidth={2}
            />
            <Area
              type="monotone"
              dataKey="minor_pct"
              name="Minor Delay"
              stroke="var(--minor)"
              fill="url(#gradMinor)"
              strokeWidth={2}
            />
            <Area
              type="monotone"
              dataKey="major_pct"
              name="Major Delay"
              stroke="var(--major)"
              fill="url(#gradMajor)"
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
        {badDays.length > 0 && (
          <p className="mt-3 flex items-center gap-2 text-xs text-muted">
            <span aria-hidden="true" className="inline-block h-3 w-1 rounded-sm bg-field" />
            Feed unreliable: the position feed was stale or partial that day, so the chart leaves a gap there.
          </p>
        )}
      </div>
    </section>
  );
}
