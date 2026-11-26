"use client";

import { memo, useEffect, useId, useMemo, useState, useSyncExternalStore } from "react";
import type { ExampleDay } from "@/lib/caltrain-stories-format";
import { linearScale, minutesOfDay, ticks } from "@/lib/charts";
import {
  clipByMinute,
  delayBand,
  formatDayDate,
  formatMinuteClock,
  mareySummary,
  elapsedForMinute,
  playbackMinute,
  resumeMinute,
  type DelayBand,
} from "@/lib/marey-playback";
import { CHART } from "@/components/caltrain/palette";
import { LegendSwatch } from "./chart-frame";

// ---------------------------------------------------------------------------
// Reduced motion, read without setState in an effect: the server snapshot is
// false, so the server and the first client paint agree, then React re-renders
// with the real media query.

const REDUCED_QUERY = "(prefers-reduced-motion: reduce)";

function subscribeReduced(onChange: () => void): () => void {
  if (typeof window === "undefined" || !window.matchMedia) return () => {};
  const mql = window.matchMedia(REDUCED_QUERY);
  mql.addEventListener("change", onChange);
  return () => mql.removeEventListener("change", onChange);
}

function getReduced(): boolean {
  return typeof window !== "undefined" && !!window.matchMedia && window.matchMedia(REDUCED_QUERY).matches;
}

// ---------------------------------------------------------------------------
// Layout

const BAND_COLOR: Record<DelayBand, string> = {
  ontime: CHART.ontime,
  minor: CHART.minor,
  major: CHART.major,
};
const BAND_WIDTH: Record<DelayBand, number> = { ontime: 1, minor: 1.5, major: 2 };
const BAND_ORDER: Record<DelayBand, number> = { ontime: 0, minor: 1, major: 2 };
const FREEZE_OPACITY = 0.15;

interface Layout {
  width: number;
  height: number;
  margin: { left: number; right: number; top: number; bottom: number };
  font: number;
  /** Minimum vertical gap between station labels; closer ones are skipped. */
  labelGap: number;
  /** Hours between time ticks. */
  tickHours: number;
  narrow: boolean;
}

const WIDE: Layout = {
  width: 680,
  height: 420,
  margin: { left: 96, right: 12, top: 24, bottom: 30 },
  font: 11,
  labelGap: 12,
  tickHours: 1,
  narrow: false,
};

const NARROW: Layout = {
  width: 340,
  height: 460,
  margin: { left: 66, right: 8, top: 24, bottom: 30 },
  font: 10,
  labelGap: 14,
  tickHours: 2,
  narrow: true,
};

const SHORT_NAMES: Record<string, string> = {
  "San Francisco": "SF",
  "22nd Street": "22nd St",
  "South San Francisco": "S. San Francisco",
  "California Avenue": "California Ave",
  "San Jose Diridon": "San Jose",
};

const NARROW_NAMES: Record<string, string> = {
  "South San Francisco": "S. SF",
  "California Avenue": "Cal Ave",
  "Mountain View": "Mtn View",
  "Redwood City": "Redwood Cty",
  "College Park": "College Pk",
  "Hayward Park": "Hayward Pk",
};

function stationLabel(name: string, narrow: boolean): string {
  const base = name.replace(/ Caltrain Station$/, "");
  return (narrow ? NARROW_NAMES[base] : undefined) ?? SHORT_NAMES[base] ?? base;
}

/** "3 p.m." for minute 900. */
function hourLabel(minutes: number): string {
  const h = Math.floor(minutes / 60) % 24;
  return `${h % 12 || 12} ${h >= 12 ? "p.m." : "a.m."}`;
}

function r(v: number): number {
  return Math.round(v * 10) / 10;
}

interface TrainGeometry {
  id: string;
  band: DelayBand;
  points: { m: number; x: number; y: number }[];
}

interface Geometry {
  layout: Layout;
  /** The window, in minutes of day. */
  start: number;
  end: number;
  x: (m: number) => number;
  stationRows: { name: string; y: number; label: boolean }[];
  timeTicks: { m: number; x: number }[];
  trains: TrainGeometry[];
}

