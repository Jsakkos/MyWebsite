import type { DailyPerformance, TrainPerformance } from "@/lib/api";

/**
 * "late at 22nd Street on 50% of weekday runs", or null when the export has
 * no last-stop figure for the train (older data, or under 80 weekday runs).
 */
export function lastStopLabel(t: TrainPerformance): string | null {
  const pct = t.last_stop_late_pct;
  if (typeof pct !== "number" || !Number.isFinite(pct) || !t.last_stop_name) return null;
  return `late at ${t.last_stop_name} on ${Number(pct.toFixed(1))}% of weekday runs`;
}

/** A day the position feed was unreliable; its figures are drawn apart and not trusted. */
export function isBadFeedDay(d: DailyPerformance): boolean {
  return d.bad_feed === true;
}
