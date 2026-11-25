import type { ReactNode } from "react";
import { formatFigure, type StoriesData } from "@/lib/caltrain-stories-format";
import { cn } from "@/lib/utils";

type Figures = StoriesData["figures"];

/** A figure formatted for display, or an en dash when it is missing. */
function fig(figures: Figures, key: string): string {
  const f = figures[key];
  return f ? formatFigure(f) : "–";
}

function entries(figures: Figures): { figure: string; caption: ReactNode }[] {
  const f = (k: string) => fig(figures, k);
  const service = String(figures.worst_train_service?.value ?? "").toLowerCase();
  const direction = String(figures.worst_train_direction?.value ?? "");
  return [
    {
      figure: f("recovery_back_on_time_pct"),
      caption: "of trains that fall 10 minutes behind get back on time",
    },
    {
      figure: f("worst_train_late_pct"),
      caption: `of weekday runs of train ${f("worst_train")}, the ${f("worst_train_departs")} ${direction} ${service}, are late at ${f("worst_train_last_stop")}`,
    },
    {
      figure: f("stops_count"),
      caption: `line-wide stops and the hours after them hold ${f("stops_late15_share_pct")} of arrivals more than 15 minutes late`,
    },
    {
      figure: f("sat_late_pct"),
      caption: `of Saturday arrivals are late, vs ${f("weekday_late_pct")} on weekdays`,
    },
  ];
}

/**
 * The four headline figures, one per story, doubling as the table of contents.
 * 2 × 2 on phones, one row of four from `sm:` up.
 */
export function HeadlineStrip({ figures }: { figures: Figures }) {
  return (
    <nav aria-label="The four stories" className="not-prose my-8">
      <ol className="grid grid-cols-2 border-y border-rule sm:grid-cols-4">
        {entries(figures).map((e, i) => (
          <li
            key={i}
            className={cn(
              "border-rule",
              // Rules between cells: a left rule except at the start of each row,
              // and a rule between the two rows on phones.
              i % 2 === 1 && "border-l",
              i >= 2 && "border-t sm:border-t-0",
              i === 2 && "sm:border-l",
            )}
          >
            <a
              href={`#story-${i + 1}`}
              className={cn(
                "group block h-full py-3 pr-3 focus-visible:outline-offset-[-2px]",
                i % 2 === 1 ? "pl-3" : "pl-0",
                i === 2 && "sm:pl-3",
              )}
            >
              <span className="block font-mono text-xl text-ink group-hover:text-accent sm:text-2xl">{e.figure}</span>
              <span className="mt-1 block font-sans text-xs leading-snug text-muted group-hover:text-ink-2">
                {e.caption}
              </span>
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
