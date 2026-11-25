import fs from "node:fs";
import path from "node:path";
import { createElement, type ComponentType } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import type { StoriesData } from "@/lib/caltrain-stories-format";
import { HeadlineStrip } from "@/components/caltrain/stories/headline-strip";
import { OpenerHeatmap } from "@/components/caltrain/stories/opener-heatmap";
import { RecoveryFan } from "@/components/caltrain/stories/recovery-fan";
import { LeagueTable } from "@/components/caltrain/stories/league-table";
import { HeadwayGrid } from "@/components/caltrain/stories/headway-grid";
import { DayStrip } from "@/components/caltrain/stories/day-strip";
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

test("RecoveryFan marks the back-on-time line and summarises the change after 5 stops", () => {
  const out = render(RecoveryFan, { data: stories.recovery, figures });
  expect(out).toContain("back on time");
  expect(out).toContain('stroke-dasharray');
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
});

test("DayStrip draws one dot per day and a labelled 15% line", () => {
  const out = render(DayStrip, { data: stories.saturday, figures });
  // Each day appears twice: once in the wide and once in the narrow layout.
  expect(out.match(/<circle/g)?.length).toBe(stories.saturday.days.length * 2);
  expect(out).toContain("15%");
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
