import { isBadFeedDay, lastStopLabel } from "@/lib/caltrain-dashboard";
import type { DailyPerformance, TrainPerformance } from "@/lib/api";

const train: TrainPerformance = {
  trip_id: 101,
  total_stops: 200,
  on_time_count: 180,
  avg_delay_min: 1.2,
  days_observed: 90,
  on_time_pct: 90,
};

const day: DailyPerformance = {
  date: "2026-11-01",
  total_trips: 100,
  on_time_count: 90,
  minor_count: 6,
  major_count: 4,
  avg_delay_min: 1,
  on_time_pct: 90,
  minor_pct: 6,
  major_pct: 4,
};

describe("lastStopLabel", () => {
  test("names the stop and the weekday late share", () => {
    expect(lastStopLabel({ ...train, last_stop_late_pct: 50, last_stop_name: "22nd Street" })).toBe(
      "late at 22nd Street on 50% of weekday runs",
    );
  });

  test("is null when the share is null or absent", () => {
    expect(lastStopLabel({ ...train, last_stop_late_pct: null, last_stop_name: "22nd Street" })).toBeNull();
    expect(lastStopLabel(train)).toBeNull();
  });

  test("is null without a stop name, so the sentence never says null", () => {
    expect(lastStopLabel({ ...train, last_stop_late_pct: 12, last_stop_name: null })).toBeNull();
  });

  test("keeps one decimal at most", () => {
    expect(lastStopLabel({ ...train, last_stop_late_pct: 12.34, last_stop_name: "Gilroy" })).toBe(
      "late at Gilroy on 12.3% of weekday runs",
    );
  });
});

describe("isBadFeedDay", () => {
  test("is true only when bad_feed is true", () => {
    expect(isBadFeedDay({ ...day, bad_feed: true })).toBe(true);
    expect(isBadFeedDay({ ...day, bad_feed: false })).toBe(false);
    expect(isBadFeedDay(day)).toBe(false);
  });
});
