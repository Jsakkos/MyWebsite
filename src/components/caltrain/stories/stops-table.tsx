import type { StoriesData } from "@/lib/caltrain-stories-format";
import { formatDate } from "@/lib/format";

const MAX_ROWS = 12;

const th = "border-b border-rule py-2 pr-3 align-bottom text-xs font-medium text-muted sm:pr-4";
const td = "border-b border-rule py-2 pr-3 align-top sm:pr-4";
const num = "text-right font-mono tabular-nums";

/** Story 3, supporting: the newest detected line-wide stops. */
export function StopsTable({ data }: { data: StoriesData["stories"]["afternoons"] }) {
  const events = [...data.events]
    .sort((a, b) => `${b.date} ${b.start}`.localeCompare(`${a.date} ${a.start}`))
    .slice(0, MAX_ROWS);

  return (
    <div className="not-prose my-10 sm:-mx-4 lg:-mx-16">
      {events.length === 0 ? (
        <p className="font-sans text-sm text-muted">No line-wide stops detected yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse font-sans text-xs text-ink-2 sm:text-sm">
            <caption className="mb-3 text-left font-sans text-sm font-medium text-ink">
              Line-wide stops detected, newest first
              {data.events.length > MAX_ROWS ? (
                <span className="font-normal text-muted">
                  {" "}
                  (the latest {MAX_ROWS} of {data.events.length})
                </span>
              ) : null}
            </caption>
            <thead>
              <tr>
                <th scope="col" className={`${th} text-left`}>
                  Date
                </th>
                <th scope="col" className={`${th} text-left`}>
                  Held near
                </th>
                <th scope="col" className={`${th} text-right`}>
                  Held, min
                </th>
                <th scope="col" className={`${th} text-right`}>
                  Trains ≥ 15 min late
                </th>
                <th scope="col" className={`${th} pr-0 text-right`}>
                  Cancelled
                </th>
              </tr>
            </thead>
            <tbody>
              {events.map((e) => (
                <tr key={`${e.date} ${e.start}`}>
                  <th scope="row" className={`${td} whitespace-nowrap text-left font-normal text-ink`}>
                    {formatDate(e.date)}
                  </th>
                  <td className={td}>{e.held_near}</td>
                  <td className={`${td} ${num}`}>{e.hold_minutes}</td>
                  <td className={`${td} ${num}`}>{e.trains_late}</td>
                  <td className={`${td} ${num} pr-0`}>{e.cancelled}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
