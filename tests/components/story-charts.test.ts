import fs from "node:fs";
import path from "node:path";
import { createElement, type ComponentType } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import type { ExampleDay, StoriesData } from "@/lib/caltrain-stories-format";
import { PlayableMarey } from "@/components/caltrain/stories/playable-marey";
import { HeadlineStrip } from "@/components/caltrain/stories/headline-strip";
import { OpenerHeatmap } from "@/components/caltrain/stories/opener-heatmap";
import { RecoveryFan } from "@/components/caltrain/stories/recovery-fan";
import { LeagueTable } from "@/components/caltrain/stories/league-table";
import { HeadwayGrid } from "@/components/caltrain/stories/headway-grid";
import { DayStrip } from "@/components/caltrain/stories/day-strip";
import { TrainLeaderboard } from "@/components/caltrain/train-leaderboard";
import type { TrainPerformance } from "@/lib/api";
import { StopsTable } from "@/components/caltrain/stories/stops-table";

const data: StoriesData = JSON.parse(
  fs.readFileSync(path.join(process.cwd(), "tests", "fixtures", "caltrain", "stories.json"), "utf8"),
);
const { figures, stories } = data;

function render<P extends object>(Chart: ComponentType<P>, props: P): string {
  return renderToStaticMarkup(createElement(Chart, props));
}

/** Every aria-label value in the markup. */
function ariaLabels(html: string): string[] {
  return [...html.matchAll(/aria-label="([^"]*)"/g)].map((m) => m[1]);
}

const svgCharts: [string, () => string][] = [
  ["OpenerHeatmap", () => render(OpenerHeatmap, { data: stories.opener })],
  ["RecoveryFan", () => render(RecoveryFan, { data: stories.recovery, figures })],
  ["LeagueTable", () => render(LeagueTable, { data: stories.express })],
  ["HeadwayGrid", () => render(HeadwayGrid, { data: stories.express })],
  ["DayStrip", () => render(DayStrip, { data: stories.saturday, figures })],
];

