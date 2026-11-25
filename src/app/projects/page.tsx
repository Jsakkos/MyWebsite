import type { Metadata } from "next";
import { getProfile, type Project } from "@/lib/content";
import { pageMetadata } from "@/lib/metadata";
import { PageIntro, SectionHeading, TextLink } from "@/components/ui";

export const metadata: Metadata = pageMetadata({
  title: "Projects",
  description: "Open-source software, a Caltrain on-time tracker, small hardware builds, and research tools.",
  path: "/projects/",
});

const GROUPS: { key: Project["group"]; title: string }[] = [
  { key: "software", title: "Software" },
  { key: "data", title: "Data" },
  { key: "hardware", title: "Hardware" },
  { key: "research", title: "Research tools" },
];

function byFeaturedFirst(a: Project, b: Project) {
  return Number(Boolean(b.featured)) - Number(Boolean(a.featured));
}

export default function ProjectsPage() {
  const { projects } = getProfile();

  return (
    <div className="mx-auto max-w-5xl px-6">
      <PageIntro label="Projects" title="Things I've built">
        <p>
          Most of these started because I wanted a tool that didn&apos;t exist yet: something to rip and label my
          discs, cull my photos, measure my train commute, or tell me how far the cat ran. The research tools came out
          of my postdoc. Everything here is open source.
        </p>
      </PageIntro>

      {GROUPS.map(({ key, title }) => {
        const items = projects.filter((p) => p.group === key).sort(byFeaturedFirst);
        if (items.length === 0) return null;
        return (
          <section key={key} aria-labelledby={`group-${key}`} className="mt-12 first-of-type:mt-0">
            <SectionHeading id={`group-${key}`}>{title}</SectionHeading>
            <ul className="mt-6">
              {items.map((p) => (
                <li key={p.slug} className="grid gap-2 border-t border-rule py-7 md:grid-cols-[11rem_1fr] md:gap-8">
                  <p className="text-sm text-muted">{p.years}</p>
                  <div>
                    <h3 className="font-serif text-2xl text-ink">{p.name}</h3>
                    <p className="mt-2 max-w-2xl text-ink-2">{p.pitch}</p>
                    <p className="mt-3 text-sm text-muted">{p.stack.join(" · ")}</p>
                    <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-1">
                      {p.links.map((l) => (
                        <li key={l.url}>
                          <TextLink href={l.url}>{l.label}</TextLink>
                        </li>
                      ))}
                    </ul>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
