import type { HeatmapCell, StoriesData } from "@/lib/caltrain-stories-format";
import { trimNumber } from "@/lib/charts";
import { CHART, lateShareColor } from "@/components/caltrain/palette";
import { ChartFrame } from "./chart-frame";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const HOURS = Array.from({ length: 19 }, (_, i) => i + 5); // 5..23
const HOUR_TICKS = [6, 9, 12, 15, 18, 21];
const NARROW = 320;

/** One representative late share per ramp band, lowest first, for the key. */
const KEY = [0, 7, 12, 17, 22, 27, 35, 50];

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
              fill={cell ? lateShareColor(cell.late_pct) : CHART.empty}
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

function height(width: number): number {
  return 20 + 7 * (width > 400 ? 20 : 16);
}

/** The scene-setter: late share by day of week × scheduled hour (5 a.m. to 11 p.m.). */
export function OpenerHeatmap({ data }: { data: StoriesData["stories"]["opener"] }) {
  const cells = new Map(data.heatmap.map((c) => [`${c.dow}-${c.hour}`, c]));
  const legend = (
    <span className="inline-flex flex-wrap items-center gap-x-1.5 gap-y-1">
      <span className="font-mono">≤ 5%</span>
      <svg width={KEY.length * 14} height="10" aria-hidden="true">
        {KEY.map((late, i) => (
          <rect key={late} x={i * 14} width="14" height="10" fill={lateShareColor(late)} />
        ))}
      </svg>
      <span className="font-mono">&gt; 40% late</span>
      <span className="ml-3 inline-flex items-center gap-1.5">
        <svg width="14" height="10" aria-hidden="true">
          <rect x="0.5" y="0.5" width="13" height="9" fill={CHART.empty} stroke={CHART.grid} />
        </svg>
        no data
      </span>
    </span>
  );

  return (
    <ChartFrame
      title="When trains run late"
      summary={summarize(data.heatmap)}
      caption="Share of arrivals more than 4 minutes late, by day of week and scheduled hour, across every clean day in the data. Each column is one hour of departures."
      legend={legend}
      width={680}
      height={height(680)}
      narrow={{ width: NARROW, height: height(NARROW), children: <Grid cells={cells} width={NARROW} /> }}
    >
      <Grid cells={cells} width={680} />
    </ChartFrame>
  );
}
