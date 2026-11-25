import type { Metadata } from "next";
import { getProfile } from "@/lib/content";
import { formatDateRange } from "@/lib/format";
import { pageMetadata } from "@/lib/metadata";
import { Label, PageIntro, SectionHeading, TextLink } from "@/components/ui";

export const metadata: Metadata = pageMetadata({
  title: "Work",
  description: "From steel castings to spatial genomics: the path, the four things I do, and every role along the way.",
  path: "/work/",
});

export default function WorkPage() {
  const { basics, pillars, work, education, honors, service } = getProfile();

  return (
    <div className="mx-auto max-w-5xl px-6">
      <PageIntro label="Work" title="From steel castings to spatial genomics">
        <div className="space-y-4">
          {basics.story.map((p) => (
            <p key={p.slice(0, 24)}>{p}</p>
          ))}
        </div>
        <p className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-base">
          <TextLink href="/files/jonathan-sakkos-resume.pdf">Download resume (PDF)</TextLink>
          <TextLink href="/resume/">View as a page</TextLink>
        </p>
      </PageIntro>

      <section aria-labelledby="what-i-do" className="border-t border-rule pt-10">
        <SectionHeading id="what-i-do">What I do</SectionHeading>
        <div className="mt-8 grid gap-x-12 gap-y-10 md:grid-cols-2">
          {pillars.map((p) => (
            <div key={p.title}>
              <h3 className="font-serif text-xl text-ink">{p.title}</h3>
              <p className="mt-2 text-ink-2">{p.claim}</p>
              <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm text-ink-2 marker:text-accent">
                {p.proof.map((x) => (
                  <li key={x}>{x}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section aria-labelledby="experience" className="mt-20">
        <SectionHeading id="experience">Experience</SectionHeading>
        <ol className="mt-8">
          {work.map((w) => (
            <li
              key={`${w.organization}-${w.startDate}`}
              className="grid gap-2 border-t border-rule py-8 md:grid-cols-[11rem_1fr] md:gap-8"
            >
              <div className="text-sm text-muted">
                <p>{formatDateRange(w.startDate, w.endDate)}</p>
                <p>{w.location}</p>
              </div>
              <div>
                <h3 className="font-serif text-xl text-ink">{w.position}</h3>
                <p className="text-accent">
                  {w.url ? <TextLink href={w.url}>{w.organization}</TextLink> : w.organization}
                </p>
                <p className="mt-3 max-w-2xl text-ink-2">{w.summary}</p>
                {w.highlights.length > 0 && (
                  <ul className="mt-3 max-w-2xl list-disc space-y-1.5 pl-5 text-ink-2 marker:text-accent">
                    {w.highlights.map((h) => (
                      <li key={h}>{h}</li>
                    ))}
                  </ul>
                )}
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="education" className="mt-16">
        <SectionHeading id="education">Education</SectionHeading>
        <ul className="mt-6">
          {education.map((e) => (
            <li key={e.institution} className="grid gap-2 border-t border-rule py-6 md:grid-cols-[11rem_1fr] md:gap-8">
              <p className="text-sm text-muted">
                {e.startYear} – {e.endYear}
              </p>
              <div>
                <h3 className="font-serif text-xl text-ink">
                  {e.studyType}, {e.area}
                </h3>
                <p className="text-ink-2">
                  {e.institution} · {e.location}
                </p>
                {e.thesis && <p className="mt-2 text-sm italic text-muted">Thesis: {e.thesis}</p>}
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-16 grid gap-12 border-t border-rule pt-10 md:grid-cols-2">
        <div>
          <Label>Honors</Label>
          <ul className="mt-3 space-y-2 text-ink-2">
            {honors.map((h) => (
              <li key={h.title}>
                <span className="text-muted">{h.year}</span> · {h.title}, {h.org}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <Label>Mentoring and outreach</Label>
          <ul className="mt-3 space-y-2 text-ink-2">
            {service.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
