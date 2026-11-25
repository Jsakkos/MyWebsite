import { formatFigure, type FanRow, type StoriesData } from "@/lib/caltrain-stories-format";
import { bandPath, linePath, linearScale, ticks, trimNumber } from "@/lib/charts";
import { CHART } from "@/components/caltrain/palette";
import { ChartFrame, LegendSwatch } from "./chart-frame";

/**
 * Where "back on time" sits on the change-in-delay axis: a train that first
 * reaches 10 minutes late is on time again once it is within 4 minutes, a
 * change of about −6 minutes.
 */
const BACK_ON_TIME = -6;
const K_MAX = 10;

interface Props {
  data: StoriesData["stories"]["recovery"];
  figures: StoriesData["figures"];
}

/** +1.2 -> "+1.2", -3 -> "−3", 0 -> "0" (with a real minus sign). */
function signed(v: number): string {
  if (v === 0) return "0";
  return `${v > 0 ? "+" : "−"}${trimNumber(Math.abs(v))}`;
}

/** The fan with k = 0 prepended: every train starts at a change of 0. */
function rows(fan: FanRow[]): FanRow[] {
  const sorted = [...fan].filter((r) => r.k > 0 && r.k <= K_MAX).sort((a, b) => a.k - b.k);
  const origin: FanRow = { k: 0, n: 0, p10: 0, p25: 0, median: 0, p75: 0, p90: 0, back_on_time_pct: 0 };
  return [origin, ...sorted];
}

function backOnTimeLabel(fan: FanRow[], figures: StoriesData["figures"]): string | null {
  const fig = figures.recovery_back_on_time_pct;
  if (fig) return formatFigure(fig);
  const last = fan.at(-1);
  return last ? `${trimNumber(last.back_on_time_pct)}%` : null;
}

function summarize(fan: FanRow[], figures: StoriesData["figures"]): string {
  if (fan.length === 0) return "Change in delay after a train first runs 10 minutes late: not enough data yet.";
  // The row at five stops, or the nearest one we have.
  const at5 = fan.reduce((a, b) => (Math.abs(b.k - 5) < Math.abs(a.k - 5) ? b : a));
  const stops = at5.k === 1 ? "One stop" : `${at5.k === 5 ? "Five" : at5.k} stops`;
  const change =
    at5.median === 0 ? "not changed at the median" : `changed by a median of ${signed(at5.median)} minutes`;
  const back = backOnTimeLabel(fan, figures);
  return `${stops} after a train first runs 10 minutes late, its delay has ${change}${
    back ? `; ${back} get back on time before the end of the line` : ""
  }.`;
}

function Fan({ fan, width, height, backLabel }: { fan: FanRow[]; width: number; height: number; backLabel: string | null }) {
  const wide = width > 400;
  const m = { left: wide ? 36 : 30, right: wide ? 16 : 8, top: 22, bottom: 38 };
  const all = fan.flatMap((r) => [r.p10, r.p90]);
  const lo = Math.floor(Math.min(BACK_ON_TIME - 2, ...all) / 5) * 5;
  const hi = Math.ceil(Math.max(5, ...all) / 5) * 5;
  const x = linearScale([0, K_MAX], [m.left, width - m.right]);
  const y = linearScale([lo, hi], [height - m.bottom, m.top]);
  const font = 11;
  const pts = rows(fan);
  const last = pts.at(-1)!;

  return (
    <g>
      {/* Grid and y labels */}
      <g className="font-mono" fontSize={font} fill={CHART.muted}>
        {ticks(lo, hi, 5).map((v) => (
          <g key={v}>
            <line
              x1={m.left}
              x2={width - m.right}
              y1={y(v)}
              y2={y(v)}
              stroke={v === 0 ? CHART.axis : CHART.grid}
              strokeWidth={v === 0 ? 1 : 0.75}
            />
            <text x={m.left - 6} y={y(v)} textAnchor="end" dominantBaseline="central">
              {signed(v)}
            </text>
          </g>
        ))}
        <text x={0} y={10} className="font-sans">
          change in delay, minutes
        </text>
        {ticks(0, K_MAX, wide ? 1 : 2).map((k) => (
          <text key={k} x={x(k)} y={height - m.bottom + 16} textAnchor="middle">
            {k}
          </text>
        ))}
        <text x={x(K_MAX / 2)} y={height - 4} textAnchor="middle" className="font-sans">
          stops after first running 10 minutes late
        </text>
      </g>

      {pts.length > 1 ? (
        <>
          <path d={bandPath(pts.map((r) => ({ x: x(r.k), lo: y(r.p10), hi: y(r.p90) })))} fill={CHART.accent} fillOpacity={0.12} />
          <path d={bandPath(pts.map((r) => ({ x: x(r.k), lo: y(r.p25), hi: y(r.p75) })))} fill={CHART.accent} fillOpacity={0.22} />
          <path
            d={linePath(pts.map((r) => ({ x: x(r.k), y: y(r.median) })))}
            fill="none"
            stroke={CHART.accent}
            strokeWidth={2.5}
            strokeLinejoin="round"
            strokeLinecap="round"
          />
          <text
            x={x(last.k) - 2}
            y={y(last.median) - 8}
            textAnchor="end"
            fontSize={font}
            fill={CHART.accent}
            className="font-mono"
          >
            median {signed(last.median)}
          </text>
        </>
      ) : null}

      {/* Back on time */}
      <line
        x1={m.left}
        x2={width - m.right}
        y1={y(BACK_ON_TIME)}
        y2={y(BACK_ON_TIME)}
        stroke={CHART.major}
        strokeWidth={1.25}
        strokeDasharray="4 4"
      />
      <text
        x={width - m.right}
        y={y(BACK_ON_TIME) + font + 4}
        textAnchor="end"
        fontSize={font}
        fill={CHART.major}
        className="font-sans"
      >
        back on time{backLabel ? ` (${backLabel} make it)` : ""}
      </text>
    </g>
  );
}

/** Story 1: once a train is 10 minutes late, the next ten stops don't claw it back. */
export function RecoveryFan({ data, figures }: Props) {
  const backLabel = backOnTimeLabel(data.fan, figures);
  const legend = (
    <>
      <LegendSwatch color={CHART.accent} label="median" shape="line" />
      <LegendSwatch color={CHART.accent} opacity={0.34} label="middle half of trains" />
      <LegendSwatch color={CHART.accent} opacity={0.12} label="8 in 10 trains" />
    </>
  );
  return (
    <ChartFrame
      title="What happens after a train falls 10 minutes behind"
      summary={summarize(data.fan, figures)}
      caption="Weekday trains that first reach 10 minutes late at a stop after their first. For each later stop, the change in delay since that moment: the line is the median train, the bands hold the middle half and the middle 8 in 10. Below the dashed line a train is back within 4 minutes of schedule."
      legend={legend}
      width={680}
      height={260}
      narrow={{ width: 320, height: 230, children: <Fan fan={data.fan} width={320} height={230} backLabel={backLabel} /> }}
    >
      <Fan fan={data.fan} width={680} height={260} backLabel={backLabel} />
    </ChartFrame>
  );
}
