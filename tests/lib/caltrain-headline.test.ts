import { headline } from "@/lib/caltrain-headline";
import type { CaltrainStats } from "@/lib/api";

const legacy: CaltrainStats = {
  on_time_percentage: 93.4,
  minor_delay_percentage: 4.1,
  major_delay_percentage: 2.5,
  total_arrivals: 771334,
  avg_delay_minutes: 1.2,
  median_delay_minutes: 0.5,
  last_updated: "2026-11-25T02:30:00Z",
  date_range: { start: "2025-08-10", end: "2026-11-24" },
  days_tracked: 451,
  rolling_7d_on_time: 92.1,
  rolling_30d_on_time: 93.0,
};

test("uses the clean block when present", () => {
  const h = headline({
    ...legacy,
    clean: {
      on_time_percentage: 92.8,
      minor_delay_percentage: 5,
      major_delay_percentage: 2.2,
      total_arrivals: 650000,
      avg_delay_minutes: 1.5,
      median_delay_minutes: 0.7,
      days_tracked: 430,
      bad_feed_days: 21,
      rolling_7d_on_time: 91.5,
      rolling_30d_on_time: 92.2,
    },
  });
  expect(h).toEqual({
    onTimePct: 92.8,
    rolling7d: 91.5,
    rolling30d: 92.2,
    totalArrivals: 650000,
    daysTracked: 430,
    minorPct: 5,
    majorPct: 2.2,
    avgDelay: 1.5,
    medianDelay: 0.7,
    cleaned: true,
    label: "within 4 minutes of schedule",
  });
});

test("falls back to the legacy figures without a clean block", () => {
  expect(headline(legacy)).toEqual({
    onTimePct: 93.4,
    rolling7d: 92.1,
    rolling30d: 93.0,
    totalArrivals: 771334,
    daysTracked: 451,
    minorPct: 4.1,
    majorPct: 2.5,
    avgDelay: 1.2,
    medianDelay: 0.5,
    cleaned: false,
    label: "all stops, unadjusted",
  });
});

test("falls back to legacy when the clean block lacks rolling figures", () => {
  const partial = {
    on_time_percentage: 92.8,
    total_arrivals: 650000,
    days_tracked: 430,
  } as unknown as CaltrainStats["clean"];
  const h = headline({ ...legacy, clean: partial });
  expect(h.cleaned).toBe(false);
  expect(h.label).toBe("all stops, unadjusted");
  expect(h.rolling7d).toBe(92.1);
});

test("falls back to legacy, whole, when the clean block lacks a delay figure", () => {
  const full = {
    on_time_percentage: 92.8,
    minor_delay_percentage: 5,
    major_delay_percentage: 2.2,
    total_arrivals: 650000,
    avg_delay_minutes: 1.5,
    median_delay_minutes: 0.7,
    days_tracked: 430,
    bad_feed_days: 21,
    rolling_7d_on_time: 91.5,
    rolling_30d_on_time: 92.2,
  };
  for (const key of ["minor_delay_percentage", "major_delay_percentage", "avg_delay_minutes", "median_delay_minutes"]) {
    const partial = { ...full, [key]: undefined } as unknown as CaltrainStats["clean"];
    const h = headline({ ...legacy, clean: partial });
    expect(h.cleaned).toBe(false);
    expect(h.onTimePct).toBe(93.4);
    expect([h.minorPct, h.majorPct, h.avgDelay, h.medianDelay]).toEqual([4.1, 2.5, 1.2, 0.5]);
  }
});
