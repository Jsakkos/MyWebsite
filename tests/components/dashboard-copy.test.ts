import fs from "node:fs";
import path from "node:path";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { Heatmap } from "@/components/caltrain/heatmap";
import { CommuteAnalysis } from "@/components/caltrain/commute-analysis";
import { Methodology } from "@/components/caltrain/methodology";
import { MareyDiagram } from "@/components/caltrain/marey-diagram";
import { HeroSection } from "@/components/caltrain/hero-section";
import { IncidentAnalysis } from "@/components/caltrain/incident-analysis";
import { CalendarHeatmap } from "@/components/caltrain/calendar-heatmap";
import { DailyTooltip } from "@/components/caltrain/daily-trends-chart";
import type { DailyPerformance, IncidentDetail, Incident } from "@/lib/api";

const heatmapData = [{ day_of_week: 0, hour: 8, on_time_pct: 90, total: 100 }] as never;
const commuteData = {
  Morning: { total_trips: 10, on_time_pct: 90, minor_pct: 6, major_pct: 4, avg_delay_min: 1, median_delay_min: 0.5 },
};

describe("Heatmap caption", () => {
  test("cleaned data is grouped by scheduled hour", () => {
    const html = renderToStaticMarkup(createElement(Heatmap, { data: heatmapData, cleaned: true }));
    expect(html).toContain("On-time percentage by day of week and scheduled hour.");
  });
  test("legacy data says nothing about scheduled hours", () => {
    const html = renderToStaticMarkup(createElement(Heatmap, { data: heatmapData, cleaned: false }));
    expect(html).toContain("On-time percentage by day of week and hour.");
    expect(html).not.toContain("scheduled");
  });
});

describe("CommuteAnalysis caption", () => {
  test("cleaned data explains the scheduled-hour grouping", () => {
    const html = renderToStaticMarkup(createElement(CommuteAnalysis, { data: commuteData, cleaned: true }));
    expect(html).toContain("Trips are grouped by scheduled hour");
  });
  test("legacy data has no scheduled-hour caption", () => {
    const html = renderToStaticMarkup(createElement(CommuteAnalysis, { data: commuteData, cleaned: false }));
    expect(html).not.toContain("scheduled");
  });
});

describe("Methodology", () => {
  test("cleaned data lists the cleaning rules with their real reasons", () => {
    const html = renderToStaticMarkup(createElement(Methodology, { cleaned: true }));
    expect(html).toContain("Cleaning Rules");
    expect(html).toContain("a train waiting at its origin platform looks on time whatever happens next");
    expect(html).toContain("511 drops every train from the feed at midnight");
    expect(html).toContain("real train numbers only");
    expect(html).not.toContain("no schedule to be late against");
    expect(html).not.toContain("wrong day");
    expect(html).not.toContain("placeholder");
  });
  test("legacy data describes no cleaning", () => {
    const html = renderToStaticMarkup(createElement(Methodology, { cleaned: false }));
    expect(html).not.toContain("Cleaning Rules");
    expect(html).not.toContain("left out");
    expect(html.toLowerCase()).not.toContain("feed unreliable");
    expect(html).toContain("Data Collection");
    expect(html).toContain("Delay Classification");
  });
});

describe("MareyDiagram", () => {
  const pts = (start: number, dist: (i: number) => number) =>
    Array.from({ length: 12 }, (_, i) => ({
      time: `16:${String(start + i).padStart(2, "0")}:00`,
      distance: dist(i),
    }));
  const detail: IncidentDetail = {
    incident_id: "2026-11-02-system",
    stations: [
      { name: "San Francisco Caltrain Station", distance: 0 },
      { name: "Millbrae Caltrain Station", distance: 20 },
      { name: "San Jose Diridon Caltrain Station", distance: 75 },
    ],
    trajectories: [
      // Sits still near Millbrae: the old code would label this a hold.
      { trip_id: "101", direction: "SB", points: pts(0, () => 20), is_anomalous: true, is_cascading: false, max_delay_min: 30 },
      { trip_id: "103", direction: "SB", points: pts(5, (i) => i * 5), is_anomalous: true, is_cascading: true, max_delay_min: 18 },
      { trip_id: "105", direction: "SB", points: pts(10, (i) => i * 6), is_anomalous: false, is_cascading: false, max_delay_min: 0 },
    ],
  };

  test("names what the data shows, not an inferred cause", () => {
    const html = renderToStaticMarkup(createElement(MareyDiagram, { detail }));
    expect(html).toContain("Most delayed train");
    expect(html).toContain("Other trains delayed 15 min or more");
    expect(html).not.toContain("Primary delay");
    expect(html).not.toContain("Cascading");
    expect(html).not.toMatch(/min hold/);
    expect(html).not.toContain("Train 101");
  });
});