function geometry(day: ExampleDay, layout: Layout, start: number, end: number): Geometry {
  const { width, height, margin } = layout;
  const x = linearScale([start, end], [margin.left, width - margin.right]);
  const distances = [
    ...day.stations.map((s) => s.distance),
    ...day.trains.flatMap((t) => t.points.map((p) => p.distance)),
  ];
  const dMin = distances.length ? Math.min(...distances) : 0;
  const dMax = distances.length ? Math.max(...distances) : 1;
  // North (distance 0, San Francisco) at the top.
  const y = linearScale([dMin, dMax], [margin.top, height - margin.bottom]);

  let lastLabelY = -Infinity;
  const stationRows = [...day.stations]
    .sort((a, b) => a.distance - b.distance)
    .map((s) => {
      const sy = y(s.distance);
      const label = sy - lastLabelY >= layout.labelGap;
      if (label) lastLabelY = sy;
      return { name: stationLabel(s.name, layout.narrow), y: sy, label };
    });

  const timeTicks = ticks(start, end, layout.tickHours * 60).map((m) => ({ m, x: x(m) }));

  const trains = day.trains
    .map((t) => ({
      id: t.trip_id,
      band: delayBand(t.max_delay_min),
      points: t.points
        .map((p) => {
          const m = minutesOfDay(p.time);
          return { m, x: x(m), y: y(p.distance) };
        })
        .sort((a, b) => a.m - b.m),
    }))
    .sort((a, b) => BAND_ORDER[a.band] - BAND_ORDER[b.band]);

  return { layout, start, end, x, stationRows, timeTicks, trains };
}

// ---------------------------------------------------------------------------
// Drawing

/** Grid, station and time labels: the parts that never move, so drawn once. */
const Axes = memo(function Axes({ geo }: { geo: Geometry }) {
  const { layout, stationRows, timeTicks } = geo;
  const { width, height, margin, font } = layout;
  return (
    <g fontSize={font}>
      {stationRows.map((s, i) => (
        <g key={`${s.name}-${i}`}>
          <line
            x1={margin.left}
            x2={width - margin.right}
            y1={r(s.y)}
            y2={r(s.y)}
            stroke={CHART.grid}
            strokeWidth={0.75}
          />
          {s.label ? (
            <text
              x={margin.left - 6}
              y={r(s.y)}
              textAnchor="end"
              dominantBaseline="central"
              fill={CHART.muted}
              className="font-sans"
            >
              {s.name}
            </text>
          ) : null}
        </g>
      ))}
      {timeTicks.map((t) => (
        <g key={t.m}>
          <line
            x1={r(t.x)}
            x2={r(t.x)}
            y1={margin.top}
            y2={height - margin.bottom}
            stroke={CHART.grid}
            strokeWidth={0.75}
          />
          <text
            x={r(t.x)}
            y={height - margin.bottom + 16}
            textAnchor={t.x > width - margin.right - 20 ? "end" : "middle"}
            fill={CHART.muted}
            className="font-mono"
          >
            {hourLabel(t.m)}
          </text>
        </g>
      ))}
    </g>
  );
});

