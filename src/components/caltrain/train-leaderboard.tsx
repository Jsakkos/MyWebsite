"use client";

import { Trophy, ThumbsDown } from "lucide-react";
import type { TrainPerformance } from "@/lib/api";

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
  return (
    <div className="flex items-center gap-3 rounded-lg border border-gray-100 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-700/50">
      <div
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white ${
          isBest ? "bg-emerald-500" : "bg-red-500"
        }`}
      >
        {rank}
      </div>
      <div className="min-w-0 flex-1">
        <div className="font-semibold text-gray-900 dark:text-white">Train {train.trip_id}</div>
        <div className="text-xs text-gray-500 dark:text-gray-400">
          {train.days_observed} days observed
        </div>
      </div>
      <div className="text-right">
        <div
          className={`text-lg font-bold ${
            isBest ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"
          }`}
        >
          {train.on_time_pct}%
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400">
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
      <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">Train Leaderboard</h2>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Best */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <div className="mb-4 flex items-center gap-2">
            <Trophy className="h-5 w-5 text-amber-500" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Most Reliable</h3>
          </div>
          <div className="space-y-2">
            {best.map((train, i) => (
              <TrainCard key={train.trip_id} train={train} rank={i + 1} variant="best" />
            ))}
          </div>
        </div>

        {/* Worst */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <div className="mb-4 flex items-center gap-2">
            <ThumbsDown className="h-5 w-5 text-red-500" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Least Reliable</h3>
          </div>
          <div className="space-y-2">
            {worst.map((train, i) => (
              <TrainCard key={train.trip_id} train={train} rank={i + 1} variant="worst" />
            ))}
          </div>
        </div>
      </div>
      <p className="mt-3 text-xs text-gray-400 dark:text-gray-500">
        Only trains observed on 5+ days are included in rankings.
      </p>
    </section>
  );
}
