"use client";

import { CheckCircle, Clock, AlertTriangle } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: number;
  unit?: string;
  icon: React.ReactNode;
  tone: "ontime" | "minor" | "major";
  description: string;
}

const TONE = {
  ontime: { text: "text-ontime", border: "border-l-ontime" },
  minor: { text: "text-minor", border: "border-l-minor" },
  major: { text: "text-major", border: "border-l-major" },
} as const;

function MetricCard({ title, value, unit = "%", icon, tone, description }: MetricCardProps) {
  return (
    <div className={`relative overflow-hidden rounded-md border-l-4 bg-paper-2 p-6 ${TONE[tone].border}`}>
      <div className={`absolute -right-4 -top-4 opacity-10 ${TONE[tone].text}`}>
        <div className="h-24 w-24">{icon}</div>
      </div>
      <div className="relative">
        <p className="text-sm font-medium text-ink-2">{title}</p>
        <p className={`mt-2 font-mono text-4xl font-medium ${TONE[tone].text}`}>
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
      <h2 className="mb-6 font-serif text-2xl tracking-tight text-ink">
        Performance Breakdown
      </h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <MetricCard
          title="On Time"
          value={onTimePct}
          icon={<CheckCircle className="h-24 w-24" />}
          tone="ontime"
          description={`${Math.round(totalArrivals * onTimePct / 100).toLocaleString()} arrivals within 4 min`}
        />
        <MetricCard
          title="Minor Delays"
          value={minorPct}
          icon={<Clock className="h-24 w-24" />}
          tone="minor"
          description="5-14 minutes behind schedule"
        />
        <MetricCard
          title="Major Delays"
          value={majorPct}
          icon={<AlertTriangle className="h-24 w-24" />}
          tone="major"
          description="15+ minutes behind schedule"
        />
      </div>

      {/* Delay stats bar */}
      <div className="mt-4 rounded-md border border-rule bg-paper p-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-ink-2">Delay Distribution</span>
          <span className="text-muted">
            Avg: {avgDelay.toFixed(1)} min | Median: {medianDelay.toFixed(1)} min
          </span>
        </div>
        <div className="mt-3 flex h-4 overflow-hidden rounded-full">
          <div
            className="bg-ontime transition-all duration-1000"
            style={{ width: `${onTimePct}%` }}
            title={`On Time: ${onTimePct.toFixed(1)}%`}
          />
          <div
            className="bg-minor transition-all duration-1000"
            style={{ width: `${minorPct}%` }}
            title={`Minor: ${minorPct.toFixed(1)}%`}
          />
          <div
            className="bg-major transition-all duration-1000"
            style={{ width: `${majorPct}%` }}
            title={`Major: ${majorPct.toFixed(1)}%`}
          />
        </div>
        <div className="mt-2 flex gap-4 text-xs text-muted">
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-ontime" /> On Time
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-minor" /> Minor
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-major" /> Major
          </span>
        </div>
      </div>
    </section>
  );
}