function Diagram({
  geo,
  day,
  t,
  summary,
  className,
}: {
  geo: Geometry;
  day: ExampleDay;
  /** The clock minute to draw up to; null draws the full afternoon. */
  t: number | null;
  summary: string;
  className: string;
}) {
  const clipId = useId();
  const { layout, x } = geo;
  const { width, height, margin } = layout;
  const shown = t ?? Infinity;

  // The freeze band, clamped to the window (so it never paints over the
  // station labels) and, during playback, drawn only up to t.
  let freeze: { x0: number; x1: number } | null = null;
  if (day.freeze) {
    const fStart = Math.max(geo.start, minutesOfDay(day.freeze.start));
    const fEnd = Math.min(geo.end, minutesOfDay(day.freeze.end));
    if (fEnd > fStart && shown >= fStart) freeze = { x0: x(fStart), x1: x(Math.min(fEnd, shown)) };
  }
  const clipped = geo.trains.map((train) => clipByMinute(train.points, shown));

  return (
    <svg
      role="img"
      aria-label={summary}
      viewBox={`0 0 ${width} ${height}`}
      width="100%"
      preserveAspectRatio="xMinYMin meet"
      className={`block h-auto overflow-visible ${className}`}
    >
      <defs>
        <clipPath id={clipId}>
          <rect
            x={margin.left}
            y={margin.top - 4}
            width={width - margin.left - margin.right}
            height={height - margin.top - margin.bottom + 8}
          />
        </clipPath>
      </defs>
      <Axes geo={geo} />
      {freeze ? (
        <g>
          <rect
            x={r(freeze.x0)}
            y={margin.top}
            width={r(Math.max(0, freeze.x1 - freeze.x0))}
            height={height - margin.top - margin.bottom}
            fill={CHART.major}
            fillOpacity={FREEZE_OPACITY}
          />
          <text
            x={r(freeze.x0) + 3}
            y={margin.top - 6}
            fontSize={layout.font}
            fill={CHART.major}
            className="font-sans"
          >
            line stopped
          </text>
        </g>
      ) : null}
      <g clipPath={`url(#${clipId})`} fill="none" strokeLinejoin="round" strokeLinecap="round">
        {geo.trains.map((train, i) => (
          <polyline
            key={train.id}
            points={clipped[i].map((p) => `${r(p.x)},${r(p.y)}`).join(" ")}
            stroke={BAND_COLOR[train.band]}
            strokeWidth={BAND_WIDTH[train.band]}
          />
        ))}
        {t !== null
          ? geo.trains.map((train, i) => {
              // The head is the last point of the already-clipped line.
              const head = clipped[i].at(-1);
              const last = train.points.at(-1);
              if (!head || !last || last.m < t) return null;
              return (
                <circle
                  key={train.id}
                  cx={r(head.x)}
                  cy={r(head.y)}
                  r={layout.narrow ? 2 : 2.5}
                  fill={BAND_COLOR[train.band]}
                />
              );
            })
          : null}
      </g>
      {t !== null ? (
        <line
          x1={r(x(t))}
          x2={r(x(t))}
          y1={margin.top}
          y2={height - margin.bottom}
          stroke={CHART.text}
          strokeWidth={1}
        />
      ) : null}
    </svg>
  );
}

function PlayIcon({ playing }: { playing: boolean }) {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true" className="shrink-0">
      {playing ? (
        <path d="M2 1h3v10H2zM7 1h3v10H7z" fill="currentColor" />
      ) : (
        <path d="M2 1l9 5-9 5z" fill="currentColor" />
      )}
    </svg>
  );
}

// ---------------------------------------------------------------------------

/**
 * Story 3: one afternoon when the whole line stopped, as a time–distance
 * (Marey) diagram. Play sweeps a clock across the afternoon so the stop and
 * the delay spreading behind it unfold; the slider scrubs.
 */
