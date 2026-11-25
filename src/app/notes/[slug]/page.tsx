import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import { getAllNotes, getNote } from "@/lib/notes";
import { formatDate } from "@/lib/format";
import { pageMetadata } from "@/lib/metadata";
import { Label, TextLink } from "@/components/ui";

type Params = Promise<{ slug: string }>;

export function generateStaticParams() {
  return getAllNotes({ includeDrafts: true }).map((n) => ({ slug: n.slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const note = getNote(slug, { includeDrafts: true });
  if (!note) return {};
  return pageMetadata({ title: note.title, description: note.summary, path: `/notes/${slug}/` });
}

export default async function NotePage({ params }: { params: Params }) {
  const { slug } = await params;
  const note = getNote(slug, { includeDrafts: true });
  if (!note) notFound();

  return (
    <article className="mx-auto max-w-3xl px-6">
      <header className="pb-8 pt-16 sm:pt-20">
        <Label>Notes</Label>
        <h1 className="mt-1 font-serif text-4xl leading-tight tracking-tight text-ink sm:text-5xl">{note.title}</h1>
        <p className="mt-4 text-sm text-muted">
          {formatDate(note.date)} · {note.readingMinutes} min read
          {note.draft && <span className="ml-2 rounded bg-paper-2 px-1.5 py-0.5 text-xs text-minor">Draft, not published</span>}
        </p>
      </header>

      <div className="prose prose-lg prose-field max-w-none border-t border-rule pt-8 prose-headings:font-serif prose-headings:font-normal prose-headings:tracking-tight prose-a:underline-offset-4">
        <MDXRemote source={note.content} />
      </div>

      <footer className="mt-16 border-t border-rule pt-6 text-ink-2">
        <p>
          Thanks for reading. <TextLink href="/notes/">More notes</TextLink> ·{" "}
          <TextLink href="/contact/">Get in touch</TextLink>
        </p>
      </footer>
    </article>
  );
}
