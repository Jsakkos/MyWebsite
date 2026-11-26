// Small geometry helpers for the hand-built SVG charts. No React, no DOM.

/** A linear map from `domain` onto `range`. A zero-width domain maps to range[0]. */
export function linearScale(
  domain: [number, number],
  range: [number, number],
): (v: number) => number {
  const [d0, d1] = domain;
  const [r0, r1] = range;
  const span = d1 - d0;
  if (span === 0) return () => r0;
  return (v) => r0 + ((v - d0) / span) * (r1 - r0);
}

/** One decimal at most, so paths stay short and stable across renders. */
function n(v: number): string {
  return String(Math.round(v * 10) / 10);
}

/**
 * A closed SVG path for a band: forward along `hi`, back along `lo`.
 * Points are in pixel coordinates and should be sorted by x.
 */
export function bandPath(points: { x: number; lo: number; hi: number }[]): string {
  if (points.length === 0) return "";
  const top = points.map((p, i) => `${i === 0 ? "M" : "L"}${n(p.x)} ${n(p.hi)}`);
  const bottom = [...points].reverse().map((p) => `L${n(p.x)} ${n(p.lo)}`);
  return [...top, ...bottom, "Z"].join(" ");
}

/** An open SVG polyline path through the points, in order. */
export function linePath(points: { x: number; y: number }[]): string {
  return points.map((p, i) => `${i === 0 ? "M" : "L"}${n(p.x)} ${n(p.y)}`).join(" ");
}

/** "15:55" -> 955, "15:55:30" -> 955.5 */
export function minutesOfDay(time: string): number {
  const [h, m, s = 0] = time.split(":").map(Number);
  return h * 60 + m + s / 60;
}

/** The smallest multiple of `step` that is at least `v` (and at least `step`). */
export function niceCeil(v: number, step: number): number {
  return Math.max(step, Math.ceil(v / step) * step);
}

/** Ticks from `lo` to `hi` inclusive, every `step`. */
export function ticks(lo: number, hi: number, step: number): number[] {
  const out: number[] = [];
  for (let v = Math.ceil(lo / step) * step; v <= hi + 1e-9; v += step) out.push(Math.round(v * 1e6) / 1e6);
  return out;
}

/** At most one decimal, no trailing zero: 48 -> "48", 10.7 -> "10.7". */
export function trimNumber(v: number): string {
  return String(Number(v.toFixed(1)));
}
