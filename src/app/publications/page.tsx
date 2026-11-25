import type { Metadata } from "next";
import { Fragment } from "react";
import { getProfile, type Publication } from "@/lib/content";
import { doiUrl, splitAuthors } from "@/lib/format";
import { pageMetadata } from "@/lib/metadata";
import { Label, PageIntro, SectionHeading, TextLink } from "@/components/ui";

export const metadata: Metadata = pageMetadata({
  title: "Papers",
  description:
    "Peer-reviewed papers on engineered living materials, synthetic biology of cyanobacteria, and microbial communities, plus patents and talks.",
  path: "/publications/",
});

function Authors({ authors }: { authors: string[] }) {
  return (
    <>
      {splitAuthors(authors).map((a, i) => (
        <Fragment key={`${a.name}-${i}`}>
          {i > 0 && ", "}
          {a.self ? <strong className="font-semibold text-ink">{a.name}</strong> : a.name}
        </Fragment>
      ))}
    </>
  );
}

function groupByYear(pubs: Publication[]): [number, Publication[]][] {
  const years = [...new Set(pubs.map((p) => p.year))].sort((a, b) => b - a);
  return years.map((y) => [y, pubs.filter((p) => p.year === y)]);
}

export default function PapersPage() {
  const { publications, patents, talks, basics } = getProfile();
  const scholar = basics.profiles.find((p) => p.network === "Google Scholar")?.url;
  const orcid = basics.profiles.find((p) => p.network === "ORCID")?.url;

  return (
    <div className="mx-auto max-w-5xl px-6">
      <PageIntro label="Papers" title="Research">
        <p>
          {publications.length} peer-reviewed papers and {patents.length} patent applications, from silica gels that
          house bacteria to engineered cyanobacteria and the communities they form.
        </p>
        <p className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-base">
          {scholar && <TextLink href={scholar}>Google Scholar</TextLink>}
          {orcid && <TextLink href={orcid}>ORCID</TextLink>}
        </p>
      </PageIntro>

      <section aria-labelledby="papers">
        <h2 id="papers" className="sr-only">
          Peer-reviewed papers
        </h2>
        {groupByYear(publications).map(([year, pubs]) => (
          <div key={year} className="grid gap-2 border-t border-rule py-6 md:grid-cols-[11rem_1fr] md:gap-8">
            <p className="font-serif text-xl text-muted">{year}</p>
            <ul className="space-y-6">
              {pubs.map((p) => (
                <li key={p.doi} className="min-w-0">
                  <a
                    href={doiUrl(p.doi)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="break-words font-serif text-lg leading-snug text-ink hover:text-accent"
                  >
                    {p.title}
                  </a>
                  <p className="mt-1 break-words text-sm text-ink-2">
                    <Authors authors={p.authors} />
                  </p>
                  <p className="mt-1 text-sm text-muted">
                    <span className="italic">{p.venue}</span>
                    {p.note && <> · {p.note}</>}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </section>

      <section aria-labelledby="patents" className="mt-16">
        <SectionHeading id="patents">Patent applications</SectionHeading>
        <ul className="mt-6">
          {patents.map((p) => (
            <li key={p.number} className="grid gap-2 border-t border-rule py-5 md:grid-cols-[11rem_1fr] md:gap-8">
              <p className="text-sm text-muted">{p.year}</p>
              <div className="min-w-0">
                <p className="font-serif text-lg text-ink">{p.title}</p>
                <p className="mt-1 text-sm text-ink-2">
                  <Authors authors={p.authors} />
                </p>
                <p className="mt-1 break-words text-sm text-muted">{p.number}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="talks" className="mt-16">
        <SectionHeading id="talks">Talks and posters</SectionHeading>
        <ul className="mt-6">
          {talks.map((t) => (
            <li
              key={`${t.year}-${t.event}`}
              className="grid gap-2 border-t border-rule py-5 md:grid-cols-[11rem_1fr] md:gap-8"
            >
              <p className="text-sm text-muted">{t.year}</p>
              <div className="min-w-0">
                <Label className="text-sm">{t.kind}</Label>
                <p className="text-ink">
                  {t.event}, {t.location}
                </p>
                {t.title && <p className="mt-1 text-sm text-ink-2">&ldquo;{t.title}&rdquo;</p>}
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
