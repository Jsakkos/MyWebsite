import { CHART, COMMUTE_COLORS, DIRECTION_COLORS, performanceColor } from "@/components/caltrain/palette";

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
