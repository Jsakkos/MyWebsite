import {
  CHART,
  COMMUTE_COLORS,
  DIRECTION_COLORS,
  SERVICE_COLORS,
  cellTextColor,
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

test("text drawn on a heatmap cell meets WCAG AA against every ramp color", () => {
  for (const pct of [100, 95, 90, 85, 80, 75, 70, 60, 0]) {
    expect(contrast(performanceColor(pct), cellTextColor(pct))).toBeGreaterThanOrEqual(4.5);
  }
});

test("each service gets its own series color", () => {
  expect(SERVICE_COLORS.Express).toBe("var(--series-1)");
  expect(SERVICE_COLORS.Limited).toBe("var(--series-2)");
  expect(SERVICE_COLORS.Local).toBe("var(--series-3)");
});
