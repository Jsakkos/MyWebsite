import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import type { Metadata } from "next";
import { pageMetadata } from "@/lib/metadata";

export interface NoteMeta {
  slug: string;
  title: string;
  date: string; // YYYY-MM-DD
  summary: string;
  readingMinutes: number;
  draft: boolean;
}

export interface Note extends NoteMeta {
  content: string;
}

interface Options {
  dir?: string;
  includeDrafts?: boolean;
}

const NOTES_DIR = path.join(process.cwd(), "content", "notes");

/** Drafts never ship in a production build, whatever the caller asks for. */
const showDrafts = (requested?: boolean) => Boolean(requested) && process.env.NODE_ENV !== "production";

function readNote(dir: string, file: string): Note {
  const { data, content } = matter(fs.readFileSync(path.join(dir, file), "utf8"));
  for (const field of ["title", "date", "summary"] as const) {
    if (typeof data[field] !== "string" || !data[field]) {
      throw new Error(`content/notes/${file} is missing "${field}" in its frontmatter`);
    }
  }
  const words = content.trim().split(/\s+/).length;
  return {
    slug: file.replace(/\.mdx$/, ""),
    title: data.title,
    date: data.date,
    summary: data.summary,
    draft: data.draft === true,
    readingMinutes: Math.max(1, Math.round(words / 220)),
    content,
  };
}

export function getAllNotes(opts: Options = {}): NoteMeta[] {
  const dir = opts.dir ?? NOTES_DIR;
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".mdx"))
    .map((f) => readNote(dir, f))
    .filter((n) => !n.draft || showDrafts(opts.includeDrafts))
    .sort((a, b) => b.date.localeCompare(a.date))
    .map((n) => {
      const { content, ...meta } = n;
      void content;
      return meta;
    });
}

export function getNote(slug: string, opts: Options = {}): Note | null {
  const dir = opts.dir ?? NOTES_DIR;
  const file = `${slug}.mdx`;
  if (!/^[a-z0-9-]+$/.test(slug) || !fs.existsSync(path.join(dir, file))) return null;
  const note = readNote(dir, file);
  return note.draft && !showDrafts(opts.includeDrafts) ? null : note;
}

/** Metadata for /notes/. While nothing is published, keep the empty page out of search results. */
export function notesIndexMetadata(publishedCount: number): Metadata {
  const base = pageMetadata({
    title: "Notes",
    description: "Occasional write-ups on projects, data, and building things.",
    path: "/notes/",
  });
  return publishedCount > 0 ? base : { ...base, robots: { index: false, follow: true } };
}
