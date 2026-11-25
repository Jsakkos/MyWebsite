import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { getCaltrainSnapshot } from "@/lib/caltrain-snapshot";

function tempFile(body: string): string {
  const file = path.join(fs.mkdtempSync(path.join(os.tmpdir(), "snap-")), "stats.json");
  fs.writeFileSync(file, body);
  return file;
}

test("formats the real stats file", () => {
  const s = getCaltrainSnapshot()!;
  expect(s.onTimePct).toMatch(/^\d{2}\.\d%$/);
  expect(s.arrivals).toMatch(/^\d{1,3}(,\d{3})+$/);
  expect(s.days).toBeGreaterThan(0);
  expect(s.since).toMatch(/^[A-Z][a-z]{2} \d{4}$/);
  expect(s.label).toBe("all stops, unadjusted");
});

test("formats known values exactly", () => {
  const file = tempFile(
    JSON.stringify({
      on_time_percentage: 93.36,
      total_arrivals: 771334,
      days_tracked: 451,
      date_range: { start: "2025-08-10", end: "2026-11-24" },
    }),
  );
  expect(getCaltrainSnapshot(file)).toEqual({
    onTimePct: "93.4%",
    arrivals: "771,334",
    days: 451,
    since: "Aug 2025",
    label: "all stops, unadjusted",
  });
});

test("missing or malformed file returns null instead of breaking the build", () => {
  expect(getCaltrainSnapshot("does/not/exist.json")).toBeNull();
  expect(getCaltrainSnapshot(tempFile("{"))).toBeNull();
  expect(getCaltrainSnapshot(tempFile("{}"))).toBeNull();
});
