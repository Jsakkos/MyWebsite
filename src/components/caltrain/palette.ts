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

// Text on a ramp fill: light on the two darkest bands, near-black on the rest.
// Both clear 4.5:1 against their band (tests/components/caltrain-palette.test.ts).
const CELL_TEXT_LIGHT = "#ffffff";
const CELL_TEXT_DARK = "#14120e";

/** A text color that reads on performanceColor(pct), in either theme. */
export function cellTextColor(pct: number): string {
  const fill = performanceColor(pct);
  return fill === RAMP[0][1] || fill === WORST ? CELL_TEXT_LIGHT : CELL_TEXT_DARK;
}

/**
 * Fill for a late share (the story charts). Late and on-time are complements
 * (late = more than 4 minutes behind), so this is the on-time ramp read from
 * the other end: 4% late gets the same green as 96% on time.
 */
export function lateShareColor(latePct: number): string {
  return performanceColor(100 - latePct);
}

/** A text color that reads on lateShareColor(latePct). */
export function lateShareTextColor(latePct: number): string {
  return cellTextColor(100 - latePct);
}

export const tooltipStyle = {
  backgroundColor: CHART.tooltipBg,
  border: `1px solid ${CHART.tooltipBorder}`,
  borderRadius: 6,
  color: CHART.text,
  fontSize: 13,
} as const;
