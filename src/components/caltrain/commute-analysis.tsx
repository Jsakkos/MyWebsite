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
import { COMMUTE_COLORS, tooltipStyle } from "@/components/caltrain/palette";

const PERIOD_CONFIG: Record<string, { icon: React.ReactNode; label: string; color: string; description: string }> = {
  Morning: {
    icon: <Coffee className="h-5 w-5" />,
    label: "Morning Commute",
    color: COMMUTE_COLORS.Morning,
    description: "6:00 - 9:00 AM weekdays",
  },
  Evening: {
    icon: <Sunset className="h-5 w-5" />,
    label: "Evening Commute",
    color: COMMUTE_COLORS.Evening,
    description: "3:30 - 7:30 PM weekdays",
  },
  Other: {
    icon: <Sun className="h-5 w-5" />,
    label: "Off-Peak",
    color: COMMUTE_COLORS.Other,
    description: "All other weekday times",
  },
  Weekend: {
    icon: <Moon className="h-5 w-5" />,
    label: "Weekend",
    color: COMMUTE_COLORS.Weekend,
    description: "Saturdays & Sundays",
  },
};

interface CommuteAnalysisProps {
  data: CommuteData;
  /** Cleaned exports group trips by scheduled hour; legacy ones by the hour the train arrived. */
  cleaned?: boolean;
}

export function CommuteAnalysis({ data, cleaned = false }: CommuteAnalysisProps) {
  const periods = Object.entries(data)
    .filter(([key]) => key in PERIOD_CONFIG)
    .map(([key, stats]) => ({
      name: PERIOD_CONFIG[key]?.label ?? key,
      ...stats,
      color: PERIOD_CONFIG[key]?.color ?? "var(--chart-axis)",
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
      <h2 className="mb-4 font-serif text-2xl tracking-tight text-ink">Commute Analysis</h2>

      {cleaned && (
        <p className="mb-4 text-sm text-muted">
          Trips are grouped by scheduled hour, so a late train counts in the hour it was due, not the hour it arrived.
        </p>
      )}

      {/* Period cards */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {periods.map((period) => (
          <div
            key={period.key}
            className="rounded-md border border-rule bg-paper p-5"
          >
            <div className="mb-3 flex items-center gap-2">
              <div className="rounded-lg p-2" style={{ backgroundColor: `${period.color}20` }}>
                <span style={{ color: period.color }}>{period.icon}</span>
              </div>
              <div>
                <h3 className="font-semibold text-ink">{period.name}</h3>
                <p className="text-xs text-muted">{period.description}</p>
              </div>
            </div>
            <div className="flex items-end justify-between">
              <div>
                <div className="text-3xl font-bold" style={{ color: period.color }}>
                  {period.on_time_pct}%
                </div>
                <div className="text-xs text-muted">on-time</div>
              </div>
              <div className="text-right text-sm text-muted">
                <div>{period.avg_delay_min} min avg</div>
                <div>{period.total_trips.toLocaleString()} trips</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Comparison chart */}
      <div className="rounded-md border border-rule bg-paper p-4">
        <h3 className="mb-4 text-sm font-medium text-muted">
          On-Time Rate by Period
        </h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="var(--chart-axis)" />
            <YAxis domain={[0, 100]} tickFormatter={(v) => `${v}%`} tick={{ fontSize: 12 }} stroke="var(--chart-axis)" />
            <Tooltip
              contentStyle={tooltipStyle}
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
