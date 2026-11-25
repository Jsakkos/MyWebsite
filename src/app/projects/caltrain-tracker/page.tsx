import type { Metadata } from "next";
import { pageMetadata } from "@/lib/metadata";
import { CaltrainSnapshot } from "@/components/caltrain-snapshot";
import { Label, PageIntro, SectionHeading, TextLink } from "@/components/ui";

export const metadata: Metadata = pageMetadata({
  title: "Caltrain Performance Tracker",
  description:
    "Logging the position of every Caltrain once a minute and turning it into on-time performance, delay patterns, and incident diagrams.",
  path: "/projects/caltrain-tracker/",
});

const STEPS = [
  {
    title: "Collect",
    body: "A small collector asks the 511.org real-time API where every train is, once a minute, and stores each position in SQLite. One request a minute is all the API key allows, so it never retries within a minute.",
  },
  {
    title: "Build",
    body: "Every night a DuckDB pipeline turns those pings into arrivals and scores each one against the timetable that was actually in effect that day. Caltrain changes its schedule several times a year, so every schedule version is kept and matched by date.",
  },
  {
    title: "Publish",
    body: "The build writes a set of JSON files, which a scheduled job commits to this site's repository at 02:30 UTC. The dashboard reads them as static files; there is no live API to keep running.",
  },
];

export default function CaltrainTrackerPage() {
  return (
    <article className="mx-auto max-w-3xl px-6">
      <PageIntro label="Project" title="Caltrain Performance Tracker">
        <p>
          I commute by bike and Caltrain. The timetable says when trains should arrive; I wanted to see how they
          actually run, stop by stop and day by day. So I started logging every train on the line.
        </p>
        <p className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-base">
          <TextLink href="/projects/caltrain-tracker/dashboard/">Open the dashboard</TextLink>
          <TextLink href="https://github.com/Jsakkos/caltrain-tracker">Source on GitHub</TextLink>
        </p>
      </PageIntro>

      <div className="rounded-md bg-paper-2 px-5 py-4">
        <CaltrainSnapshot variant="inline" />
      </div>

      <section aria-labelledby="how" className="mt-14">
        <SectionHeading id="how">How it works</SectionHeading>
        <ol className="mt-6">
          {STEPS.map((s) => (
            <li key={s.title} className="grid gap-2 border-t border-rule py-6 sm:grid-cols-[8rem_1fr] sm:gap-6">
              <Label>{s.title}</Label>
              <p className="text-ink-2">{s.body}</p>
            </li>
          ))}
        </ol>
        <p className="mt-2 text-sm text-muted">Python · SQLite · DuckDB · GTFS and GTFS-RT · cron · Next.js · Recharts</p>
      </section>

      <section aria-labelledby="method" className="mt-14 space-y-4 text-ink-2">
        <SectionHeading id="method">Method</SectionHeading>
        <p>
          <span className="text-ink">Arrival.</span> The feed reports where a train is and which stop it&apos;s
          heading to, not when it arrives. For each train, day and stop, the arrival is the minute when the train was
          closest to the platform, using the haversine distance between its position and the station.
        </p>
        <p>
          <span className="text-ink">On time.</span> A train is on time at a stop if it arrives no more than 4
          minutes behind schedule. Minor delays are 5 to 14 minutes; major delays are 15 minutes or more. The commute
          windows are 6 to 9 a.m. and 3:30 to 7:30 p.m. on weekdays.
        </p>
        <p>
          <span className="text-ink">Precision.</span> Positions arrive once a minute and some are stale, so each
          arrival is accurate to about a minute. Delays under two minutes are noise; the 4-minute threshold sits well
          above that.
        </p>
      </section>

      <section aria-labelledby="caveat" className="mt-14">
        <SectionHeading id="caveat">A caveat about the headline number</SectionHeading>
        <div className="mt-4 space-y-4 text-ink-2">
          <p>
            The on-time figure on the dashboard counts every stop, including the terminal stations. Trains parked
            at San Francisco or San Jose before departure register as arriving on time, and they make up about 11%
            of all arrivals. Early arrivals also count as zero delay. Together these push the published figure up,
            which is why I label it &ldquo;all stops, unadjusted.&rdquo;
          </p>
          <p>
            A cleaner measure leaves out terminal stops and the days when the real-time feed went stale. It&apos;s
            part of the next phase.
          </p>
        </div>
      </section>

      <section aria-labelledby="next" className="mt-14">
        <SectionHeading id="next">Next: stories from the data</SectionHeading>
        <p className="mt-4 text-ink-2">
          More than a year of data has turned up some patterns worth telling properly, like how a train that falls
          ten minutes behind tends to stay behind to the end of the line. Those stories are coming here.
        </p>
      </section>
    </article>
  );
}
