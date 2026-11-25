import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { DailyTooltip } from "@/components/caltrain/daily-trends-chart";
import { CalendarHeatmap, DayTooltip } from "@/components/caltrain/calendar-heatmap";
import { IncidentAnalysis } from "@/components/caltrain/incident-analysis";
import { trendSeries } from "@/lib/caltrain-dashboard";
import type { DailyPerformance, Incident } from "@/lib/api";

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

describe("CalendarHeatmap", () => {
  test("draws bad-feed days in the field color, titled and keyed", () => {
    const html = renderToStaticMarkup(
      createElement(CalendarHeatmap, { data: [day("2026-11-02"), day("2026-11-03", { bad_feed: true })] }),
    );
    expect(html).toContain('fill="var(--field)"');
    expect(html).toContain("feed unreliable</title>");
    expect(html).toContain("Feed unreliable:");
  });

  test("legacy data (no bad_feed) has no feed-unreliable marks", () => {
    const html = renderToStaticMarkup(createElement(CalendarHeatmap, { data: [day("2026-11-02"), day("2026-11-03")] }));
    expect(html).not.toContain("var(--field)");
    expect(html.toLowerCase()).not.toContain("feed unreliable");
  });
});

describe("IncidentAnalysis", () => {
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

  test("shows where trains were held when known, and nothing for null or absent", () => {
    const render = (i: Incident) =>
      renderToStaticMarkup(createElement(IncidentAnalysis, { incidents: [i], trajectories: {} }));
    expect(render({ ...incident, held_near: "Millbrae" })).toContain("Trains held near");
    expect(render({ ...incident, held_near: "Millbrae" })).toContain("Millbrae");
    for (const i of [{ ...incident, held_near: null }, incident]) {
      const html = render(i);
      expect(html).not.toContain("Trains held near");
      expect(html).not.toContain("null");
      expect(html).not.toContain("undefined");
    }
  });
});

describe("DayTooltip", () => {
  test("a bad-feed day shows its date and 'Feed unreliable' but no on-time share", () => {
    const html = renderToStaticMarkup(createElement(DayTooltip, { day: day("2026-11-03", { bad_feed: true }) }));
    expect(html).toContain("Nov 3");
    expect(html).toContain("Feed unreliable");
    expect(html).not.toContain("On-time");
    expect(html).not.toContain("90%");
  });

  test("a normal day shows its figures", () => {
    const html = renderToStaticMarkup(createElement(DayTooltip, { day: day("2026-11-03") }));
    expect(html).toContain("On-time: 90%");
    expect(html).not.toContain("Feed unreliable");
  });
});

describe("DailyTooltip", () => {
  const entry = (row: ReturnType<typeof trendSeries>[number]) => [
    { name: "On Time", value: row.on_time_pct, color: "var(--ontime)", payload: row },
  ];
  test("a bad-feed day says so and lists no percentages", () => {
    const [row] = trendSeries([day("2026-11-03", { bad_feed: true })]);
    const html = renderToStaticMarkup(createElement(DailyTooltip, { active: true, label: "2026-11-03", payload: entry(row) }));
    expect(html).toContain("(feed unreliable)");
    expect(html).not.toContain("%");
    expect(html).not.toContain("null");
  });
  test("a normal day lists its shares", () => {
    const [row] = trendSeries([day("2026-11-03")]);
    const html = renderToStaticMarkup(createElement(DailyTooltip, { active: true, label: "2026-11-03", payload: entry(row) }));
    expect(html).toContain("On Time: 90.0%");
    expect(html).not.toContain("feed unreliable");
  });
});