describe.each(svgCharts)("%s", (_name, html) => {
  test("is a figure with a captioned, labelled SVG image", () => {
    const out = html();
    expect(out).toContain("<figure");
    expect(out).toContain("<figcaption");
    expect(out).toContain('role="img"');
    const labels = ariaLabels(out);
    expect(labels.length).toBeGreaterThan(0);
    for (const label of labels) expect(label.trim().length).toBeGreaterThan(20);
  });

  test("uses no colors outside the theme tokens and the palette ramp", () => {
    const colors = [...html().matchAll(/(?:fill|stroke)="([^"]+)"/g)].map((m) => m[1]);
    for (const c of colors) expect(c).toMatch(/^(var\(--[\w-]+\)|#[0-9a-f]{6}|none|url\(#[\w-]+\))$/);
  });
});

test("OpenerHeatmap summary names the worst slot from the data", () => {
  const out = render(OpenerHeatmap, { data: stories.opener });
  expect(ariaLabels(out)[0]).toContain("Saturday");
  expect(ariaLabels(out)[0]).toContain("13.2%");
});

/** The fill of the cell whose tooltip starts with `title`. */
function cellFill(html: string, title: string): string | undefined {
  const at = html.indexOf(`<title>${title}`);
  const rect = html.lastIndexOf("<rect", at);
  return html.slice(rect, at).match(/fill="([^"]+)"/)?.[1];
}

test("OpenerHeatmap draws the worst slot warmest and the best slot quietest", () => {
  const out = render(OpenerHeatmap, { data: stories.opener });
  expect(cellFill(out, "Saturday, noon hour")).toBe("var(--late-6)"); // 13.2%
  expect(cellFill(out, "Sunday, 9 a.m. hour")).toBe("var(--late-1)"); // 3.7%
  expect(cellFill(out, "Monday, 7 a.m. hour")).toBe("var(--late-2)"); // 6.1%: 5 ≤ x < 7
  expect(cellFill(out, "Monday, 5 a.m. hour")).toBe("none"); // no data
});

test("OpenerHeatmap key shows only the bands the data reaches", () => {
  const out = render(OpenerHeatmap, { data: stories.opener });
  const key = out.slice(0, out.indexOf('role="img"'));
  expect(key).not.toContain("var(--late-0)"); // the fixture's lowest is 3.7%
  for (const band of [1, 2, 3, 4, 5, 6]) expect(key).toContain(`var(--late-${band})`);
  const low = render(OpenerHeatmap, { data: { heatmap: [{ dow: 1, hour: 7, n: 10, late_pct: 2 }, { dow: 1, hour: 8, n: 10, late_pct: 6 }] } });
  const lowKey = low.slice(0, low.indexOf('role="img"'));
  expect(lowKey).toContain("var(--late-0)");
  expect(lowKey).toContain("var(--late-2)");
  expect(lowKey).not.toContain("var(--late-3)");
});

test("RecoveryFan marks the back-on-time line and summarises the change after 5 stops", () => {
  const out = render(RecoveryFan, { data: stories.recovery, figures });
  // The line is an approximate reference, labelled as such; the real share is in the caption.
  expect(out).toContain("≈ back on time, for a train 10 min late");
  expect(out).not.toContain("make it");
  expect(out).toContain('stroke-dasharray');
  const caption = out.slice(out.indexOf("<figcaption"));
  expect(caption).toContain("approximate");
  expect(caption).toContain("0.3% were back within 4 minutes of schedule ten stops later");
  expect(out).not.toContain("end of the line");
  expect(out).not.toContain("get back on time");
  expect(ariaLabels(out)[0]).toContain("0.3% are back on time ten stops later");
  expect(ariaLabels(out)[0]).toContain("+1.2 minutes");
  expect(ariaLabels(out)[0]).toContain("0.3%");
});

test("LeagueTable labels each train and shows its late share", () => {
  const out = render(LeagueTable, { data: stories.express });
  expect(out).toContain("Train 523");
  expect(out).toContain("5:22 p.m. Express NB");
  expect(out).toContain("48%");
  expect(out).toContain("50%");
});

test("HeadwayGrid prints late share and run count in its cells", () => {
  const out = render(HeadwayGrid, { data: stories.express });
  expect(out).toContain("52.4%");
  expect(out).toContain("1,820");
  // The headway break set: 52.4% is band 5, 4.4% band 0.
  expect(out).toContain('fill="var(--late-5)"');
  expect(out).toContain('fill="var(--late-0)"');
  expect(out).toContain('fill="var(--late-5-text)"');
});

test("DayStrip draws one dot per day and a labelled 15% line", () => {
  const out = render(DayStrip, { data: stories.saturday, figures });
  // Each day appears twice: once in the wide and once in the narrow layout.
  expect(out.match(/<circle/g)?.length).toBe(stories.saturday.days.length * 2);
  expect(out).toContain("15%");
  // Solid dots, so they keep their 3:1 contrast against the paper.
  expect(out).not.toMatch(/<circle[^>]*fill-opacity/);
  // Deterministic: two renders are identical.
  expect(render(DayStrip, { data: stories.saturday, figures })).toBe(out);
});

test("HeadlineStrip links its four figures to the four stories", () => {
  const out = render(HeadlineStrip, { figures });
  for (const n of [1, 2, 3, 4]) expect(out).toContain(`href="#story-${n}"`);
  expect(out).toContain("0.3%");
  expect(out).toContain("48%");
  expect(out).toContain("10.7%");
  expect(out).toContain("27.3%");
  expect(out).toContain("5:22 p.m.");
  // late15 is strictly more than 15 minutes, counted over each stop and the hours after it.
  expect(out).toContain("line-wide stops and the hours after them hold 27.3% of arrivals more than 15 minutes late");
  expect(out).not.toContain("15 or more");
  // The back-on-time share is measured at exactly ten stops on, not anywhere before the end of the line.
  expect(out).toContain("of trains that fall 10 minutes behind are back on time ten stops later");
  expect(out).not.toContain("get back on time");
});

test("OpenerHeatmap's columns are scheduled hours at each stop", () => {
  const out = render(OpenerHeatmap, { data: stories.opener });
  expect(out).toContain("Each column is one scheduled hour at each stop.");
  expect(out).not.toContain("hour of departures");
});

test("LeagueTable says how many runs a train needs to be ranked", () => {
  const out = render(LeagueTable, { data: stories.express });
  expect(out).toContain("at least 80 weekday runs");
});

test("StopsTable is an accessible table of the newest stops", () => {
  const out = render(StopsTable, { data: stories.afternoons });
  expect(out).toContain("<table");
  expect(out).toContain("<caption");
  expect(out).toContain("Millbrae");
  // Newest first.
  expect(out.indexOf("Millbrae")).toBeLessThan(out.indexOf("Burlingame"));
});

test("StopsTable keeps only the newest 12 rows", () => {
  const events = Array.from({ length: 15 }, (_, i) => ({
    ...stories.afternoons.events[0],
    date: `2026-01-${String(i + 1).padStart(2, "0")}`,
    held_near: `Station ${i + 1}`,
  }));
  const out = render(StopsTable, { data: { holds: true, events } });
  expect(out.match(/<tr/g)?.length).toBe(13); // header + 12
  expect(out).toContain("Station 15");
  expect(out).not.toContain("Station 3<");
});

test("StopsTable says so when no stops are detected", () => {
  const out = render(StopsTable, { data: { holds: true, events: [] } });
  expect(out).toContain("No line-wide stops detected yet.");
});

const exampleDay: ExampleDay = JSON.parse(
  fs.readFileSync(
    path.join(process.cwd(), "tests", "fixtures", "caltrain", "stories_example_day.json"),
    "utf8",
  ),
);

describe("PlayableMarey", () => {
  const out = render(PlayableMarey, { day: exampleDay });
  /** Each <svg role="img"> layout's markup (wide and narrow). */
  const layouts = out.split(/(?=<svg role="img")/).slice(1);

  test("draws one polyline per train in each layout, colored by delay band", () => {
    expect(layouts.length).toBe(2);
    for (const svg of layouts) {
      expect(svg.match(/<polyline/g)?.length).toBe(exampleDay.trains.length);
    }
    expect(out).toContain('stroke="var(--major)"'); // 523, 24 min
    expect(out).toContain('stroke="var(--ontime)"'); // 422, 2 min
  });

  test("shows the full diagram with the freeze shaded before Play", () => {
    expect(out).toMatch(/<rect[^>]*fill="var\(--major\)"[^>]*fill-opacity="0\.1\d*"/);
    // Every train is drawn in full: 523 has four points.
    expect(out).toMatch(/<polyline points="(?:[\d.]+,[\d.]+ ){3}[\d.]+,[\d.]+"/);
  });

  test("has a Play button and a labelled time scrubber with a clock", () => {
    expect(out).toMatch(/<button[^>]*type="button"[^>]*>(?:(?!<\/button>)[\s\S])*Play<\/button>/);
    expect(out).toContain('type="range"');
    expect(out).toContain('aria-label="Time"');
    expect(out).toContain('step="1"');
    expect(out).toContain("8:33 p.m."); // the clock shows the window end before Play
  });

  test("labels the SVG with a summary from the data", () => {
    const label = ariaLabels(layouts[0])[0];
    expect(label).toContain("3 trains");
    expect(label).toContain("3:55 p.m.");
    expect(label).toContain("4:33 p.m.");
    expect(label).toContain("24 minutes");
  });

  test("uses no colors outside the theme tokens", () => {
    const colors = [...out.matchAll(/(?:fill|stroke)="([^"]+)"/g)].map((m) => m[1]);
    // currentColor is the Play button's icon, which follows the button's text color.
    for (const c of colors) expect(c).toMatch(/^(var\(--[\w-]+\)|none|currentColor)$/);
  });

  describe("mid-playback (t = 4:10 p.m., inside the 3:55–4:33 freeze)", () => {
    const mid = render(PlayableMarey, { day: exampleDay, initialMinute: 970 });
    /** Total vertex count across every polyline. */
    const vertices = (html: string) =>
      [...html.matchAll(/<polyline points="([^"]*)"/g)].reduce(
        (n, m) => n + (m[1].trim() ? m[1].trim().split(" ").length : 0),
        0,
      );
    /** Width of the freeze band in the first layout. */
    const bandWidth = (html: string) =>
      Number(
        html
          .slice(html.indexOf('<svg role="img"')) // skip the legend swatch
          .match(/<rect[^>]*width="([\d.]+)"[^>]*fill="var\(--major\)"[^>]*fill-opacity/)?.[1],
      );

    test("clips every polyline at t", () => {
      expect(mid.match(/<polyline/g)?.length).toBe(exampleDay.trains.length * 2);
      expect(vertices(mid)).toBeLessThan(vertices(out));
      // 523 (15:20, 15:50, 16:20, 16:50) is cut after 15:50 with one point interpolated at 16:10.
      expect(mid).toMatch(/<polyline points="[\d.]+,[\d.]+ [\d.]+,[\d.]+ [\d.]+,[\d.]+" stroke="var\(--major\)"/);
    });

    test("draws the playhead and shows the clock at t", () => {
      expect(mid).toMatch(/<line [^>]*stroke="var\(--ink\)"/);
      expect(out).not.toMatch(/<line [^>]*stroke="var\(--ink\)"/);
      expect(mid).toContain("4:10 p.m.");
      expect(mid).toContain('value="970"');
    });

    test("draws the freeze band only up to t", () => {
      expect(bandWidth(mid)).toBeGreaterThan(0);
      expect(bandWidth(mid)).toBeLessThan(bandWidth(out));
    });
  });

  test("clamps a freeze that starts before the window to the window", () => {
    const early = render(PlayableMarey, {
      day: { ...exampleDay, freeze: { start: "14:00", end: "15:05" } },
    });
    const charts = early.slice(early.indexOf('<svg role="img"')); // skip the legend swatch
    const xs = [...charts.matchAll(/<rect x="([\d.]+)"[^>]*fill="var\(--major\)"/g)].map((m) => Number(m[1]));
    expect(xs.length).toBe(2);
    expect(xs[0]).toBe(66); // narrow plot's left edge
    expect(xs[1]).toBe(96); // wide plot's left edge
  });

  test("renders without a freeze or trains", () => {
    expect(() => render(PlayableMarey, { day: { ...exampleDay, freeze: null } })).not.toThrow();
    expect(() => render(PlayableMarey, { day: { ...exampleDay, trains: [] } })).not.toThrow();
  });
});

