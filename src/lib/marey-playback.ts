// Pure helpers for the playable time-distance diagram. No React, no DOM, no fs,
// so the client component can import them.
import { formatClock, type ExampleDay } from "@/lib/caltrain-stories-format";
import { minutesOfDay, trimNumber } from "@/lib/charts";

/** How long Play takes to sweep the whole window. */
export const PLAYBACK_MS = 20_000;

export type DelayBand = "ontime" | "minor" | "major";

/** A train's worst delay as a band: ≤ 4 on time, ≤ 15 minor, > 15 major. */
export function delayBand(maxDelayMin: number): DelayBand {
  if (maxDelayMin <= 4) return "ontime";
  if (maxDelayMin <= 15) return "minor";
  return "major";
}

/**
 * The points at or before `t` (minutes of day), plus one interpolated at
 * exactly `t` when it falls between two points. Every numeric field other
 * than `m` is interpolated linearly. Points must be sorted by `m`.
 */
export function clipByMinute<P extends { m: number }>(points: P[], t: number): P[] {
  const out: P[] = [];
  for (let i = 0; i < points.length; i++) {
    const p = points[i];
    if (p.m <= t) {
      out.push(p);
      continue;
    }
    const prev = points[i - 1];
    if (prev && prev.m < t) {
      const f = (t - prev.m) / (p.m - prev.m);
      const mid = { ...p } as Record<string, unknown>;
      for (const key of Object.keys(p)) {
        const a = prev[key as keyof P];
        const b = p[key as keyof P];
        if (typeof a === "number" && typeof b === "number") mid[key] = a + (b - a) * f;
      }
      mid.m = t;
      out.push(mid as P);
    }
    break;
  }
  return out;
}

/** "HH:MM:SS" for a minute of the day (seconds rounded). */
function timeString(minutes: number): string {
  const total = Math.round(minutes * 60);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return [h, m, s].map((v) => String(v).padStart(2, "0")).join(":");
}

/**
 * A trajectory cut off at `tMinutes`: the points at or before it, plus one point
 * interpolated at exactly `tMinutes` when it falls between two points.
 */
export function clipTrajectory(
  points: { time: string; distance: number }[],
  tMinutes: number,
): { time: string; distance: number }[] {
  const timed = points.map((p) => ({ m: minutesOfDay(p.time), distance: p.distance, src: p }));
  // Kept points come back as the same objects; only the interpolated one is new.
  return clipByMinute(timed, tMinutes).map((p, i) =>
    p === timed[i] ? p.src : { time: timeString(p.m), distance: Number(p.distance.toFixed(3)) },
  );
}

/** The clock minute `elapsedMs` into a playback of the window [start, end]. */
export function playbackMinute(
  elapsedMs: number,
  start: number,
  end: number,
  durationMs: number = PLAYBACK_MS,
): number {
  const f = Math.min(1, Math.max(0, elapsedMs / durationMs));
  return start + f * (end - start);
}

/**
 * The inverse of playbackMinute: how far into a playback of [start, end] the
 * clock reads `minute`. Clamped to [0, durationMs]; a zero-width window is 0.
 */
export function elapsedForMinute(
  minute: number,
  start: number,
  end: number,
  durationMs: number = PLAYBACK_MS,
): number {
  const span = end - start;
  if (span <= 0) return 0;
  const f = Math.min(1, Math.max(0, (minute - start) / span));
  return f * durationMs;
}

/**
 * Where Play picks up: the paused or scrubbed minute when it is inside the
 * window, otherwise (the full view, or at the end) the window start.
 */
export function resumeMinute(t: number | null, start: number, end: number): number {
  return t !== null && t < end ? Math.max(start, t) : start;
}

/** 955.9 -> "3:55 p.m." (rounded down to the minute). */
export function formatMinuteClock(minutes: number): string {
  const whole = Math.floor(minutes);
  const h = Math.floor(whole / 60) % 24;
  const m = whole % 60;
  return formatClock(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
}

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

/** "2025-11-06" -> "6 November 2025" */
export function formatDayDate(date: string): string {
  const [y, m, d] = date.split("-").map(Number);
  return `${d} ${MONTHS[m - 1]} ${y}`;
}

/** One sentence from the data for the SVG's text alternative. */
export function mareySummary(day: ExampleDay): string {
  const n = day.trains.length;
  const trains = `${n} ${n === 1 ? "train" : "trains"}`;
  const head = `Time–distance diagram of ${trains} on ${formatDayDate(day.date)}, ${formatClock(
    day.window.start,
  )} to ${formatClock(day.window.end)}.`;
  const freeze = day.freeze
    ? `The whole line stopped from ${formatClock(day.freeze.start)} to ${formatClock(day.freeze.end)}`
    : "There was no line-wide stop";
  const worst = n > 0 ? Math.max(...day.trains.map((t) => t.max_delay_min)) : null;
  const tail = worst === null ? "." : `; the worst train ran ${trimNumber(worst)} minutes late.`;
  return `${head} ${freeze}${tail}`;
}
