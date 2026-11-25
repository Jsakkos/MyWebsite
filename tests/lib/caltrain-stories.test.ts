import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import {
  STORIES_PATH,
  STORY_FIGURE_KEYS,
  daysStale,
  formatClock,
  formatFigure,
  loadExampleDay,
  loadStories,
  storiesAvailable,
  type Figure,
  type FigureUnit,
} from "@/lib/caltrain-stories";

const FIXTURES = path.join(process.cwd(), "tests", "fixtures", "caltrain");
const STORIES = path.join(FIXTURES, "stories.json");
const EXAMPLE = path.join(FIXTURES, "stories_example_day.json");

function tempFile(body: string): string {
  const file = path.join(fs.mkdtempSync(path.join(os.tmpdir(), "stories-")), "stories.json");
  fs.writeFileSync(file, body);
  return file;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function fixture(): any {
  return JSON.parse(fs.readFileSync(STORIES, "utf8"));
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function exampleFixture(): any {
  return JSON.parse(fs.readFileSync(EXAMPLE, "utf8"));
}

function fig(value: number | string, unit: FigureUnit): Figure {
  return { value, unit };
}

let warn: ReturnType<typeof vi.spyOn>;
beforeEach(() => {
  warn = vi.spyOn(console, "warn").mockImplementation(() => {});
});
afterEach(() => {
  warn.mockRestore();
});

test("the fixture loads with every figure", () => {
  const data = loadStories(STORIES)!;
  expect(data).not.toBeNull();
  expect(data.figures.sat_late_pct.value).toBe(10.7);
  expect(STORY_FIGURE_KEYS).toHaveLength(34);
  for (const key of STORY_FIGURE_KEYS) expect(data.figures[key]).toBeDefined();
  expect(warn).not.toHaveBeenCalled();
});

test("the fixture keeps a null hours_to_normal", () => {
  const events = loadStories(STORIES)!.stories.afternoons.events;
  expect(events.some((e) => e.hours_to_normal === null)).toBe(true);
});

test("a missing file returns null and warns once", () => {
  expect(loadStories("does/not/exist.json")).toBeNull();
  expect(warn).toHaveBeenCalledTimes(1);
});

test("bad JSON returns null and warns once", () => {
  expect(loadStories(tempFile("{"))).toBeNull();
  expect(warn).toHaveBeenCalledTimes(1);
});

test("a missing figure returns null and names it", () => {
  const d = fixture();
  delete d.figures.sat_late_pct;
  expect(loadStories(tempFile(JSON.stringify(d)))).toBeNull();
  expect(warn).toHaveBeenCalledTimes(1);
  expect(String(warn.mock.calls[0][0])).toContain("sat_late_pct");
});

test("another schema version returns null", () => {
  const d = fixture();
  d.schema_version = 2;
  expect(loadStories(tempFile(JSON.stringify(d)))).toBeNull();
});

test("a non-numeric value for a numeric unit returns null", () => {
  const d = fixture();
  d.figures.sat_late_pct = { value: "NaN", unit: "pct" };
  expect(loadStories(tempFile(JSON.stringify(d)))).toBeNull();
});

test("a non-finite number returns null", () => {
  const body = JSON.stringify(fixture()).replace('"value":10.7', '"value":1e999');
  expect(body).toContain("1e999");
  expect(loadStories(tempFile(body))).toBeNull();
});

test("an unknown unit returns null", () => {
  const d = fixture();
  d.figures.sat_late_pct.unit = "furlongs";
  expect(loadStories(tempFile(JSON.stringify(d)))).toBeNull();
});

test("a missing story array returns null", () => {
  const arrays = [
    ["opener", "heatmap"],
    ["recovery", "fan"],
    ["express", "league"],
    ["express", "groups"],
    ["express", "headway"],
    ["afternoons", "events"],
    ["saturday", "days"],
  ];
  for (const [story, key] of arrays) {
    const d = fixture();
    delete d.stories[story][key];
    expect(loadStories(tempFile(JSON.stringify(d)))).toBeNull();
  }
});

test("a non-boolean holds returns null", () => {
  const d = fixture();
  d.stories.saturday.holds = "yes";
  expect(loadStories(tempFile(JSON.stringify(d)))).toBeNull();
});

test("the example day fixture loads", () => {
  const day = loadExampleDay(EXAMPLE)!;
  expect(day.trains).toHaveLength(3);
  expect(day.stations).toHaveLength(2);
  expect(day.freeze).toEqual({ start: "15:55", end: "16:33" });
  expect(warn).not.toHaveBeenCalled();
});

test("the example day accepts a null freeze", () => {
  const d = exampleFixture();
  d.freeze = null;
  expect(loadExampleDay(tempFile(JSON.stringify(d)))!.freeze).toBeNull();
});

test("a broken example day returns null", () => {
  expect(loadExampleDay("does/not/exist.json")).toBeNull();
  expect(loadExampleDay(tempFile("{"))).toBeNull();
  const d = exampleFixture();
  delete d.trains;
  expect(loadExampleDay(tempFile(JSON.stringify(d)))).toBeNull();
});

test("storiesAvailable follows the loader", () => {
  expect(storiesAvailable(STORIES)).toBe(true);
  expect(storiesAvailable("does/not/exist.json")).toBe(false);
  expect(STORIES_PATH).toBe("/projects/caltrain-tracker/stories/");
});

test("formatClock", () => {
  expect(formatClock("17:22")).toBe("5:22 p.m.");
  expect(formatClock("08:22")).toBe("8:22 a.m.");
  expect(formatClock("00:05")).toBe("12:05 a.m.");
  expect(formatClock("12:00")).toBe("12:00 p.m.");
});

test("formatFigure", () => {
  expect(formatFigure(fig(50, "pct"))).toBe("50%");
  expect(formatFigure(fig(0.3, "pct"))).toBe("0.3%");
  expect(formatFigure(fig(10.7, "pct"))).toBe("10.7%");
  expect(formatFigure(fig(743, "count"))).toBe("743");
  expect(formatFigure(fig(771334, "count"))).toBe("771,334");
  expect(formatFigure(fig("17:22", "time"))).toBe("5:22 p.m.");
  expect(formatFigure(fig("08:22", "time"))).toBe("8:22 a.m.");
  expect(formatFigure(fig(4.5, "weeks"))).toBe("4.5 weeks");
  expect(formatFigure(fig(1, "hours"))).toBe("1 hour");
  expect(formatFigure(fig(3, "hours"))).toBe("3 hours");
  expect(formatFigure(fig(0, "minutes"))).toBe("0 minutes");
  expect(formatFigure(fig(1, "minutes"))).toBe("1 minute");
  expect(formatFigure(fig("Express", "text"))).toBe("Express");
});

test("daysStale counts whole local calendar days and never goes negative", () => {
  expect(daysStale("2026-11-25", new Date(2026, 10, 29, 9))).toBe(4);
  expect(daysStale("2026-11-25", new Date(2026, 10, 25, 23))).toBe(0);
  expect(daysStale("2026-11-30", new Date(2026, 10, 25, 9))).toBe(0);
});
