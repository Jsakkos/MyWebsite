import { formatFigure, type DayRow, type StoriesData } from "@/lib/caltrain-stories-format";
import { linearScale, niceCeil, ticks, trimNumber } from "@/lib/charts";
import { formatDate } from "@/lib/format";
import { CHART } from "@/components/caltrain/palette";
import { ChartFrame } from "./chart-frame";

const BAD_DAY = 15;
const GOLDEN = 0.6180339887;

const COLUMNS: { type: DayRow["type"]; label: string; plural: string; figure: string; color: string }[] = [
  { type: "weekday", label: "Weekdays", plural: "weekdays", figure: "weekday_late_pct", color: CHART.field },
  { type: "Sunday", label: "Sundays", plural: "Sundays", figure: "sun_late_pct", color: CHART.field },
  { type: "Saturday", label: "Saturdays", plural: "Saturdays", figure: "sat_late_pct", color: CHART.major },
];

interface Props {
  data: StoriesData["stories"]["saturday"];
  figures: StoriesData["figures"];
}

/** A day type's pooled late share: the figure when present, else the arrival-weighted mean. */
function pooled(days: DayRow[], figures: StoriesData["figures"], key: string): number | null {
  const fig = figures[key];
  if (fig && typeof fig.value === "number") return fig.value;
  const n = days.reduce((s, d) => s + d.n, 0);
  return n > 0 ? days.reduce((s, d) => s + d.late_pct * d.n, 0) / n : null;
}

function pooledLabel(days: DayRow[], figures: StoriesData["figures"], key: string): string | null {
  const fig = figures[key];
  if (fig) return formatFigure(fig);
  const v = pooled(days, figures, key);
  return v === null ? null : `${trimNumber(v)}%`;
}

/**
 * Deterministic horizontal jitter in [-0.5, 0.5): the fractional golden-ratio
 * sequence, so dots spread evenly and every render is the same.
 */
export function jitter(i: number): number {
  return ((i * GOLDEN) % 1) - 0.5;
}

function summarize(data: Props["data"], figures: Props["figures"]): string {
  if (data.days.length === 0) return "Per-day late share for weekdays, Sundays and Saturdays: not enough data yet.";
  const byType = (t: DayRow["type"]) => data.days.filter((d) => d.type === t);
  const [wk, sun, sat] = COLUMNS.map((c) => pooledLabel(byType(c.type), figures, c.figure) ?? "no data");
  const bad = (t: DayRow["type"]) => byType(t).filter((d) => d.late_pct > BAD_DAY).length;
  return `Saturdays average ${sat} of arrivals late, against ${wk} on weekdays and ${sun} on Sundays; ${bad("Saturday")} of ${byType("Saturday").length} Saturdays were more than ${BAD_DAY}% late, against ${bad("weekday")} of ${byType("weekday").length} weekdays.`;
}

function Strip({ data, figures, width, height }: Props & { width: number; height: number }) {
  const wide = width > 400;
  const m = { left: wide ? 40 : 32, right: wide ? 16 : 34, top: 14, bottom: 40 };
  const max = niceCeil(Math.max(20, ...data.days.map((d) => d.late_pct)), 5);
  const y = linearScale([0, max], [height - m.bottom, m.top]);
  const colW = (width - m.left - m.right) / COLUMNS.length;
  const font = 11;
  const r = wide ? 3 : 2.5;

  return (
    <g>
      <g className="font-mono" fontSize={font} fill={CHART.muted}>
        {ticks(0, max, 5).map((v) => (
          <g key={v}>
            <line x1={m.left} x2={width - m.right} y1={y(v)} y2={y(v)} stroke={v === 0 ? CHART.axis : CHART.grid} strokeWidth={0.75} />
            <text x={m.left - 6} y={y(v)} textAnchor="end" dominantBaseline="central">
              {v}%
            </text>
          </g>
        ))}
      </g>

      {/* The bad-day line */}
      <line x1={m.left} x2={width - m.right} y1={y(BAD_DAY)} y2={y(BAD_DAY)} stroke={CHART.major} strokeWidth={1.25} strokeDasharray="4 4" />
      <text x={m.left + 4} y={y(BAD_DAY) - 5} fontSize={font} fill={CHART.major} className="font-sans">
        {BAD_DAY}% late: a bad day
      </text>

      {COLUMNS.map((c, j) => {
        const days = data.days.filter((d) => d.type === c.type);
        const cx = m.left + colW * (j + 0.5);
        const avg = pooled(days, figures, c.figure);
        const avgLabel = pooledLabel(days, figures, c.figure);
        return (
          <g key={c.type}>
            {days.map((d, i) => (
              <circle key={d.date} cx={cx + jitter(i) * colW * 0.55} cy={y(d.late_pct)} r={r} fill={c.color} fillOpacity={0.7}>
                <title>{`${formatDate(d.date)}: ${trimNumber(d.late_pct)}% late (${d.n.toLocaleString("en-US")} arrivals)`}</title>
              </circle>
            ))}
            {avg !== null ? (
              <g>
                <line x1={cx - colW * 0.32} x2={cx + colW * 0.32} y1={y(avg)} y2={y(avg)} stroke={CHART.text} strokeWidth={2} />
                <text x={cx + colW * 0.34} y={y(avg)} dominantBaseline="central" fontSize={font} fill={CHART.text} className="font-mono">
                  {avgLabel}
                </text>
              </g>
            ) : null}
            <text x={cx} y={height - m.bottom + 17} textAnchor="middle" fontSize={font + 1} fill={CHART.text} className="font-sans">
              {c.label}
            </text>
            <text x={cx} y={height - m.bottom + 31} textAnchor="middle" fontSize={font - 1} fill={CHART.muted} className="font-mono">
              {days.length === 1 ? "1 day" : `${days.length} days`}
            </text>
          </g>
        );
      })}
    </g>
  );
}

/** Story 4: per-day late share for each day type, with the 15% bad-day line. */
export function DayStrip({ data, figures }: Props) {
  return (
    <ChartFrame
      title="Every day, one dot"
      summary={summarize(data, figures)}
      caption={`Each dot is one day's share of arrivals more than 4 minutes late; the dark bar is the pooled share for that kind of day. Above the dashed line, more than ${BAD_DAY}% of arrivals were late. There are far fewer Saturdays and Sundays than weekdays, so read the gap as suggestive.`}
      width={680}
      height={280}
      narrow={{ width: 320, height: 250, children: <Strip data={data} figures={figures} width={320} height={250} /> }}
    >
      <Strip data={data} figures={figures} width={680} height={280} />
    </ChartFrame>
  );
}
