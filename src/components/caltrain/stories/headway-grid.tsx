import type { HeadwayRow, StoriesData } from "@/lib/caltrain-stories-format";
import { trimNumber } from "@/lib/charts";
import { CHART, LATE_BREAKS, lateColor, lateTextColor } from "@/components/caltrain/palette";
import { ChartFrame } from "./chart-frame";

const LEADERS: HeadwayRow["leader"][] = ["≤ 0", "0–4", "4–10", "10–20", "> 20"];
const HEADWAYS: HeadwayRow["headway"][] = ["≤ 10", "11–20", "21–30", "31–40"];

/** Row label: how late the train ahead is. */
function leaderLabel(l: HeadwayRow["leader"]): string {
  return l === "≤ 0" ? "on time" : `${l} min`;
}

/** In a sentence: "the train ahead is 10–20 minutes late". */
function leaderPhrase(l: HeadwayRow["leader"]): string {
  return l === "≤ 0" ? "the train ahead is on time or early" : `the train ahead is ${l} minutes late`;
}

function summarize(rows: HeadwayRow[]): string {
  if (rows.length === 0) return "Late share of a train by how late the train ahead is and how close behind it runs: not enough data yet.";
  const worst = rows.reduce((a, b) => (b.late_pct > a.late_pct ? b : a));
  const best = rows.reduce((a, b) => (b.late_pct < a.late_pct ? b : a));
  const gap = (r: HeadwayRow) => `${r.headway} minutes behind it`;
  return `A train is late most often, ${trimNumber(worst.late_pct)}% of the time, when ${leaderPhrase(worst.leader)} and it is scheduled ${gap(worst)}; least often, ${trimNumber(best.late_pct)}%, when ${leaderPhrase(best.leader)} and it is scheduled ${gap(best)}.`;
}

const W = 320;
const LABEL_W = 70;
const TOP = 40;
const CELL_H = 38;
const GAP = 2;
const H = TOP + LEADERS.length * CELL_H + 4;

/** Story 2, supporting: follower late share by leader delay × scheduled headway. */
export function HeadwayGrid({ data }: { data: StoriesData["stories"]["express"] }) {
  const cells = new Map(data.headway.map((r) => [`${r.leader}|${r.headway}`, r]));
  const cellW = (W - LABEL_W) / HEADWAYS.length;

  return (
    <ChartFrame
      title="Stuck behind a late train"
      summary={summarize(data.headway)}
      caption="Share of trains arriving more than 4 minutes late, by how late the train ahead of it on the same track is (rows) and how many minutes behind it the train is scheduled (columns). The small number is how many arrivals each cell holds."
      width={W}
      height={H}
      maxWidthClass="max-w-sm"
    >
      <g className="font-sans" fontSize={11} fill={CHART.muted}>
        <text x={LABEL_W + (W - LABEL_W) / 2} y={11} textAnchor="middle">
          scheduled minutes behind the train ahead
        </text>
        <text x={0} y={TOP - 8}>
          train ahead
        </text>
        {HEADWAYS.map((h, j) => (
          <text key={h} x={LABEL_W + j * cellW + (cellW - GAP) / 2} y={TOP - 8} textAnchor="middle" className="font-mono">
            {h}
          </text>
        ))}
        {LEADERS.map((l, i) => (
          <text key={l} x={0} y={TOP + i * CELL_H + (CELL_H - GAP) / 2} dominantBaseline="central" className="font-mono">
            {leaderLabel(l)}
          </text>
        ))}
      </g>
      {LEADERS.map((l, i) =>
        HEADWAYS.map((h, j) => {
          const r = cells.get(`${l}|${h}`);
          const x = LABEL_W + j * cellW;
          const y = TOP + i * CELL_H;
          const cx = x + (cellW - GAP) / 2;
          const ink = r ? lateTextColor(r.late_pct, LATE_BREAKS.headway) : CHART.muted;
          return (
            <g key={`${l}|${h}`} className="font-mono">
              <rect x={x} y={y} width={cellW - GAP} height={CELL_H - GAP} fill={r ? lateColor(r.late_pct, LATE_BREAKS.headway) : "none"}
                stroke={r ? undefined : CHART.grid}
              />
              {r ? (
                <>
                  <text x={cx} y={y + 15} textAnchor="middle" fontSize={13} fontWeight={500} fill={ink}>
                    {trimNumber(r.late_pct)}%
                  </text>
                  <text x={cx} y={y + 29} textAnchor="middle" fontSize={10} fill={ink}>
                    {r.n.toLocaleString("en-US")}
                  </text>
                </>
              ) : (
                <text x={cx} y={y + (CELL_H - GAP) / 2} textAnchor="middle" dominantBaseline="central" fontSize={12} fill={ink}>
                  –
                </text>
              )}
            </g>
          );
        }),
      )}
    </ChartFrame>
  );
}
