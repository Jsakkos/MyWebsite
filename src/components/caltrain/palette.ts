// One source of truth for Caltrain chart colors. Chart chrome and series use
// theme variables (see globals.css) so they follow light and dark mode.

export const CHART = {
  grid: "var(--chart-grid)",
  axis: "var(--chart-axis)",
  ontime: "var(--ontime)",
  minor: "var(--minor)",
  major: "var(--major)",
  tooltipBg: "var(--paper)",
  tooltipBorder: "var(--rule)",
  text: "var(--ink)",
  textSoft: "var(--ink-2)",
  muted: "var(--muted)",
  accent: "var(--accent)",
  field: "var(--field)",
  paper: "var(--paper)",
  empty: "var(--paper-2)",
} as const;

/** Bars and marks by service type (the story charts). */
export const SERVICE_COLORS: Record<"Express" | "Limited" | "Local", string> = {
  Express: "var(--series-1)",
  Limited: "var(--series-2)",
  Local: "var(--series-3)",
};

export const COMMUTE_COLORS: Record<"Morning" | "Evening" | "Other" | "Weekend", string> = {
  Morning: "var(--series-1)",
  Evening: "var(--series-2)",
  Other: "var(--series-3)",
  Weekend: "var(--series-4)",
};

/** Normal (unaffected) train paths in the Marey diagram, by direction. */
export const DIRECTION_COLORS: Record<"NB" | "SB", string> = {
  SB: "var(--series-3)",
  NB: "var(--series-2)",
};

// Mid-tone fills that read on both the cream and the dark paper.
const RAMP: [number, string][] = [
  [95, "#2f6b4f"],
  [90, "#4d8a68"],
  [85, "#76a886"],
  [80, "#a5c4a4"],
  [75, "#e0c27a"],
  [70, "#d49a45"],
  [60, "#c4703a"],
];
const WORST = "#b4432f";

/** Fill color for an on-time percentage; bands have inclusive lower bounds. */
export function performanceColor(pct: number): string {
  for (const [min, color] of RAMP) if (pct >= min) return color;
  return WORST;
}

/**
 * Late-share ramp for the story charts: seven bands (--late-0 … --late-6 in
 * globals.css) from pale and quiet to warm and salient, so a higher late share
 * always draws the eye. Each break set has six inclusive lower bounds.
 */
export const LATE_BREAKS = {
  /** The opener heatmap: hour × day late shares sit in about 0–15%. */
  opener: [3, 5, 7, 9, 11, 13],
  /** The headway grid: a following train's late share spans about 10–90%. */
  headway: [10, 20, 30, 40, 50, 60],
} as const satisfies Record<string, readonly number[]>;

export const LATE_BAND_COUNT = 7;

/** The band (0–6) for a late share; breaks are inclusive lower bounds. */
export function lateBand(latePct: number, breaks: readonly number[]): number {
  let band = 0;
  while (band < breaks.length && latePct >= breaks[band]) band++;
  return band;
}

/** Fill for one band of the late ramp (0 = quietest). */
export function lateBandColor(band: number): string {
  return `var(--late-${band})`;
}

/** Fill for a late share. */
export function lateColor(latePct: number, breaks: readonly number[]): string {
  return lateBandColor(lateBand(latePct, breaks));
}

/** Text color that meets AA on lateColor(latePct, breaks), in either theme. */
export function lateTextColor(latePct: number, breaks: readonly number[]): string {
  return `var(--late-${lateBand(latePct, breaks)}-text)`;
}

export const tooltipStyle = {
  backgroundColor: CHART.tooltipBg,
  border: `1px solid ${CHART.tooltipBorder}`,
  borderRadius: 6,
  color: CHART.text,
  fontSize: 13,
} as const;
