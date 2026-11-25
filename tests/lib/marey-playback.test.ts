import fs from "node:fs";
import path from "node:path";
import type { ExampleDay } from "@/lib/caltrain-stories-format";
import {
  clipByMinute,
  clipTrajectory,
  delayBand,
  formatMinuteClock,
  mareySummary,
  playbackMinute,
  PLAYBACK_MS,
} from "@/lib/marey-playback";

const day: ExampleDay = JSON.parse(
  fs.readFileSync(path.join(process.cwd(), "tests", "fixtures", "caltrain", "stories_example_day.json"), "utf8"),
);

const pts = [
  { time: "15:00:00", distance: 0 },
  { time: "15:10:00", distance: 10 },
];

describe("clipTrajectory", () => {
  test("interpolates a point at exactly t between two points", () => {
    const out = clipTrajectory(pts, 905);
    expect(out).toHaveLength(2);
    expect(out[0]).toEqual(pts[0]);
    expect(out.at(-1)).toEqual({ time: "15:05:00", distance: 5 });
  });

  test("is empty before the first point", () => {
    expect(clipTrajectory(pts, 899)).toEqual([]);
  });

  test("keeps a point at exactly t without adding another", () => {
    expect(clipTrajectory(pts, 900)).toEqual([pts[0]]);
    expect(clipTrajectory(pts, 910)).toEqual(pts);
  });

  test("keeps every point after the last", () => {
    expect(clipTrajectory(pts, 1000)).toEqual(pts);
  });

  test("handles empty input", () => {
    expect(clipTrajectory([], 905)).toEqual([]);
  });
});

describe("clipByMinute", () => {
  test("interpolates every numeric field at t", () => {
    const out = clipByMinute(
      [
        { m: 0, x: 0, y: 100 },
        { m: 10, x: 50, y: 0 },
      ],
      2,
    );
    expect(out).toEqual([
      { m: 0, x: 0, y: 100 },
      { m: 2, x: 10, y: 80 },
    ]);
  });
});

describe("delayBand", () => {
  test("splits at 4 and 15 minutes, inclusive", () => {
    expect(delayBand(0)).toBe("ontime");
    expect(delayBand(4)).toBe("ontime");
    expect(delayBand(4.1)).toBe("minor");
    expect(delayBand(15)).toBe("minor");
    expect(delayBand(16)).toBe("major");
  });
});

describe("playbackMinute", () => {
  test("sweeps the window in PLAYBACK_MS and stops at the end", () => {
    expect(PLAYBACK_MS).toBe(20_000);
    expect(playbackMinute(0, 900, 1000)).toBe(900);
    expect(playbackMinute(PLAYBACK_MS / 2, 900, 1000)).toBe(950);
    expect(playbackMinute(PLAYBACK_MS * 2, 900, 1000)).toBe(1000);
  });
});

describe("formatMinuteClock", () => {
  test("reads as h:mm p.m., rounding down to the minute", () => {
    expect(formatMinuteClock(955.9)).toBe("3:55 p.m.");
    expect(formatMinuteClock(720)).toBe("12:00 p.m.");
    expect(formatMinuteClock(1266)).toBe("9:06 p.m.");
  });
});

describe("mareySummary", () => {
  test("names the train count, the freeze and the worst delay", () => {
    const s = mareySummary(day);
    expect(s).toContain("3 trains");
    expect(s).toContain("6 November 2025");
    expect(s).toContain("3:55 p.m.");
    expect(s).toContain("4:33 p.m.");
    expect(s).toContain("24 minutes");
  });

  test("says so when there was no line-wide stop", () => {
    const s = mareySummary({ ...day, freeze: null });
    expect(s).toContain("3 trains");
    expect(s).not.toContain("3:55 p.m.");
    expect(s).toContain("no line-wide stop");
  });
});
