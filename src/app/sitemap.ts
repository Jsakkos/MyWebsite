import type { MetadataRoute } from "next";
import { getAllNotes, type NoteMeta } from "@/lib/notes";
import { SITE_URL } from "@/lib/metadata";
import { STORIES_PATH, storiesAvailable } from "@/lib/caltrain-stories";

const STATIC_ROUTES: { path: string; priority: number; changeFrequency: "weekly" | "monthly" | "yearly" | "daily" }[] = [
  { path: "/", priority: 1, changeFrequency: "monthly" },
  { path: "/work/", priority: 0.9, changeFrequency: "monthly" },
  { path: "/resume/", priority: 0.8, changeFrequency: "monthly" },
  { path: "/projects/", priority: 0.8, changeFrequency: "monthly" },
  { path: "/projects/caltrain-tracker/", priority: 0.7, changeFrequency: "monthly" },
  { path: "/projects/caltrain-tracker/dashboard/", priority: 0.7, changeFrequency: "daily" },
  { path: "/publications/", priority: 0.7, changeFrequency: "yearly" },
  { path: "/contact/", priority: 0.5, changeFrequency: "yearly" },
];

export function buildSitemap(notes: NoteMeta[]): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = STATIC_ROUTES.map((r) => ({
    url: `${SITE_URL}${r.path}`,
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }));
  if (storiesAvailable()) {
    entries.push({ url: `${SITE_URL}${STORIES_PATH}`, changeFrequency: "daily", priority: 0.7 });
  }
  if (notes.length > 0) {
    entries.push({ url: `${SITE_URL}/notes/`, changeFrequency: "monthly", priority: 0.6 });
    for (const n of notes) {
      entries.push({ url: `${SITE_URL}/notes/${n.slug}/`, lastModified: n.date, changeFrequency: "yearly", priority: 0.5 });
    }
  }
  return entries;
}

export default function sitemap(): MetadataRoute.Sitemap {
  return buildSitemap(getAllNotes());
}
