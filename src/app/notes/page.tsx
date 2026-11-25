import type { Metadata } from "next";
import Link from "next/link";
import { getAllNotes } from "@/lib/notes";
import { formatDate } from "@/lib/format";
import { pageMetadata } from "@/lib/metadata";
import { PageIntro, TextLink } from "@/components/ui";

export const metadata: Metadata = pageMetadata({
  title: "Notes",
  description: "Occasional write-ups on projects, data, and building things.",
  path: "/notes/",
});

export default function NotesPage() {
  const notes = getAllNotes({ includeDrafts: true });

  return (
    <div className="mx-auto max-w-3xl px-6">
      <PageIntro label="Notes" title="Notes">
        <p>Occasional write-ups on the things I build and what the data turns up.</p>
      </PageIntro>

      {notes.length === 0 ? (
        <p className="border-t border-rule pt-6 text-ink-2">
          Nothing published yet. In the meantime, <TextLink href="/projects/">here&apos;s what I&apos;m building</TextLink>.
        </p>
      ) : (
        <ul>
          {notes.map((n) => (
            <li key={n.slug} className="border-t border-rule py-6">
              <p className="text-sm text-muted">
                {formatDate(n.date)} · {n.readingMinutes} min read
                {n.draft && <span className="ml-2 rounded bg-paper-2 px-1.5 py-0.5 text-xs text-minor">Draft</span>}
              </p>
              <Link href={`/notes/${n.slug}/`} className="mt-1 block font-serif text-2xl text-ink hover:text-accent">
                {n.title}
              </Link>
              <p className="mt-2 text-ink-2">{n.summary}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
