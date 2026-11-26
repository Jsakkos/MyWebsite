import { Minus, TrendingDown, TrendingUp } from "lucide-react";
import { parseLocalDate } from "@/lib/utils";

function TrendBadge({ current, previous, label }: { current: number; previous: number; label: string }) {
  const diff = current - previous;
  const isUp = diff > 0.5;
  const isDown = diff < -0.5;
  const tone = isUp ? "text-ontime" : isDown ? "text-major" : "text-muted";
  const Icon = isUp ? TrendingUp : isDown ? TrendingDown : Minus;

  return (
    <div className="flex items-center gap-1.5 text-sm">
      <Icon className={`h-4 w-4 ${tone}`} aria-hidden="true" />
      <span className={`font-mono ${tone}`}>
        {isUp ? "+" : ""}
        {diff.toFixed(1)} pts
      </span>
      <span className="text-muted">{label}</span>
    </div>
  );
}

interface HeroSectionProps {
  onTimePct: number;
  totalArrivals: number;
  daysTracked: number;
  dateRange: { start: string; end: string };
  rolling7d: number;
  rolling30d: number;
  label?: string;
  /** Cleaned figures count only the arrivals that pass the cleaning rules. */
  cleaned?: boolean;
}

const formatDay = (day: string) =>
  parseLocalDate(day).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

export function HeroSection({ onTimePct, totalArrivals, daysTracked, dateRange, rolling7d, rolling30d, label = "all stops, unadjusted", cleaned = false }: HeroSectionProps) {
  return (
    <section className="rounded-lg bg-paper-2 p-6 sm:p-10">
      <p className="font-serif text-base italic text-accent">Caltrain performance</p>
      <h1 className="mt-1 font-serif text-3xl tracking-tight text-ink sm:text-4xl">Every train, once a minute</h1>

      <div className="mt-8 flex flex-wrap items-end gap-x-6 gap-y-2">
        <p className="font-mono text-6xl font-medium leading-none text-accent sm:text-7xl">
          {onTimePct.toFixed(1)}
          <span className="text-3xl sm:text-4xl">%</span>
        </p>
        <div className="pb-1">
          <p className="text-ink">on time</p>
          <p className="text-sm text-muted">{label}</p>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2">
        <TrendBadge current={rolling7d} previous={onTimePct} label="last 7 days vs overall" />
        <TrendBadge current={rolling30d} previous={onTimePct} label="last 30 days vs overall" />
      </div>

      <dl className="mt-8 grid grid-cols-1 gap-6 border-t border-rule pt-6 sm:grid-cols-3">
        <div>
          <dt className="text-sm text-muted">{cleaned ? "Arrivals counted" : "Arrivals logged"}</dt>
          <dd className="mt-1 font-mono text-2xl text-ink">{totalArrivals.toLocaleString("en-US")}</dd>
        </div>
        <div>
          <dt className="text-sm text-muted">Days of data</dt>
          <dd className="mt-1 font-mono text-2xl text-ink">{daysTracked}</dd>
        </div>
        <div>
          <dt className="text-sm text-muted">Date range</dt>
          <dd className="mt-1 text-ink">
            {formatDay(dateRange.start)} to {formatDay(dateRange.end)}
          </dd>
        </div>
      </dl>
    </section>
  );
}