describe("HeroSection count label", () => {
  const props = {
    onTimePct: 92,
    totalArrivals: 1000,
    daysTracked: 10,
    dateRange: { start: "2026-11-01", end: "2026-11-10" },
    rolling7d: 91,
    rolling30d: 92,
  };
  test("cleaned figures are arrivals counted", () => {
    const html = renderToStaticMarkup(createElement(HeroSection, { ...props, cleaned: true }));
    expect(html).toContain("Arrivals counted");
    expect(html).not.toContain("Arrivals logged");
  });
  test("legacy figures are arrivals logged", () => {
    const html = renderToStaticMarkup(createElement(HeroSection, { ...props, cleaned: false }));
    expect(html).toContain("Arrivals logged");
  });
});

test("the incident footnote counts trains delayed 15 min or more", () => {
  const incident: Incident = {
    id: "a",
    date: "2026-11-02",
    tier: 2,
    summary: "Delays across the line",
    trains_affected: 5,
    max_delay_min: 40,
    avg_delay_min: 20,
    on_time_pct: 50,
    severity_score: 9,
  };
  const html = renderToStaticMarkup(createElement(IncidentAnalysis, { incidents: [incident], trajectories: {} }));
  expect(html).toContain("3+ trains delayed 15 min or more on the same day");
  expect(html).toContain("individual trains delayed 15 min or more");
  expect(html).not.toContain("more than 15");
});

describe("bad-feed days are described as stale or mislocated", () => {
  const day = (date: string, extra: Partial<DailyPerformance> = {}): DailyPerformance => ({
    date,
    total_trips: 100,
    on_time_count: 90,
    minor_count: 6,
    major_count: 4,
    avg_delay_min: 1,
    on_time_pct: 90,
    minor_pct: 6,
    major_pct: 4,
    ...extra,
  });

  test("calendar note", () => {
    const html = renderToStaticMarkup(createElement(CalendarHeatmap, { data: [day("2026-11-03", { bad_feed: true })] }));
    expect(html).toContain("stale or mislocated");
    expect(html).not.toContain("partial");
  });

  test("daily tooltip", () => {
    const html = renderToStaticMarkup(
      createElement(DailyTooltip, {
        active: true,
        label: "2026-11-03",
        payload: [{ name: "On Time", value: null, payload: { ...day("2026-11-03"), bad_feed: true } as never }],
      }),
    );
    expect(html).toContain("stale or mislocated");
    expect(html).not.toContain("partial");
  });

  test("no source file still says stale or partial", () => {
    for (const f of [
      "src/components/caltrain/calendar-heatmap.tsx",
      "src/components/caltrain/daily-trends-chart.tsx",
      "src/lib/api.ts",
    ]) {
      expect(fs.readFileSync(path.join(process.cwd(), f), "utf8")).not.toContain("stale or partial");
    }
  });
});

test("the dashboard gates cleaned-only copy on head.cleaned", () => {
  const src = fs.readFileSync(
    path.join(process.cwd(), "src", "app", "projects", "caltrain-tracker", "dashboard", "page.tsx"),
    "utf8",
  );
  expect(src).toMatch(/<Methodology cleaned=\{head\.cleaned\}/);
  expect(src).toMatch(/<Heatmap[^>]*cleaned=\{head\.cleaned\}/);
  expect(src).toMatch(/<CommuteAnalysis[^>]*cleaned=\{head\.cleaned\}/);
  expect(src).toMatch(/<HeroSection[\s\S]*?cleaned=\{head\.cleaned\}/);
  expect(src).not.toContain("Cleaning Rules");
});
