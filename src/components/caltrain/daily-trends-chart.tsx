"use client";

import { useState, useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import type { DailyPerformance } from "@/lib/api";

const RANGES = [
  { label: "7d", days: 7 },
  { label: "30d", days: 30 },
  { label: "90d", days: 90 },
  { label: "All", days: Infinity },
] as const;

interface DailyTrendsChartProps {
  data: DailyPerformance[];
}

export function DailyTrendsChart({ data }: DailyTrendsChartProps) {
  const [range, setRange] = useState<number>(Infinity);

  const filtered = useMemo(() => {
    if (range === Infinity) return data;
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - range);
    return data.filter((d) => new Date(d.date) >= cutoff);
  }, [data, range]);

  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Daily Trends</h2>
        <div className="flex gap-1 rounded-lg bg-gray-100 p-1 dark:bg-gray-700">
          {RANGES.map((r) => (
            <button
              key={r.label}
              onClick={() => setRange(r.days)}
              className={`rounded-md px-3 py-1 text-sm font-medium transition-colors ${
                range === r.days
                  ? "bg-white text-blue-600 shadow-sm dark:bg-gray-600 dark:text-blue-400"
                  : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <ResponsiveContainer width="100%" height={350}>
          <AreaChart data={filtered} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="gradOnTime" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00CC96" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#00CC96" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gradMinor" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#FECB52" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#FECB52" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gradMajor" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#EF553B" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#EF553B" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 12 }}
              tickFormatter={(d) => new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              stroke="#9ca3af"
            />
            <YAxis
              domain={[0, 100]}
              tick={{ fontSize: 12 }}
              tickFormatter={(v) => `${v}%`}
              stroke="#9ca3af"
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "rgba(255,255,255,0.95)",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                fontSize: "13px",
              }}
              formatter={(value, name) => [`${Number(value).toFixed(1)}%`, name]}
              labelFormatter={(label) =>
                new Date(label).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })
              }
            />
            <Legend />
            <Area
              type="monotone"
              dataKey="on_time_pct"
              name="On Time"
              stroke="#00CC96"
              fill="url(#gradOnTime)"
              strokeWidth={2}
            />
            <Area
              type="monotone"
              dataKey="minor_pct"
              name="Minor Delay"
              stroke="#FECB52"
              fill="url(#gradMinor)"
              strokeWidth={2}
            />
            <Area
              type="monotone"
              dataKey="major_pct"
              name="Major Delay"
              stroke="#EF553B"
              fill="url(#gradMajor)"
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
