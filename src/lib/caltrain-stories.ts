import fs from "node:fs";
import path from "node:path";
import { STORY_FIGURE_KEYS, type ExampleDay, type StoriesData } from "@/lib/caltrain-stories-format";

export * from "@/lib/caltrain-stories-format";

/**
 * Types and loaders for the nightly stories export written by the tracker
 * pipeline (src/pipeline/stories.py in the caltrain-tracker repo). The shapes
 * mirror that contract. Loaders read at build time and return null (with one
 * console.warn) on any data problem, so a bad export never fails the build.
 */

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
  if (typeof s.data_through !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(s.data_through)) {
    throw new Error("data_through is not a YYYY-MM-DD date");
  }
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
