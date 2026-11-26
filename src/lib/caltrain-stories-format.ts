/**
 * Types, constants and formatters for the Caltrain stories data. Nothing here
 * touches the filesystem, so client components may import from this module.
 * The fs loaders live in caltrain-stories.ts, which re-exports all of this.
 */

export type FigureUnit = "pct" | "count" | "minutes" | "hours" | "weeks" | "time" | "text";

export interface Figure {
  value: number | string;
  unit: FigureUnit;
}

export type StoryId = "recovery" | "express" | "afternoons" | "saturday";

export type Direction = "NB" | "SB";
export type Service = "Local" | "Limited" | "Express";

export interface HeatmapCell {
  dow: number; // 1-7
  hour: number; // 5-23
  n: number;
  late_pct: number;
}

export interface FanRow {
  k: number; // 1-10
  n: number;
  p10: number;
  p25: number;
  median: number;
  p75: number;
  p90: number;
  back_on_time_pct: number;
}

export interface LeagueRow {
  train: string;
  service: string;
  direction: Direction;
  departs: string; // HH:MM
  last_stop: string;
  runs: number;
  late_pct: number;
  ci_low: number;
  ci_high: number;
}

export interface GroupRow {
  service: Service;
  direction: Direction;
  n: number;
  late_pct: number;
}

export interface HeadwayRow {
  leader: "≤ 0" | "0–4" | "4–10" | "10–20" | "> 20";
  headway: "≤ 10" | "11–20" | "21–30" | "31–40";
  n: number;
  late_pct: number;
}

export interface StopEvent {
  date: string; // YYYY-MM-DD
  start: string; // HH:MM
  hold_minutes: number;
  held_near: string;
  trains_late: number;
  cancelled: number;
  hours_to_normal: number | null;
}

export interface DayRow {
  date: string; // YYYY-MM-DD
  type: "weekday" | "Saturday" | "Sunday";
  n: number;
  late_pct: number;
}

export interface StoriesData {
  schema_version: 1;
  generated_at: string; // Pacific wall time
  data_through: string; // YYYY-MM-DD
  first_day: string; // YYYY-MM-DD
  clean_days: number;
  figures: Record<string, Figure>;
  stories: {
    opener: { heatmap: HeatmapCell[] };
    recovery: { holds: boolean; fan: FanRow[] };
    express: { holds: boolean; league: LeagueRow[]; groups: GroupRow[]; headway: HeadwayRow[] };
    afternoons: { holds: boolean; events: StopEvent[] };
    saturday: { holds: boolean; days: DayRow[] };
  };
}

export interface ExampleDayStation {
  name: string;
  distance: number; // km along the route
  order: number;
}

export interface ExampleDayPoint {
  time: string; // HH:MM:SS
  distance: number; // km along the route
}

export interface ExampleDayTrain {
  trip_id: string;
  direction: Direction;
  max_delay_min: number;
  points: ExampleDayPoint[];
}

export interface ExampleDay {
  date: string;
  window: { start: string; end: string };
  freeze: { start: string; end: string } | null;
  stations: ExampleDayStation[];
  trains: ExampleDayTrain[];
}

/** Exactly the tracker's REQUIRED_FIGURES names (stories.py). */
export const STORY_FIGURE_KEYS: readonly string[] = [
  "on_time_pct",
  "recovery_trips",
  "recovery_median_change_5",
  "recovery_worse_5_pct",
  "recovery_better_5_pct",
  "recovery_back_on_time_pct",
  "worst_train",
  "worst_train_departs",
  "worst_train_late_pct",
  "worst_train_last_stop",
  "worst_train_service",
  "worst_train_direction",
  "nb_in_worst_25",
  "express_nb_late_pct",
  "express_sb_late_pct",
  "local_nb_late_pct",
  "local_sb_late_pct",
  "headway_close_late_pct",
  "headway_far_late_pct",
  "stops_count",
  "stops_every_weeks",
  "stops_late15_share_pct",
  "stops_hours_to_normal_median",
  "stops_longest_hold_minutes",
  "cancel_express_pct",
  "cancel_local_pct",
  "example_trains_late",
  "worst_days_10_share_pct",
  "sat_late_pct",
  "weekday_late_pct",
  "sun_late_pct",
  "sat_bad_day_pct",
  "weekday_bad_day_pct",
  "saturdays",
];

export const STORIES_PATH = "/projects/caltrain-tracker/stories/";
export const DASHBOARD_PATH = "/projects/caltrain-tracker/dashboard/";

/** "17:22" -> "5:22 p.m." */
export function formatClock(hhmm: string): string {
  const [h, m] = hhmm.split(":");
  const hour = Number(h);
  const suffix = hour >= 12 ? "p.m." : "a.m.";
  return `${hour % 12 || 12}:${m} ${suffix}`;
}

/** At most one decimal, no trailing zero: 50 -> "50", 10.7 -> "10.7". */
function trim(n: number): string {
  return String(Number(n.toFixed(1)));
}

function plural(n: number, one: string, many: string): string {
  return `${trim(n)} ${n === 1 ? one : many}`;
}

export function formatFigure(f: Figure): string {
  if (f.unit === "text") return String(f.value);
  if (f.unit === "time") return formatClock(String(f.value));
  const n = Number(f.value);
  switch (f.unit) {
    case "pct":
      return `${trim(n)}%`;
    case "count":
      return n.toLocaleString("en-US");
    case "weeks":
      return plural(n, "week", "weeks");
    case "hours":
      return plural(n, "hour", "hours");
    case "minutes":
      return plural(n, "minute", "minutes");
  }
}

/** Whole local calendar days from dataThrough (YYYY-MM-DD) to today; never negative. */
export function daysStale(dataThrough: string, today: Date): number {
  const [y, m, d] = dataThrough.split("-").map(Number);
  const then = Date.UTC(y, m - 1, d);
  const now = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
  return Math.max(0, Math.round((now - then) / 86_400_000));
}
