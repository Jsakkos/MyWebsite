import fs from "node:fs";
import path from "node:path";
import type { Metadata } from "next";
import { MDXRemote } from "next-mdx-remote/rsc";
import { DASHBOARD_PATH, STORIES_PATH, loadExampleDay, loadStories } from "@/lib/caltrain-stories";
import { formatDate } from "@/lib/format";
import { pageMetadata } from "@/lib/metadata";
import { Label, PageIntro, TextLink } from "@/components/ui";
import { StaleNotice } from "@/components/caltrain/stale-notice";
import { storyComponents } from "@/components/caltrain/stories/mdx-components";

const TITLE = "How Caltrain runs late";
const KICKER = "Caltrain · stories from the data";
const STORIES_MDX = path.join(process.cwd(), "content", "caltrain", "stories.mdx");

export const metadata: Metadata = pageMetadata({
  title: TITLE,
  description:
    "What logging every Caltrain once a minute shows about late trains: whether they catch up, which trains run late most often, what a few bad afternoons do to the line, and why Saturday may be the worst day to ride.",
  path: STORIES_PATH,
});

export default function CaltrainStoriesPage() {
  const data = loadStories();

  if (!data) {
    return (
      <article className="mx-auto max-w-3xl px-6">
        <PageIntro label={KICKER} title={TITLE}>
          <p>
            The stories are being refreshed. The <TextLink href={DASHBOARD_PATH}>dashboard</TextLink> has the latest
            numbers.
          </p>
        </PageIntro>
      </article>
    );
  }

  const mdx = fs.readFileSync(STORIES_MDX, "utf8");
  const components = storyComponents(data, loadExampleDay());

  return (
    <article className="mx-auto max-w-3xl px-6 pb-8">
      <header className="pb-2 pt-16 sm:pt-20">
        <Label>{KICKER}</Label>
        <h1 className="mt-1 font-serif text-4xl leading-tight tracking-tight text-ink sm:text-5xl">{TITLE}</h1>
        <p className="mt-5 max-w-2xl text-lg leading-relaxed text-ink-2">
          More than a year of every train&rsquo;s position, logged once a minute, turned into four things I
          didn&rsquo;t expect to learn about my commute.
        </p>
        <p className="mt-4 text-sm text-muted">
          Data through {formatDate(data.data_through)} · updates nightly ·{" "}
          <TextLink href="#trust">how much to trust these numbers</TextLink>
        </p>
        <div className="mt-3">
          {/* Keyed to the nightly build, not data_through: runs of bad-feed days hold data_through back while the tracker keeps reporting. */}
          <StaleNotice lastReported={data.generated_at.slice(0, 10)} />
        </div>
      </header>

      <div className="prose prose-lg prose-field mt-6 max-w-none prose-headings:font-serif prose-headings:font-normal prose-headings:tracking-tight prose-a:underline-offset-4">
        <MDXRemote source={mdx} components={components} />
      </div>
    </article>
  );
}
