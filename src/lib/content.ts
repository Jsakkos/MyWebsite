import fs from "node:fs";
import path from "node:path";
import { z } from "zod";

const yearMonth = z.string().regex(/^\d{4}-\d{2}$/, "expected YYYY-MM");
const link = z.object({
  label: z.string().min(1),
  url: z.string().regex(/^(https?:\/\/|\/)/, "absolute URL or site path"),
});

export const profileSchema = z.object({
  basics: z.object({
    name: z.string().min(1),
    label: z.string().min(1),
    throughline: z.string().min(1),
    accent: z.string().min(1),
    intro: z.array(z.string().min(1)).min(1),
    offTheClock: z.string().min(1),
    location: z.string().min(1),
    email: z.string().email(),
    url: z.string().url(),
    image: z.string().startsWith("/"),
    imageCredit: z.string().min(1),
    profiles: z.array(
      z.object({
        network: z.enum(["GitHub", "LinkedIn", "Google Scholar", "ORCID"]),
        url: z.string().url(),
        username: z.string().optional(),
      }),
    ),
  }),
  columns: z.object({
    now: z.string().min(1),
    before: z.array(z.string().min(1)).min(1),
    onTheSide: z.array(z.string().min(1)).min(1),
  }),
  pillars: z
    .array(z.object({ title: z.string(), claim: z.string(), proof: z.array(z.string()).min(1) }))
    .length(4),
  work: z
    .array(
      z.object({
        organization: z.string().min(1),
        position: z.string().min(1),
        location: z.string().min(1),
        startDate: yearMonth,
        endDate: yearMonth.optional(),
        summary: z.string().min(1),
        highlights: z.array(z.string().min(1)),
        url: z.string().url().optional(),
      }),
    )
    .min(1),
  education: z.array(
    z.object({
      institution: z.string(),
      studyType: z.string(),
      area: z.string(),
      location: z.string(),
      startYear: z.number().int(),
      endYear: z.number().int(),
      thesis: z.string().optional(),
    }),
  ),
  projects: z.array(
    z.object({
      slug: z.string().regex(/^[a-z0-9-]+$/),
      name: z.string().min(1),
      group: z.enum(["software", "data", "hardware", "research"]),
      pitch: z.string().min(1),
      stack: z.array(z.string()),
      years: z.string().min(1),
      links: z.array(link),
      featured: z.boolean().optional(),
    }),
  ),
  publications: z.array(
    z.object({
      title: z.string().min(1),
      authors: z.array(z.string().min(1)).min(1),
      venue: z.string().min(1),
      year: z.number().int(),
      doi: z.string().regex(/^10\.\d{4,}\//, "bare DOI, e.g. 10.1021/abc"),
      note: z.string().optional(),
    }),
  ),
  patents: z.array(
    z.object({ title: z.string(), authors: z.array(z.string()), number: z.string(), year: z.number().int() }),
  ),
  talks: z.array(
    z.object({
      year: z.number().int(),
      kind: z.string(),
      event: z.string(),
      location: z.string(),
      title: z.string().optional(),
    }),
  ),
  honors: z.array(z.object({ year: z.string(), title: z.string(), org: z.string() })),
  service: z.array(z.string().min(1)),
});

export type Profile = z.infer<typeof profileSchema>;
export type Project = Profile["projects"][number];
export type Publication = Profile["publications"][number];
export type WorkEntry = Profile["work"][number];

const PROFILE_PATH = path.join(process.cwd(), "content", "profile.json");
let cached: Profile | null = null;

export function getProfile(): Profile {
  if (cached) return cached;
  const raw = JSON.parse(fs.readFileSync(PROFILE_PATH, "utf8"));
  const parsed = profileSchema.safeParse(raw);
  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((i) => `  - ${i.path.join(".")}: ${i.message}`)
      .join("\n");
    throw new Error(`content/profile.json is invalid:\n${issues}`);
  }
  cached = parsed.data;
  return cached;
}

export function getFeaturedProjects(): Project[] {
  return getProfile().projects.filter((p) => p.featured);
}

export function getRecentPublications(n: number): Publication[] {
  return [...getProfile().publications].sort((a, b) => b.year - a.year).slice(0, n);
}
