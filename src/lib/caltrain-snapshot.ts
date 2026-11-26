import fs from "node:fs";
import path from "node:path";
import { formatYearMonth } from "@/lib/format";
import { headline, type HeadlineLabel } from "@/lib/caltrain-headline";
import type { CaltrainStats } from "@/lib/api";

export interface CaltrainSnapshot {
  onTimePct: string;
  arrivals: string;
  days: number;
  since: string;
  label: HeadlineLabel;
  cleaned: boolean;
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
    const start = s?.date_range?.start;
    if (
      typeof s?.on_time_percentage !== "number" ||
      typeof s?.total_arrivals !== "number" ||
      typeof s?.days_tracked !== "number" ||
      typeof start !== "string"
    ) {
      return null;
    }
    const h = headline(s as CaltrainStats);
    return {
      onTimePct: `${h.onTimePct.toFixed(1)}%`,
      arrivals: h.totalArrivals.toLocaleString("en-US"),
      days: h.daysTracked,
      since: formatYearMonth(start),
      label: h.label,
      cleaned: h.cleaned,
    };
  } catch {
    return null;
  }
}
