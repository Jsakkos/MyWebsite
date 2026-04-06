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

interface TimeBreakdownProps {
  weekly: WeeklySummary[];
  monthly: MonthlySummary[];
}

type Tab = "weekly" | "monthly";

export function TimeBreakdown({ weekly, monthly }: TimeBreakdownProps) {
  const [tab, setTab] = useState<Tab>("monthly");

  const weeklyChart = weekly.map((w) => ({
    label: new Date(w.week_start).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
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
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Time Breakdown</h2>
        <div className="flex gap-1 rounded-lg bg-gray-100 p-1 dark:bg-gray-700">
          {(["weekly", "monthly"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`rounded-md px-3 py-1 text-sm font-medium capitalize transition-colors ${
                tab === t
                  ? "bg-white text-blue-600 shadow-sm dark:bg-gray-600 dark:text-blue-400"
                  : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 12 }}
              stroke="#9ca3af"
              angle={tab === "weekly" ? -45 : 0}
              textAnchor={tab === "weekly" ? "end" : "middle"}
              height={tab === "weekly" ? 60 : 30}
            />
            <YAxis
              domain={[0, 100]}
              tickFormatter={(v) => `${v}%`}
              tick={{ fontSize: 12 }}
              stroke="#9ca3af"
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "rgba(255,255,255,0.95)",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                fontSize: "13px",
              }}
              formatter={(value, name) => {
                if (name === "on_time_pct") return [`${Number(value).toFixed(1)}%`, "On-Time Rate"];
                return [value, name];
              }}
              labelFormatter={(label) => label}
            />
            <Bar
              dataKey="on_time_pct"
              fill="#3b82f6"
              radius={[6, 6, 0, 0]}
              name="on_time_pct"
            />
          </BarChart>
        </ResponsiveContainer>

        {/* Summary table */}
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-left dark:border-gray-700">
                <th className="px-3 py-2 font-medium text-gray-500 dark:text-gray-400">Period</th>
                <th className="px-3 py-2 text-right font-medium text-gray-500 dark:text-gray-400">On-Time</th>
                <th className="px-3 py-2 text-right font-medium text-gray-500 dark:text-gray-400">Trips</th>
                <th className="px-3 py-2 text-right font-medium text-gray-500 dark:text-gray-400">Avg Delay</th>
                <th className="px-3 py-2 text-right font-medium text-gray-500 dark:text-gray-400">Days</th>
              </tr>
            </thead>
            <tbody>
              {chartData.map((row, i) => (
                <tr key={i} className="border-b border-gray-100 dark:border-gray-700/50 last:border-0">
                  <td className="px-3 py-2 font-medium text-gray-900 dark:text-white">{row.label}</td>
                  <td className="px-3 py-2 text-right">
                    <span
                      className={`font-semibold ${
                        row.on_time_pct >= 85
                          ? "text-emerald-600 dark:text-emerald-400"
                          : row.on_time_pct >= 75
                          ? "text-amber-600 dark:text-amber-400"
                          : "text-red-600 dark:text-red-400"
                      }`}
                    >
                      {row.on_time_pct}%
                    </span>
                  </td>
                  <td className="px-3 py-2 text-right text-gray-600 dark:text-gray-300">{row.total_trips}</td>
                  <td className="px-3 py-2 text-right text-gray-600 dark:text-gray-300">{row.avg_delay_min} min</td>
                  <td className="px-3 py-2 text-right text-gray-500 dark:text-gray-400">{row.days}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
