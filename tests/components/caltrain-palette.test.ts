import fs from "node:fs";
import path from "node:path";
import {
  CHART,
  COMMUTE_COLORS,
  DIRECTION_COLORS,
  LATE_BAND_COUNT,
  LATE_BREAKS,
  SERVICE_COLORS,
  lateBand,
  lateColor,
  lateTextColor,
  performanceColor,
} from "@/components/caltrain/palette";

test("performance ramp has eight bands with inclusive lower bounds", () => {
  expect(performanceColor(97)).toBe(performanceColor(95));
  expect(performanceColor(94)).not.toBe(performanceColor(96));
  expect(performanceColor(10)).toBe(performanceColor(59));
  expect(new Set([95, 90, 85, 80, 75, 70, 60, 0].map(performanceColor)).size).toBe(8);
});

test("chart colors come from theme tokens so they follow light and dark mode", () => {
  for (const value of Object.values(CHART)) expect(value).toMatch(/^var\(--[\w-]+\)$/);
});

test("commute periods get four distinct colors", () => {
  expect(new Set(Object.values(COMMUTE_COLORS)).size).toBe(4);
});

test("northbound and southbound trains get different colors in the Marey chart", () => {
  expect(DIRECTION_COLORS.NB).not.toBe(DIRECTION_COLORS.SB);
});

function luminance(hex: string): number {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  const lin = (v: number) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

function contrast(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

const css = fs.readFileSync(path.join(process.cwd(), "src/app/globals.css"), "utf8");

/** Custom properties of one theme block, with var(--x) references resolved. */
function theme(selector: string): Record<string, string> {
  const start = css.indexOf(`${selector} {`);
  const body = css.slice(start, css.indexOf("}", start));
  const raw = Object.fromEntries(
    [...body.matchAll(/--([\w-]+):\s*([^;]+);/g)].map((m) => [m[1], m[2].trim().toLowerCase()]),
  );
  const resolve = (v: string): string => {
    const ref = v.match(/^var\(--([\w-]+)\)$/);
    return ref ? resolve(raw[ref[1]]) : v;
  };
  return Object.fromEntries(Object.entries(raw).map(([k, v]) => [k, resolve(v)]));
}

const THEMES = { light: theme(":root"), dark: theme(".dark") };

/** var(--late-3) -> "late-3" */
const token = (v: string) => v.match(/^var\(--(.+)\)$/)?.[1] ?? v;

test("late bands use inclusive lower bounds", () => {
  expect(lateBand(0, LATE_BREAKS.opener)).toBe(0);
  expect(lateBand(2.9, LATE_BREAKS.opener)).toBe(0);
  expect(lateBand(3, LATE_BREAKS.opener)).toBe(1);
  expect(lateBand(13.2, LATE_BREAKS.opener)).toBe(6);
  expect(lateBand(52.4, LATE_BREAKS.headway)).toBe(5);
  expect(lateBand(95, LATE_BREAKS.headway)).toBe(6);
  for (const breaks of Object.values(LATE_BREAKS)) expect(breaks.length).toBe(LATE_BAND_COUNT - 1);
});

test.each(["light", "dark"] as const)("%s late ramp: cell text meets AA on every band of both break sets", (mode) => {
  const t = THEMES[mode];
  for (const breaks of Object.values(LATE_BREAKS)) {
    for (const pct of [0, ...breaks]) {
      const bg = t[token(lateColor(pct, breaks))];
      const fg = t[token(lateTextColor(pct, breaks))];
      expect(bg, `${mode} ${lateColor(pct, breaks)}`).toMatch(/^#[0-9a-f]{6}$/);
      expect(fg, `${mode} ${lateTextColor(pct, breaks)}`).toMatch(/^#[0-9a-f]{6}$/);
      expect(contrast(bg, fg), `${mode} band ${lateBand(pct, breaks)}`).toBeGreaterThanOrEqual(4.5);
    }
  }
});

test.each(["light", "dark"] as const)("%s late ramp: a higher late share stands out more from the paper", (mode) => {
  const t = THEMES[mode];
  const vsPaper = Array.from({ length: LATE_BAND_COUNT }, (_, i) => contrast(t[`late-${i}`], t.paper));
  for (let i = 1; i < vsPaper.length; i++) expect(vsPaper[i], `${mode} band ${i}`).toBeGreaterThan(vsPaper[i - 1]);
  // The quiet end is still a visible tint, not the paper itself.
  expect(t["late-0"]).not.toBe(t.paper);
  expect(t["late-0"]).not.toBe(t["paper-2"]);
});

test("each service gets its own series color", () => {
  expect(SERVICE_COLORS.Express).toBe("var(--series-1)");
  expect(SERVICE_COLORS.Limited).toBe("var(--series-2)");
  expect(SERVICE_COLORS.Local).toBe("var(--series-3)");
});
