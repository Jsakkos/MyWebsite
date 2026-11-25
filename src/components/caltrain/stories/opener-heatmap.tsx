import type { HeatmapCell, StoriesData } from "@/lib/caltrain-stories-format";
import { trimNumber } from "@/lib/charts";
import { CHART, LATE_BREAKS, lateBand, lateBandColor, lateColor } from "@/components/caltrain/palette";
import { ChartFrame } from "./chart-frame";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const HOURS = Array.from({ length: 19 }, (_, i) => i + 5); // 5..23
const HOUR_TICKS = [6, 9, 12, 15, 18, 21];
const NARROW = 320;

const BREAKS = LATE_BREAKS.opener;
const SWATCH = 26;

/** 12 -> "noon", 17 -> "5 p.m." */
export function hourLabel(h: number): string {
  if (h === 12) return "noon";
  if (h === 0 || h === 24) return "midnight";
  return `${h % 12} ${h < 12 ? "a.m." : "p.m."}`;
}

function summarize(cells: HeatmapCell[]): string {
  const lead = "Share of arrivals more than 4 minutes late, by day of week and scheduled hour.";
  if (cells.length === 0) return `${lead} There is not enough data to show yet.`;
  const worst = cells.reduce((a, b) => (b.late_pct > a.late_pct ? b : a));
  const best = cells.reduce((a, b) => (b.late_pct < a.late_pct ? b : a));
  const at = (c: HeatmapCell) => `${DAYS[c.dow - 1]} at ${hourLabel(c.hour)}`;
  return `${lead} The worst slot is ${at(worst)}, with ${trimNumber(worst.late_pct)}% late; the best is ${at(best)}, with ${trimNumber(best.late_pct)}%.`;
}

function Grid({ cells, width }: { cells: Map<string, HeatmapCell>; width: number }) {
  const wide = width > 400;
  const labelW = wide ? 40 : 30;
  const top = 20;
  const gap = 2;
  const cellW = (width - labelW) / HOURS.length;
  const cellH = wide ? 20 : 16;
  const font = wide ? 11 : 10;

  return (
    <g>
      <g className="font-mono" fontSize={font} fill={CHART.muted}>
        {HOUR_TICKS.map((h) => (
          <text key={h} x={labelW + (h - 5) * cellW} y={top - 7}>
            {hourLabel(h)}
          </text>
        ))}
        {DAYS.map((d, i) => (
          <text key={d} x={0} y={top + i * cellH + cellH / 2} dominantBaseline="central">
            {d.slice(0, 3)}
          </text>
        ))}
      </g>
      {DAYS.map((day, i) =>
        HOURS.map((h) => {
          const cell = cells.get(`${i + 1}-${h}`);
          return (
            <rect
              key={`${i}-${h}`}
              x={labelW + (h - 5) * cellW}
              y={top + i * cellH}
              width={cellW - gap}
              height={cellH - gap}
              fill={cell ? lateColor(cell.late_pct, BREAKS) : "none"}
              stroke={cell ? undefined : CHART.grid}
            >
              <title>
                {cell
                  ? `${day}, ${hourLabel(h)} hour: ${trimNumber(cell.late_pct)}% late (${cell.n.toLocaleString("en-US")} arrivals)`
                  : `${day}, ${hourLabel(h)} hour: no data`}
              </title>
            </rect>
          );
        }),
      )}
    </g>
  );
}

/**
 * The color key, covering only the bands the data reaches: one swatch per band,
 * with the band boundaries (% late) under the joins.
 */
export function LateKey({ values }: { values: number[] }) {
  if (values.length === 0) return null;
  const lo = lateBand(Math.min(...values), BREAKS);
  const hi = lateBand(Math.max(...values), BREAKS);
  const bands = Array.from({ length: hi - lo + 1 }, (_, i) => lo + i);
  const edges = bands.map((band, i) => ({ x: i * SWATCH, value: band === 0 ? 0 : BREAKS[band - 1] }));
  if (hi < BREAKS.length) edges.push({ x: bands.length * SWATCH, value: BREAKS[hi] });
  return (
    <span className="inline-flex items-end gap-1.5">
      <svg width={bands.length * SWATCH + 8} height="24" aria-hidden="true" className="overflow-visible">
        {bands.map((band, i) => (
          <rect key={band} x={i * SWATCH} width={SWATCH} height="10" fill={lateBandColor(band)} />
        ))}
        <g className="font-mono" fontSize="10" fill={CHART.muted}>
          {edges.map((e, i) => (
            <text key={e.x} x={e.x} y="22" textAnchor={i === 0 ? "start" : "middle"}>
              {e.value}
            </text>
          ))}
        </g>
      </svg>
      <span className="font-mono text-[10px] leading-none">% late</span>
    </span>
  );
}

function height(width: number): number {
  return 20 + 7 * (width > 400 ? 20 : 16);
}

/** The scene-setter: late share by day of week × scheduled hour (5 a.m. to 11 p.m.). */
export function OpenerHeatmap({ data }: { data: StoriesData["stories"]["opener"] }) {
  const cells = new Map(data.heatmap.map((c) => [`${c.dow}-${c.hour}`, c]));
  const legend = (
    <span className="inline-flex flex-wrap items-center gap-x-3 gap-y-1">
      <LateKey values={data.heatmap.map((c) => c.late_pct)} />
      <span className="inline-flex items-center gap-1.5">
        <svg width="14" height="10" aria-hidden="true">
          <rect x="0.5" y="0.5" width="13" height="9" fill="none" stroke={CHART.grid} />
        </svg>
        no data
      </span>
    </span>
  );

  return (
    <ChartFrame
      title="When trains run late"
      summary={summarize(data.heatmap)}
      caption="Share of arrivals more than 4 minutes late, by day of week and scheduled hour, across every clean day in the data. Each column is one scheduled hour at each stop."
      legend={legend}
      width={680}
      height={height(680)}
      narrow={{ width: NARROW, height: height(NARROW), children: <Grid cells={cells} width={NARROW} /> }}
    >
      <Grid cells={cells} width={680} />
    </ChartFrame>
  );
}
