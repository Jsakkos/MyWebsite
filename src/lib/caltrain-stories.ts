import fs from "node:fs";
import path from "node:path";

/**
 * Types and loaders for the nightly stories export written by the tracker
 * pipeline (src/pipeline/stories.py in the caltrain-tracker repo). The shapes
 * mirror that contract. Loaders read at build time and return null (with one
 * console.warn) on any data problem, so a bad export never fails the build.
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

const DATA_DIR = path.join(process.cwd(), "public", "data", "caltrain");
const STORIES_FILE = path.join(DATA_DIR, "stories.json");
const EXAMPLE_DAY_FILE = path.join(DATA_DIR, "stories_example_day.json");

const UNITS: readonly string[] = ["pct", "count", "minutes", "hours", "weeks", "time", "text"];

const isObject = (x: unknown): x is Record<string, unknown> =>
  typeof x === "object" && x !== null && !Array.isArray(x);

/** Throws an Error naming the first problem with a stories.json payload. */
function checkStories(s: unknown): void {
  if (!isObject(s)) throw new Error("not an object");
  if (s.schema_version !== 1) throw new Error(`schema_version is ${String(s.schema_version)}, expected 1`);
  if (!isObject(s.figures)) throw new Error("figures is missing");
  for (const key of STORY_FIGURE_KEYS) {
    const f = s.figures[key];
    if (!isObject(f)) throw new Error(`figure ${key} is missing`);
    if (typeof f.unit !== "string" || !UNITS.includes(f.unit)) {
      throw new Error(`figure ${key} has unknown unit ${String(f.unit)}`);
    }
    if (f.unit === "text" || f.unit === "time") {
      if (typeof f.value !== "string") throw new Error(`figure ${key} is not a string`);
    } else if (typeof f.value !== "number" || !Number.isFinite(f.value)) {
      throw new Error(`figure ${key} is not a finite number`);
    }
  }
  if (!isObject(s.stories)) throw new Error("stories is missing");
  const st = s.stories;
  for (const story of ["recovery", "express", "afternoons", "saturday"]) {
    const block = st[story];
    if (!isObject(block) || typeof block.holds !== "boolean") throw new Error(`stories.${story}.holds is not a boolean`);
  }
  const arrays: [string, string][] = [
    ["opener", "heatmap"],
    ["recovery", "fan"],
    ["express", "league"],
    ["express", "groups"],
    ["express", "headway"],
    ["afternoons", "events"],
    ["saturday", "days"],
  ];
  for (const [story, key] of arrays) {
    const block = st[story];
    if (!isObject(block) || !Array.isArray(block[key])) throw new Error(`stories.${story}.${key} is missing`);
  }
}

function checkExampleDay(d: unknown): void {
  if (!isObject(d)) throw new Error("not an object");
  if (typeof d.date !== "string") throw new Error("date is missing");
  if (!isObject(d.window) || typeof d.window.start !== "string" || typeof d.window.end !== "string") {
    throw new Error("window is missing");
  }
  if (d.freeze !== null && (!isObject(d.freeze) || typeof d.freeze.start !== "string" || typeof d.freeze.end !== "string")) {
    throw new Error("freeze is neither null nor a start and end");
  }
  if (!Array.isArray(d.stations)) throw new Error("stations is missing");
  if (!Array.isArray(d.trains)) throw new Error("trains is missing");
}

function load<T>(file: string, check: (x: unknown) => void, label: string): T | null {
  try {
    const parsed: unknown = JSON.parse(fs.readFileSync(file, "utf8"));
    check(parsed);
    return parsed as T;
  } catch (e) {
    console.warn(`caltrain ${label}: ignoring ${file}: ${e instanceof Error ? e.message : String(e)}`);
    return null;
  }
}

/** Reads stories.json at build time. Null (and one warning) on any data problem. */
export function loadStories(file: string = STORIES_FILE): StoriesData | null {
  return load<StoriesData>(file, checkStories, "stories");
}

/** Reads stories_example_day.json at build time. Null (and one warning) on any data problem. */
export function loadExampleDay(file: string = EXAMPLE_DAY_FILE): ExampleDay | null {
  return load<ExampleDay>(file, checkExampleDay, "example day");
}

export function storiesAvailable(file?: string): boolean {
  return loadStories(file) !== null;
}

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
