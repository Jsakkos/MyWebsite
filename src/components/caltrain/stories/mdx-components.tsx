import type { ComponentType, ReactNode } from "react";
import {
  STORY_FIGURE_KEYS,
  formatFigure,
  type ExampleDay,
  type StoriesData,
  type StoryId,
} from "@/lib/caltrain-stories-format";
import { formatDate } from "@/lib/format";
import { TextLink } from "@/components/ui";
import { HeadlineStrip } from "@/components/caltrain/stories/headline-strip";
import { OpenerHeatmap } from "@/components/caltrain/stories/opener-heatmap";
import { RecoveryFan } from "@/components/caltrain/stories/recovery-fan";
import { LeagueTable } from "@/components/caltrain/stories/league-table";
import { HeadwayGrid } from "@/components/caltrain/stories/headway-grid";
import { DayStrip } from "@/components/caltrain/stories/day-strip";
import { StopsTable } from "@/components/caltrain/stories/stops-table";
import { PlayableMarey } from "@/components/caltrain/stories/playable-marey";

const DASHBOARD = "/projects/caltrain-tracker/dashboard/";

/** Dashboard sections a story can send the reader to, with the link's wording. */
const CHECK_LABELS = {
  trains: "Check your own train on the dashboard",
  stations: "Check your own station on the dashboard",
  hours: "Check your own hour on the dashboard",
  incidents: "See every incident on the dashboard",
  days: "Check any day on the dashboard",
} as const;

export type DashboardSection = keyof typeof CHECK_LABELS;

/**
 * The tags `content/caltrain/stories.mdx` may use, bound to one night's data.
 *
 * A figure key the stories schema doesn't know is a code bug, so `Fig` throws
 * (the MDX test renders the file against fixture data, so it fails before merge).
 * Missing data is not: the page never calls this without stories, and
 * `AfternoonDiagram` quietly renders nothing without its example day.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function storyComponents(data: StoriesData, day: ExampleDay | null): Record<string, ComponentType<any>> {
  const { figures, stories } = data;

  function Fig({ k }: { k: string }) {
    const figure = STORY_FIGURE_KEYS.includes(k) ? figures[k] : undefined;
    if (!figure) throw new Error(`Unknown story figure "${k}" in stories.mdx`);
    return <span className="font-mono text-[0.9em] text-ink">{formatFigure(figure)}</span>;
  }

  function ClaimNote({ story }: { story: StoryId }) {
    if (stories[story].holds) return null;
    return (
      <p role="note" className="not-prose my-6 font-sans text-sm text-minor">
        As of {formatDate(data.data_through)}, this no longer holds in the latest data.
      </p>
    );
  }

  function Story({ n, title, children }: { n: number; title: string; children?: ReactNode }) {
    return (
      <section id={`story-${n}`} aria-labelledby={`story-${n}-title`} className="mt-16 scroll-mt-24 border-t border-rule pt-10">
        <p aria-hidden="true" className="not-prose font-serif text-2xl italic leading-none text-accent">
          {n}
        </p>
        <h2 id={`story-${n}-title`} className="mt-2">
          {title}
        </h2>
        {children}
      </section>
    );
  }

  function CheckYourTrain({ to, children }: { to: DashboardSection; children?: ReactNode }) {
    return (
      <p className="not-prose mt-6 font-sans text-base">
        <TextLink href={`${DASHBOARD}#${to}`}>
          {children ?? CHECK_LABELS[to]}
          <span aria-hidden="true"> →</span>
        </TextLink>
      </p>
    );
  }

  function Trust({ children }: { children?: ReactNode }) {
    return (
      <section id="trust" aria-labelledby="trust-title" className="mt-16 scroll-mt-24 border-t border-rule pt-10">
        <h2 id="trust-title" className="mt-0">
          How much to trust these numbers
        </h2>
        {children}
      </section>
    );
  }

  function StoriesHeadlineStrip() {
    return <HeadlineStrip figures={figures} />;
  }
  function StoriesOpenerHeatmap() {
    return <OpenerHeatmap data={stories.opener} />;
  }
  function StoriesRecoveryFan() {
    return <RecoveryFan data={stories.recovery} figures={figures} />;
  }
  function StoriesLeagueTable() {
    return <LeagueTable data={stories.express} />;
  }
  function StoriesHeadwayGrid() {
    return <HeadwayGrid data={stories.express} />;
  }
  function StoriesDayStrip() {
    return <DayStrip data={stories.saturday} figures={figures} />;
  }
  function StoriesStopsTable() {
    return <StopsTable data={stories.afternoons} />;
  }
  function AfternoonDiagram() {
    return day ? <PlayableMarey day={day} /> : null;
  }

  return {
    Fig,
    ClaimNote,
    Story,
    CheckYourTrain,
    Trust,
    HeadlineStrip: StoriesHeadlineStrip,
    OpenerHeatmap: StoriesOpenerHeatmap,
    RecoveryFan: StoriesRecoveryFan,
    LeagueTable: StoriesLeagueTable,
    HeadwayGrid: StoriesHeadwayGrid,
    DayStrip: StoriesDayStrip,
    StopsTable: StoriesStopsTable,
    AfternoonDiagram,
  };
}
