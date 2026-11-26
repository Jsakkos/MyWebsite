import { formatClock, type LeagueRow, type StoriesData } from "@/lib/caltrain-stories-format";
import { linearScale, niceCeil, ticks, trimNumber } from "@/lib/charts";
import { CHART, SERVICE_COLORS } from "@/components/caltrain/palette";
import { ChartFrame, LegendSwatch } from "./chart-frame";

const DIRECTION_WORD = { NB: "northbound", SB: "southbound" } as const;

function serviceColor(service: string): string {
  return SERVICE_COLORS[service as keyof typeof SERVICE_COLORS] ?? CHART.field;
}

/** "Train 523 · 5:22 p.m. Express NB", split so the train number can stand out. */
function labelParts(r: LeagueRow): [string, string] {
  return [`Train ${r.train}`, ` · ${formatClock(r.departs)} ${r.service} ${r.direction}`];
}

function summarize(league: LeagueRow[]): string {
  if (league.length === 0) return "The least reliable weekday trains: not enough data yet.";
  const top = league[0];
  const express = league.filter((r) => r.service === "Express").length;
  return `Train ${top.train}, the ${formatClock(top.departs)} ${top.service} ${DIRECTION_WORD[top.direction]}, is late at the last stop we see it reach (${top.last_stop}) on ${trimNumber(top.late_pct)}% of weekday runs, the most of the ${league.length} trains shown; ${express} of the ${league.length} are expresses.`;
}

interface Layout {
  width: number;
  wide: boolean;
  rows: LeagueRow[];
  max: number;
}

const ROW_WIDE = 26;
const ROW_NARROW = 36;
const AXIS = 30;

function layoutHeight(n: number, wide: boolean): number {
  return 8 + Math.max(n, 1) * (wide ? ROW_WIDE : ROW_NARROW) + AXIS;
}

function Bars({ width, wide, rows, max }: Layout) {
  // Wide: the label sits left of its bar. Narrow: the label sits above it.
  const labelW = wide ? 240 : 0;
  const valueRoom = 44;
  const x = linearScale([0, max], [labelW, width - valueRoom]);
  const rowH = wide ? ROW_WIDE : ROW_NARROW;
  const barH = wide ? 12 : 10;
  const top = 8;
  const plotBottom = top + Math.max(rows.length, 1) * rowH;
  const font = 12;

  return (
    <g>
      {/* Vertical grid and the % axis */}
      <g className="font-mono" fontSize={font - 1} fill={CHART.muted}>
        {ticks(0, max, 25).map((v) => (
          <g key={v}>
            <line x1={x(v)} x2={x(v)} y1={top} y2={plotBottom} stroke={CHART.grid} strokeWidth={0.75} />
            <text x={x(v)} y={plotBottom + 14} textAnchor="middle">
              {v}%
            </text>
          </g>
        ))}
        <text x={x(max)} y={plotBottom + 27} textAnchor="end" className="font-sans">
          late at the last stop, share of weekday runs
        </text>
      </g>

      {rows.map((r, i) => {
        const [train, rest] = labelParts(r);
        const rowTop = top + i * rowH;
        const barY = wide ? rowTop + (rowH - barH) / 2 : rowTop + 16;
        const mid = barY + barH / 2;
        const labelY = wide ? mid : rowTop + 7;
        return (
          <g key={`${r.train}-${r.direction}`}>
            <title>
              {`Train ${r.train} (${formatClock(r.departs)} ${r.service} ${DIRECTION_WORD[r.direction]}): late at ${r.last_stop} on ${trimNumber(r.late_pct)}% of ${r.runs.toLocaleString("en-US")} runs; 95% interval ${trimNumber(r.ci_low)}–${trimNumber(r.ci_high)}%`}
            </title>
            <text
              x={wide ? labelW - 10 : 0}
              y={labelY}
              textAnchor={wide ? "end" : "start"}
              dominantBaseline="central"
              fontSize={font}
              className="font-sans"
            >
              <tspan fill={CHART.text} fontWeight={500}>
                {train}
              </tspan>
              <tspan fill={CHART.muted}>{rest}</tspan>
            </text>
            <rect x={x(0)} y={barY} width={Math.max(0, x(r.late_pct) - x(0))} height={barH} fill={serviceColor(r.service)} />
            {/* Wilson interval */}
            <g stroke={CHART.text} strokeWidth={1}>
              <line x1={x(r.ci_low)} x2={x(r.ci_high)} y1={mid} y2={mid} />
              <line x1={x(r.ci_low)} x2={x(r.ci_low)} y1={mid - 4} y2={mid + 4} />
              <line x1={x(r.ci_high)} x2={x(r.ci_high)} y1={mid - 4} y2={mid + 4} />
            </g>
            <text
              x={x(Math.max(r.ci_high, r.late_pct)) + 6}
              y={mid}
              dominantBaseline="central"
              fontSize={font - 1}
              fill={CHART.text}
              className="font-mono"
            >
              {trimNumber(r.late_pct)}%
            </text>
          </g>
        );
      })}
    </g>
  );
}

/** Story 2: the least reliable weekday trains, late share at their last observed stop. */
export function LeagueTable({ data }: { data: StoriesData["stories"]["express"] }) {
  const rows = [...data.league].sort((a, b) => b.late_pct - a.late_pct);
  const max = niceCeil(Math.max(0, ...rows.map((r) => Math.max(r.ci_high, r.late_pct))), 25);
  const services = (["Express", "Limited", "Local"] as const).filter((s) => rows.some((r) => r.service === s));
  const legend = (
    <>
      {services.map((s) => (
        <LegendSwatch key={s} color={SERVICE_COLORS[s]} label={s} />
      ))}
      <LegendSwatch color={CHART.text} label="95% interval" shape="line" />
    </>
  );
  const wideH = layoutHeight(rows.length, true);
  const narrowH = layoutHeight(rows.length, false);

  return (
    <ChartFrame
      title="The least reliable weekday trains"
      summary={summarize(rows)}
      caption="Share of each train's weekday runs that arrive more than 4 minutes late at the last stop we see it reach. A train needs at least 80 weekday runs to be ranked. The whiskers are 95% (Wilson) intervals: the fewer the runs, the wider they are."
      legend={legend}
      width={680}
      height={wideH}
      narrow={{ width: 320, height: narrowH, children: <Bars width={320} wide={false} rows={rows} max={max} /> }}
    >
      <Bars width={680} wide rows={rows} max={max} />
    </ChartFrame>
  );
}
