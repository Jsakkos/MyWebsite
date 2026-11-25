"use client";

import { Trophy, ThumbsDown } from "lucide-react";
import type { TrainPerformance } from "@/lib/api";
import { lastStopLabel } from "@/lib/caltrain-dashboard";

interface TrainLeaderboardProps {
  data: TrainPerformance[];
}

function TrainCard({
  train,
  rank,
  variant,
}: {
  train: TrainPerformance;
  rank: number;
  variant: "best" | "worst";
}) {
  const isBest = variant === "best";
  const lastStop = lastStopLabel(train);
  return (
    <div className="flex items-center gap-3 rounded-lg border border-rule bg-paper-2 p-3">
      <div
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold text-paper ${
          isBest ? "bg-ontime" : "bg-major"
        }`}
      >
        {rank}
      </div>
      <div className="min-w-0 flex-1">
        <div className="font-semibold text-ink">Train {train.trip_id}</div>
        <div className="text-xs text-muted">
          {train.days_observed} days observed
        </div>
        {lastStop && <div className="text-xs text-muted">{lastStop}</div>}
      </div>
      <div className="text-right">
        <div
          className={`text-lg font-bold ${
            isBest ? "text-ontime" : "text-major"
          }`}
        >
          {train.on_time_pct}%
        </div>
        <div className="text-xs text-muted">
          {train.avg_delay_min} min avg
        </div>
      </div>
    </div>
  );
}

export function TrainLeaderboard({ data }: TrainLeaderboardProps) {
  // Filter to trains with meaningful sample size (5+ days)
  const qualified = data.filter((t) => t.days_observed >= 5);
  const best = qualified.slice(0, 5);
  const worst = [...qualified].sort((a, b) => a.on_time_pct - b.on_time_pct).slice(0, 5);

  return (
    <section>
      <h2 className="mb-4 font-serif text-2xl tracking-tight text-ink">Train Leaderboard</h2>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Best */}
        <div className="rounded-md border border-rule bg-paper p-5">
          <div className="mb-4 flex items-center gap-2">
            <Trophy className="h-5 w-5 text-minor" />
            <h3 className="font-serif text-lg text-ink">Most Reliable</h3>
          </div>
          <div className="space-y-2">
            {best.map((train, i) => (
              <TrainCard key={train.trip_id} train={train} rank={i + 1} variant="best" />
            ))}
          </div>
        </div>

        {/* Worst */}
        <div className="rounded-md border border-rule bg-paper p-5">
          <div className="mb-4 flex items-center gap-2">
            <ThumbsDown className="h-5 w-5 text-major" />
            <h3 className="font-serif text-lg text-ink">Least Reliable</h3>
          </div>
          <div className="space-y-2">
            {worst.map((train, i) => (
              <TrainCard key={train.trip_id} train={train} rank={i + 1} variant="worst" />
            ))}
          </div>
        </div>
      </div>
      <p className="mt-3 text-xs text-muted">
        Only trains observed on 5+ days are included in rankings.
      </p>
    </section>
  );
}
