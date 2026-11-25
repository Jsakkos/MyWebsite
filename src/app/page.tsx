import Image from "next/image";
import { getFeaturedProjects, getProfile, getRecentPublications } from "@/lib/content";
import { doiUrl } from "@/lib/format";
import { CaltrainSnapshot } from "@/components/caltrain-snapshot";
import { Label, SectionHeading, TextLink } from "@/components/ui";

export default function Home() {
  const profile = getProfile();
  const { basics, columns, work, pillars, publications } = profile;
  const [beforeAccent, afterAccent] = basics.throughline.split(basics.accent);
  const job = work[0];
  const profileLink = (network: string) => basics.profiles.find((p) => p.network === network)?.url;

  const quickLinks = [
    { label: "Resume", href: "/resume/" },
    { label: "Email", href: `mailto:${basics.email}` },
    { label: "GitHub", href: profileLink("GitHub") },
    { label: "LinkedIn", href: profileLink("LinkedIn") },
    { label: "Google Scholar", href: profileLink("Google Scholar") },
  ].filter((l): l is { label: string; href: string } => Boolean(l.href));

  return (
    <div className="mx-auto max-w-5xl px-6">
      {/* Hero */}
      <section className="grid gap-10 pb-14 pt-16 sm:pt-20 md:grid-cols-[1fr_auto] md:items-start">
        <div>
          <Label>
            {basics.label} · {job.organization.replace(", Inc.", "")}
          </Label>
          <h1 className="mt-3 font-serif text-[2.35rem] leading-[1.12] tracking-tight text-ink sm:text-5xl">
            {beforeAccent}
            <em className="text-accent">{basics.accent}</em>
            {afterAccent}
          </h1>
          <div className="mt-7 max-w-2xl space-y-4 text-lg leading-relaxed text-ink-2">
            {basics.intro.map((p) => (
              <p key={p.slice(0, 24)}>{p}</p>
            ))}
            <p>{basics.offTheClock}</p>
          </div>
          <ul className="mt-7 flex flex-wrap gap-x-5 gap-y-2">
            {quickLinks.map((l) => (
              <li key={l.label}>
                <TextLink href={l.href}>{l.label}</TextLink>
              </li>
            ))}
          </ul>
        </div>
        <Image
          src={basics.image}
          alt={`Portrait of ${basics.name}`}
          width={160}
          height={160}
          priority
          className="order-first h-32 w-32 rounded-full object-cover ring-1 ring-rule sm:h-40 sm:w-40 md:order-none"
        />
      </section>

      {/* Now / Before / On the side */}
      <section aria-label="At a glance" className="grid gap-8 border-t border-rule pt-8 md:grid-cols-3">
        <div>
          <Label>Now</Label>
          <p className="mt-2 text-ink-2">{columns.now}</p>
        </div>
        <div>
          <Label>Before</Label>
          <ul className="mt-2 space-y-1.5 text-ink-2">
            {columns.before.map((b) => (
              <li key={b}>{b}</li>
            ))}
          </ul>
        </div>
        <div>
          <Label>On the side</Label>
          <ul className="mt-2 space-y-1.5 text-ink-2">
            {columns.onTheSide.map((b) => (
              <li key={b}>{b}</li>
            ))}
          </ul>
        </div>
      </section>

      {/* Selected work */}
      <section aria-labelledby="selected-work" className="mt-24">
        <SectionHeading id="selected-work">Selected work</SectionHeading>
        <ol className="mt-8">
          <li className="grid gap-3 border-t border-rule py-8 md:grid-cols-[11rem_1fr] md:gap-8">
            <Label>Day job</Label>
            <div>
              <h3 className="font-serif text-2xl text-ink">
                Spatial genomics at {job.organization.replace(", Inc.", "")}
              </h3>
              <p className="mt-3 max-w-2xl text-ink-2">{job.summary}</p>
              <ul className="mt-4 max-w-2xl list-disc space-y-1.5 pl-5 text-ink-2 marker:text-accent">
                {[pillars[0].proof[0], pillars[1].proof[0], pillars[2].proof[0]].map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
              <p className="mt-4">
                <TextLink href="/work/">More about my work →</TextLink>
              </p>
            </div>
          </li>
          {getFeaturedProjects().map((project) => (
            <li
              key={project.slug}
              className="grid gap-3 border-t border-rule py-8 md:grid-cols-[11rem_1fr] md:gap-8"
            >
              <Label>{project.group === "data" ? "Data" : "Open source"}</Label>
              <div>
                <h3 className="font-serif text-2xl text-ink">{project.name}</h3>
                <p className="mt-3 max-w-2xl text-ink-2">{project.pitch}</p>
                {project.slug === "caltrain-tracker" && <CaltrainSnapshot variant="card" />}
                <p className="mt-3 text-sm text-muted">{project.stack.join(" · ")}</p>
                <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-1">
                  {project.links.map((l) => (
                    <li key={l.url}>
                      <TextLink href={l.url}>{l.label}</TextLink>
                    </li>
                  ))}
                </ul>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* Recent papers */}
      <section aria-labelledby="recent-papers" className="mt-16">
        <SectionHeading id="recent-papers">Recent papers</SectionHeading>
        <ul className="mt-6">
          {getRecentPublications(3).map((p) => (
            <li key={p.doi} className="border-t border-rule py-5">
              <p className="text-sm text-muted">
                {p.year} · <span className="italic">{p.venue}</span>
              </p>
              <a
                href={doiUrl(p.doi)}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 block font-serif text-lg leading-snug text-ink hover:text-accent"
              >
                {p.title}
              </a>
            </li>
          ))}
        </ul>
        <p className="mt-4 border-t border-rule pt-5">
          <TextLink href="/publications/">All {publications.length} papers →</TextLink>
        </p>
      </section>
    </div>
  );
}