test("charts render without data", () => {
  expect(() => render(OpenerHeatmap, { data: { heatmap: [] } })).not.toThrow();
  expect(() => render(RecoveryFan, { data: { holds: true, fan: [] }, figures })).not.toThrow();
  expect(() =>
    render(LeagueTable, { data: { ...stories.express, league: [] } }),
  ).not.toThrow();
  expect(() =>
    render(HeadwayGrid, { data: { ...stories.express, headway: [] } }),
  ).not.toThrow();
  expect(() => render(DayStrip, { data: { holds: true, days: [] }, figures })).not.toThrow();
});

test("TrainLeaderboard shows the last-stop line only when the figure exists, never null", () => {
  const base: TrainPerformance = {
    trip_id: 101,
    total_stops: 300,
    on_time_count: 270,
    avg_delay_min: 1.5,
    days_observed: 60,
    on_time_pct: 90,
  };
  const legacy = render(TrainLeaderboard, { data: [base] });
  expect(legacy).not.toContain("null");
  expect(legacy).not.toContain("undefined");
  expect(legacy).not.toContain("weekday runs");
  const nullField = render(TrainLeaderboard, {
    data: [{ ...base, last_stop_late_pct: null, last_stop_runs: 20, last_stop_name: "22nd Street" }],
  });
  expect(nullField).not.toContain("null");
  expect(nullField).not.toContain("weekday runs");
  const withFigure = render(TrainLeaderboard, {
    data: [{ ...base, last_stop_late_pct: 50, last_stop_runs: 90, last_stop_name: "22nd Street" }],
  });
  expect(withFigure).toContain("late at 22nd Street on 50% of weekday runs");
});
