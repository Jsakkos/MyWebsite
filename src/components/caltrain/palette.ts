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
  empty: "var(--paper-2)",
} as const;

export const COMMUTE_COLORS: Record<"Morning" | "Evening" | "Other" | "Weekend", string> = {
  Morning: "var(--series-1)",
  Evening: "var(--series-2)",
  Other: "var(--series-3)",
  Weekend: "var(--series-4)",
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

export const tooltipStyle = {
  backgroundColor: CHART.tooltipBg,
  border: `1px solid ${CHART.tooltipBorder}`,
  borderRadius: 6,
  color: CHART.text,
  fontSize: 13,
} as const;
