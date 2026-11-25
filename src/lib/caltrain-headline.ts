import type { CaltrainStats } from "@/lib/api";

export type HeadlineLabel = "within 4 minutes of schedule" | "all stops, unadjusted";

export interface Headline {
  onTimePct: number;
  rolling7d: number;
  rolling30d: number;
  totalArrivals: number;
  daysTracked: number;
  cleaned: boolean;
  label: HeadlineLabel;
}

/**
 * The one on-time figure shown on the card, the dashboard hero and the
 * write-up. Uses the cleaned figures when the export has them, otherwise the
 * legacy "all stops, unadjusted" ones. Pure, so client components may use it.
 */
export function headline(stats: CaltrainStats): Headline {
  const c = stats.clean;
  if (
    c &&
    typeof c.on_time_percentage === "number" &&
    typeof c.total_arrivals === "number" &&
    typeof c.days_tracked === "number"
  ) {
    return {
      onTimePct: c.on_time_percentage,
      rolling7d: c.rolling_7d_on_time,
      rolling30d: c.rolling_30d_on_time,
      totalArrivals: c.total_arrivals,
      daysTracked: c.days_tracked,
      cleaned: true,
      label: "within 4 minutes of schedule",
    };
  }
  return {
    onTimePct: stats.on_time_percentage,
    rolling7d: stats.rolling_7d_on_time,
    rolling30d: stats.rolling_30d_on_time,
    totalArrivals: stats.total_arrivals,
    daysTracked: stats.days_tracked,
    cleaned: false,
    label: "all stops, unadjusted",
  };
}
