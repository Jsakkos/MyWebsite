"use client";

import { Sun, Sunset, Moon, Coffee } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import type { CommuteAnalysis as CommuteData } from "@/lib/api";

const PERIOD_CONFIG: Record<string, { icon: React.ReactNode; label: string; color: string; description: string }> = {
  Morning: {
    icon: <Coffee className="h-5 w-5" />,
    label: "Morning Commute",
    color: "#f59e0b",
    description: "6:00 - 9:00 AM weekdays",
  },
  Evening: {
    icon: <Sunset className="h-5 w-5" />,
    label: "Evening Commute",
    color: "#8b5cf6",
    description: "3:30 - 7:30 PM weekdays",
  },
  Other: {
    icon: <Sun className="h-5 w-5" />,
    label: "Off-Peak",
    color: "#3b82f6",
    description: "All other weekday times",
  },
  Weekend: {
    icon: <Moon className="h-5 w-5" />,
    label: "Weekend",
    color: "#10b981",
    description: "Saturdays & Sundays",
  },
};

interface CommuteAnalysisProps {
  data: CommuteData;
}

export function CommuteAnalysis({ data }: CommuteAnalysisProps) {
  const periods = Object.entries(data)
    .filter(([key]) => key in PERIOD_CONFIG)
    .map(([key, stats]) => ({
      name: PERIOD_CONFIG[key]?.label ?? key,
      ...stats,
      color: PERIOD_CONFIG[key]?.color ?? "#6b7280",
      icon: PERIOD_CONFIG[key]?.icon,
      description: PERIOD_CONFIG[key]?.description ?? "",
      key,
    }));

  const chartData = periods.map((p) => ({
    name: p.name,
    "On Time": p.on_time_pct,
    Minor: p.minor_pct,
    Major: p.major_pct,
    color: p.color,
  }));

  return (
    <section>
      <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">Commute Analysis</h2>

      {/* Period cards */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {periods.map((period) => (
          <div
            key={period.key}
            className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800"
          >
            <div className="mb-3 flex items-center gap-2">
              <div className="rounded-lg p-2" style={{ backgroundColor: `${period.color}20` }}>
                <span style={{ color: period.color }}>{period.icon}</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">{period.name}</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">{period.description}</p>
              </div>
            </div>
            <div className="flex items-end justify-between">
              <div>
                <div className="text-3xl font-bold" style={{ color: period.color }}>
                  {period.on_time_pct}%
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">on-time</div>
              </div>
              <div className="text-right text-sm text-gray-500 dark:text-gray-400">
                <div>{period.avg_delay_min} min avg</div>
                <div>{period.total_trips.toLocaleString()} trips</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Comparison chart */}
      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <h3 className="mb-4 text-sm font-medium text-gray-500 dark:text-gray-400">
          On-Time Rate by Period
        </h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="#9ca3af" />
            <YAxis domain={[0, 100]} tickFormatter={(v) => `${v}%`} tick={{ fontSize: 12 }} stroke="#9ca3af" />
            <Tooltip
              contentStyle={{
                backgroundColor: "rgba(255,255,255,0.95)",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                fontSize: "13px",
              }}
              formatter={(value) => `${Number(value).toFixed(1)}%`}
            />
            <Bar dataKey="On Time" radius={[6, 6, 0, 0]}>
              {chartData.map((entry, i) => (
                <Cell key={i} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
