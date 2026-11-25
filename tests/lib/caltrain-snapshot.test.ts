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
  expect(["all stops, unadjusted", "within 4 minutes of schedule"]).toContain(s.label);
  expect(typeof s.cleaned).toBe("boolean");
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
    cleaned: false,
  });
});

test("uses the clean block when the export has one", () => {
  const file = tempFile(
    JSON.stringify({
      on_time_percentage: 93.36,
      total_arrivals: 771334,
      days_tracked: 451,
      date_range: { start: "2025-08-10", end: "2026-11-24" },
      clean: {
        on_time_percentage: 92.8,
        total_arrivals: 650000,
        days_tracked: 430,
        rolling_7d_on_time: 91.5,
        rolling_30d_on_time: 92.2,
      },
    }),
  );
  expect(getCaltrainSnapshot(file)).toEqual({
    onTimePct: "92.8%",
    arrivals: "650,000",
    days: 430,
    since: "Aug 2025",
    label: "within 4 minutes of schedule",
    cleaned: true,
  });
});

test("missing or malformed file returns null instead of breaking the build", () => {
  expect(getCaltrainSnapshot("does/not/exist.json")).toBeNull();
  expect(getCaltrainSnapshot(tempFile("{"))).toBeNull();
  expect(getCaltrainSnapshot(tempFile("{}"))).toBeNull();
});
