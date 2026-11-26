import type { Metadata } from "next";
import { getProfile } from "@/lib/content";
import { formatDateRange } from "@/lib/format";
import { pageMetadata } from "@/lib/metadata";
import { PrintButton } from "@/components/print-button";
import { TextLink } from "@/components/ui";

export const metadata: Metadata = pageMetadata({
  title: "Resume",
  description: "Resume of Jonathan K. Sakkos, Staff Engineer, Spatial Genomics R&D.",
  path: "/resume/",
});

// How many highlights each role gets on the one-to-two-page resume.
const HIGHLIGHTS_PER_ROLE: Record<string, number> = {
  "Takara Bio USA, Inc.": 4,
  "Curio Bioscience": 2,
  "Michigan State University": 3,
  "University of Minnesota": 2,
  "Columbia Steel Casting Co.": 1,
};

export default function ResumePage() {
  const { basics, pillars, work, education, publications, patents } = getProfile();
  const linkedin = basics.profiles.find((p) => p.network === "LinkedIn");
  const github = basics.profiles.find((p) => p.network === "GitHub");
  const roles = work.filter((w) => w.organization in HIGHLIGHTS_PER_ROLE);

  return (
    <article className="mx-auto max-w-3xl px-6 py-12 text-[15px] leading-snug print:max-w-none print:px-0 print:py-0 print:text-[10.5pt]">
      <p data-print-hide className="mb-8 flex flex-wrap gap-x-5 text-sm">
        <PrintButton />
        <TextLink href="/files/jonathan-sakkos-resume.pdf">Download the PDF</TextLink>
        <TextLink href="/work/">Back to Work</TextLink>
      </p>

      <header className="border-b border-rule pb-4">
        <h1 className="font-serif text-3xl tracking-tight text-ink print:text-[22pt]">{basics.name}, Ph.D.</h1>
        <p className="mt-1 text-ink-2">{basics.label}</p>
        <p className="mt-2 text-sm text-muted">
          {basics.location} · {basics.email} · jonathanksakkos.com
          {linkedin && <> · {linkedin.url.replace("https://www.", "").replace(/\/$/, "")}</>}
          {github && <> · github.com/{github.username}</>}
        </p>
      </header>

      <section className="mt-4">
        <p className="text-ink-2">
          {basics.throughline} Ph.D. mechanical engineer with more than ten years across biotech R&amp;D and
          manufacturing, from automated instruments and computer vision to scale-up and design transfer.
        </p>
      </section>

      <section className="mt-5">
        <h2 className="font-serif text-lg text-accent print:text-black">Experience</h2>
        {roles.map((w) => (
          <div key={`${w.organization}-${w.startDate}`} className="mt-3 break-inside-avoid">
            <div className="flex flex-wrap items-baseline justify-between gap-x-4">
              <p className="font-semibold text-ink">
                {w.position} · {w.organization}
              </p>
              <p className="text-sm text-muted">{formatDateRange(w.startDate, w.endDate)}</p>
            </div>
            <ul className="mt-1 list-disc space-y-0.5 pl-5 text-ink-2">
              {w.highlights.slice(0, HIGHLIGHTS_PER_ROLE[w.organization]).map((h) => (
                <li key={h}>{h}</li>
              ))}
            </ul>
          </div>
        ))}
      </section>

      <section className="mt-5 break-inside-avoid">
        <h2 className="font-serif text-lg text-accent print:text-black">Education</h2>
        {education.map((e) => (
          <div key={e.institution} className="mt-2">
            <div className="flex flex-wrap items-baseline justify-between gap-x-4">
              <p className="text-ink">
                <span className="font-semibold">
                  {e.studyType}, {e.area}
                </span>{" "}
                · {e.institution}
              </p>
              <p className="text-sm text-muted">{e.endYear}</p>
            </div>
            {e.thesis && <p className="text-ink-2">Thesis: {e.thesis}</p>}
          </div>
        ))}
      </section>

      <section className="mt-5 break-inside-avoid">
        <h2 className="font-serif text-lg text-accent print:text-black">Strengths</h2>
        <ul className="mt-1 list-disc space-y-0.5 pl-5 text-ink-2">
          {pillars.map((p) => (
            <li key={p.title}>
              <span className="font-semibold text-ink">{p.title}:</span> {p.claim}
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-5 break-inside-avoid">
        <h2 className="font-serif text-lg text-accent print:text-black">Publications and patents</h2>
        <p className="mt-1 text-ink-2">
          {publications.length} peer-reviewed papers and {patents.length} patent applications. Full list at
          jonathanksakkos.com/publications.
        </p>
      </section>
    </article>
  );
}
