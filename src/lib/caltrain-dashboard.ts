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

/** One day of the trends chart; the three shares are null on a bad-feed day so the series breaks. */
export interface TrendRow {
  date: string;
  on_time_pct: number | null;
  minor_pct: number | null;
  major_pct: number | null;
  bad_feed: boolean;
}

/** Chart rows for the daily trends: untrusted bad-feed days carry no values. */
export function trendSeries(data: DailyPerformance[]): TrendRow[] {
  return data.map((d) =>
    isBadFeedDay(d)
      ? { date: d.date, on_time_pct: null, minor_pct: null, major_pct: null, bad_feed: true }
      : { date: d.date, on_time_pct: d.on_time_pct, minor_pct: d.minor_pct, major_pct: d.major_pct, bad_feed: false },
  );
}
