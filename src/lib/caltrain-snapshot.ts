import fs from "node:fs";
import path from "node:path";
import { formatYearMonth } from "@/lib/format";

export interface CaltrainSnapshot {
  onTimePct: string;
  arrivals: string;
  days: number;
  since: string;
  label: "all stops, unadjusted";
}

const DEFAULT_FILE = path.join(process.cwd(), "public", "data", "caltrain", "stats.json");

/**
 * Reads the nightly stats export at build time. Returns null (and the card
 * hides its figures) if the file is missing or malformed, so a bad export
 * can never break the site build.
 */
export function getCaltrainSnapshot(file: string = DEFAULT_FILE): CaltrainSnapshot | null {
  try {
    const s = JSON.parse(fs.readFileSync(file, "utf8"));
    const pct = s?.on_time_percentage;
    const arrivals = s?.total_arrivals;
    const days = s?.days_tracked;
    const start = s?.date_range?.start;
    if (typeof pct !== "number" || typeof arrivals !== "number" || typeof days !== "number" || typeof start !== "string") {
      return null;
    }
    return {
      onTimePct: `${pct.toFixed(1)}%`,
      arrivals: arrivals.toLocaleString("en-US"),
      days,
      since: formatYearMonth(start),
      label: "all stops, unadjusted",
    };
  } catch {
    return null;
  }
}