export function PlayableMarey({
  day,
  initialMinute = null,
}: {
  day: ExampleDay;
  /** The clock minute to open on; null (the default) opens on the full diagram. */
  initialMinute?: number | null;
}) {
  const start = Math.round(minutesOfDay(day.window.start));
  const end = Math.max(start + 1, Math.round(minutesOfDay(day.window.end)));
  const wide = useMemo(() => geometry(day, WIDE, start, end), [day, start, end]);
  const narrow = useMemo(() => geometry(day, NARROW, start, end), [day, start, end]);
  const summary = useMemo(() => mareySummary(day), [day]);

  // null: the full diagram (before Play). Otherwise the clock minute shown.
  const [t, setT] = useState<number | null>(initialMinute);
  const [playing, setPlaying] = useState(false);
  // The minute the current playback started from (resume point).
  const [playFrom, setPlayFrom] = useState(start);
  const reduced = useSyncExternalStore(subscribeReduced, getReduced, () => false);
  // If reduced motion turns on mid-play, stop for good (adjusting state during
  // render, not in an effect), so turning it back off can't silently restart.
  if (reduced && playing) setPlaying(false);
  const animating = playing && !reduced;

  useEffect(() => {
    if (!animating) return;
    let raf = 0;
    let began: number | null = null;
    const step = (now: number) => {
      // Offset the clock so playback continues from playFrom, not the start.
      if (began === null) began = now - elapsedForMinute(playFrom, start, end);
      const m = playbackMinute(now - began, start, end);
      setT(m);
      if (m >= end) {
        setPlaying(false);
        return;
      }
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [animating, playFrom, start, end]);

  const clock = formatMinuteClock(t ?? end);
  const noteId = useId();

  function togglePlay() {
    if (animating) {
      setPlaying(false);
      return;
    }
    if (reduced) return;
    const from = resumeMinute(t, start, end);
    setPlayFrom(from);
    setT(from);
    setPlaying(true);
  }

  const legend = (
    <>
      <LegendSwatch color={CHART.ontime} label="worst delay 4 min or less" shape="line" />
      <LegendSwatch color={CHART.minor} label="over 4, up to 15 min" shape="line" />
      <LegendSwatch color={CHART.major} label="over 15 min" shape="line" />
      {day.freeze ? <LegendSwatch color={CHART.major} opacity={FREEZE_OPACITY} label="whole line stopped" /> : null}
    </>
  );

  return (
    <figure className="not-prose my-10 sm:-mx-4 lg:-mx-16">
      <div className="mb-3 font-sans text-sm font-medium text-ink">
        {formatDayDate(day.date)}, train by train
      </div>
      <div className="mb-3 font-sans text-xs text-muted">{legend}</div>
      <Diagram geo={narrow} day={day} t={t} summary={summary} className="max-w-md sm:hidden" />
      <Diagram geo={wide} day={day} t={t} summary={summary} className="hidden sm:block" />

      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 font-sans text-sm">
        <button
          type="button"
          onClick={togglePlay}
          disabled={reduced}
          aria-describedby={reduced ? noteId : undefined}
          className="inline-flex min-h-11 min-w-24 items-center justify-center gap-2 rounded-md border border-rule bg-paper-2 px-4 py-2 font-medium text-ink transition-colors hover:border-accent hover:text-accent disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:border-rule disabled:hover:text-ink"
        >
          <PlayIcon playing={animating} />
          {animating ? "Pause" : "Play"}
        </button>
        <div className="flex min-w-0 flex-1 basis-48 items-center gap-3">
          <input
            type="range"
            aria-label="Time"
            aria-valuetext={clock}
            min={start}
            max={end}
            step={1}
            value={Math.round(t ?? end)}
            onChange={(e) => {
              setPlaying(false);
              setT(Number(e.target.value));
            }}
            className="h-11 min-w-0 flex-1 cursor-pointer accent-accent"
          />
          <span className="min-w-[10ch] shrink-0 text-right font-mono text-sm tabular-nums text-ink">{clock}</span>
        </div>
      </div>
      {reduced ? (
        <p id={noteId} className="mt-2 font-sans text-xs text-muted">
          Playback is off because your device asks for reduced motion. Drag the time slider to step through
          the afternoon.
        </p>
      ) : null}

      <figcaption className="mt-3 max-w-2xl font-sans text-xs leading-relaxed text-muted">
        Each line is one train: across is the time of day, down is distance along the line from San Francisco.
        Southbound trains slope down, northbound trains slope up, and a flat stretch is a train standing still.
        Lines are colored by the train&rsquo;s worst delay that afternoon.
        {day.freeze
          ? " The shaded band is when the whole line stopped. Press Play, or drag the time slider, to watch the afternoon unfold."
          : " Press Play, or drag the time slider, to watch the afternoon unfold."}
      </figcaption>
    </figure>
  );
}
