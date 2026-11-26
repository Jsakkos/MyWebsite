"use client";

import { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { WeeklySummary, MonthlySummary } from "@/lib/api";
import { parseLocalDate } from "@/lib/utils";
import { tooltipStyle } from "@/components/caltrain/palette";

interface TimeBreakdownProps {
  weekly: WeeklySummary[];
  monthly: MonthlySummary[];
}

type Tab = "weekly" | "monthly";

export function TimeBreakdown({ weekly, monthly }: TimeBreakdownProps) {
  const [tab, setTab] = useState<Tab>("monthly");

  const weeklyChart = weekly.map((w) => ({
    label: parseLocalDate(w.week_start).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    on_time_pct: w.on_time_pct,
    total_trips: w.total_trips,
    avg_delay_min: w.avg_delay_min,
    days: w.days_with_data,
  }));

  const monthlyChart = monthly.map((m) => {
    const [year, month] = m.month.split("-");
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return {
      label: date.toLocaleDateString("en-US", { month: "short", year: "numeric" }),
      on_time_pct: m.on_time_pct,
      total_trips: m.total_trips,
      avg_delay_min: m.avg_delay_min,
      days: m.days_with_data,
    };
  });

  const chartData = tab === "weekly" ? weeklyChart : monthlyChart;

  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-serif text-2xl tracking-tight text-ink">Time Breakdown</h2>
        <div className="flex gap-1 rounded-lg bg-paper-2 p-1">
          {(["weekly", "monthly"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`rounded-md px-3 py-1 text-sm font-medium capitalize transition-colors ${
                tab === t
                  ? "bg-paper text-accent "
                  : "text-ink-2 hover:text-ink"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-md border border-rule bg-paper p-4">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 12 }}
              stroke="var(--chart-axis)"
              angle={tab === "weekly" ? -45 : 0}
              textAnchor={tab === "weekly" ? "end" : "middle"}
              height={tab === "weekly" ? 60 : 30}
            />
            <YAxis
              domain={[0, 100]}
              tickFormatter={(v) => `${v}%`}
              tick={{ fontSize: 12 }}
              stroke="var(--chart-axis)"
            />
            <Tooltip
              contentStyle={tooltipStyle}
              formatter={(value, name) => {
                if (name === "on_time_pct") return [`${Number(value).toFixed(1)}%`, "On-Time Rate"];
                return [value, name];
              }}
              labelFormatter={(label) => label}
            />
            <Bar
              dataKey="on_time_pct"
              fill="var(--series-3)"
              radius={[6, 6, 0, 0]}
              name="on_time_pct"
            />
          </BarChart>
        </ResponsiveContainer>

        {/* Summary table */}
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-rule text-left">
                <th className="px-3 py-2 font-medium text-muted">Period</th>
                <th className="px-3 py-2 text-right font-medium text-muted">On-Time</th>
                <th className="px-3 py-2 text-right font-medium text-muted">Trips</th>
                <th className="px-3 py-2 text-right font-medium text-muted">Avg Delay</th>
                <th className="px-3 py-2 text-right font-medium text-muted">Days</th>
              </tr>
            </thead>
            <tbody>
              {chartData.map((row, i) => (
                <tr key={i} className="border-b border-rule last:border-0">
                  <td className="px-3 py-2 font-medium text-ink">{row.label}</td>
                  <td className="px-3 py-2 text-right">
                    <span
                      className={`font-semibold ${
                        row.on_time_pct >= 85
                          ? "text-ontime"
                          : row.on_time_pct >= 75
                          ? "text-minor"
                          : "text-major"
                      }`}
                    >
                      {row.on_time_pct}%
                    </span>
                  </td>
                  <td className="px-3 py-2 text-right text-ink-2">{row.total_trips}</td>
                  <td className="px-3 py-2 text-right text-ink-2">{row.avg_delay_min} min</td>
                  <td className="px-3 py-2 text-right text-muted">{row.days}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
