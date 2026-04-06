"use client";

import { CheckCircle, Clock, AlertTriangle } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: number;
  unit?: string;
  icon: React.ReactNode;
  gradient: string;
  description: string;
}

function MetricCard({ title, value, unit = "%", icon, gradient, description }: MetricCardProps) {
  return (
    <div className={`relative overflow-hidden rounded-xl p-6 text-white shadow-lg ${gradient}`}>
      <div className="absolute -right-4 -top-4 opacity-10">
        <div className="h-24 w-24">{icon}</div>
      </div>
      <div className="relative">
        <p className="text-sm font-medium opacity-90">{title}</p>
        <p className="mt-2 text-4xl font-extrabold">
          {value.toFixed(1)}
          <span className="text-xl">{unit}</span>
        </p>
        <p className="mt-2 text-xs opacity-75">{description}</p>
      </div>
    </div>
  );
}

interface PerformanceOverviewProps {
  onTimePct: number;
  minorPct: number;
  majorPct: number;
  avgDelay: number;
  medianDelay: number;
  totalArrivals: number;
}

export function PerformanceOverview({
  onTimePct,
  minorPct,
  majorPct,
  avgDelay,
  medianDelay,
  totalArrivals,
}: PerformanceOverviewProps) {
  return (
    <section>
      <h2 className="mb-6 text-2xl font-bold text-gray-900 dark:text-white">
        Performance Breakdown
      </h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <MetricCard
          title="On Time"
          value={onTimePct}
          icon={<CheckCircle className="h-24 w-24" />}
          gradient="bg-gradient-to-br from-emerald-500 to-emerald-700"
          description={`${Math.round(totalArrivals * onTimePct / 100).toLocaleString()} arrivals within 4 min`}
        />
        <MetricCard
          title="Minor Delays"
          value={minorPct}
          icon={<Clock className="h-24 w-24" />}
          gradient="bg-gradient-to-br from-amber-500 to-orange-600"
          description="5-14 minutes behind schedule"
        />
        <MetricCard
          title="Major Delays"
          value={majorPct}
          icon={<AlertTriangle className="h-24 w-24" />}
          gradient="bg-gradient-to-br from-red-500 to-red-700"
          description="15+ minutes behind schedule"
        />
      </div>

      {/* Delay stats bar */}
      <div className="mt-4 rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">Delay Distribution</span>
          <span className="text-gray-500 dark:text-gray-400">
            Avg: {avgDelay.toFixed(1)} min | Median: {medianDelay.toFixed(1)} min
          </span>
        </div>
        <div className="mt-3 flex h-4 overflow-hidden rounded-full">
          <div
            className="bg-emerald-500 transition-all duration-1000"
            style={{ width: `${onTimePct}%` }}
            title={`On Time: ${onTimePct.toFixed(1)}%`}
          />
          <div
            className="bg-amber-500 transition-all duration-1000"
            style={{ width: `${minorPct}%` }}
            title={`Minor: ${minorPct.toFixed(1)}%`}
          />
          <div
            className="bg-red-500 transition-all duration-1000"
            style={{ width: `${majorPct}%` }}
            title={`Major: ${majorPct.toFixed(1)}%`}
          />
        </div>
        <div className="mt-2 flex gap-4 text-xs text-gray-500 dark:text-gray-400">
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-emerald-500" /> On Time
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-amber-500" /> Minor
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-red-500" /> Major
          </span>
        </div>
      </div>
    </section>
  );
}
