import { bandPath, linearScale, minutesOfDay } from "@/lib/charts";

test("linearScale maps the domain onto the range", () => {
  expect(linearScale([0, 10], [0, 100])(2.5)).toBe(25);
  // An inverted range, as for an SVG y axis.
  expect(linearScale([0, 10], [100, 0])(2.5)).toBe(75);
  // A zero-width domain does not divide by zero.
  expect(linearScale([5, 5], [0, 100])(5)).toBe(0);
});

test("bandPath is a closed path along the top edge and back along the bottom", () => {
  const d = bandPath([
    { x: 0, lo: 10, hi: 2 },
    { x: 50, lo: 12, hi: 1 },
  ]);
  expect(d.startsWith("M")).toBe(true);
  expect(d.endsWith("Z")).toBe(true);
  expect(d).toBe("M0 2 L50 1 L50 12 L0 10 Z");
  expect(bandPath([])).toBe("");
});

test("minutesOfDay reads HH:MM and HH:MM:SS", () => {
  expect(minutesOfDay("15:55:30")).toBe(955.5);
  expect(minutesOfDay("15:55")).toBe(955);
  expect(minutesOfDay("00:00")).toBe(0);
});
