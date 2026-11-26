# jonathanksakkos.com Overhaul Implementation Plan

<!-- content-check: allow-examples (the test examples below are fake codes and amounts) -->

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the site in the "Field notes" design with one public-safe content file, working Notes, a current resume, and every bug from the review fixed.

**Architecture:** Same Next.js 16 App Router app. Career facts move from `public/resume.json` into `content/profile.json`, validated by a zod schema and read through `src/lib/content.ts`; prose lives in MDX under `content/notes/`. Design tokens are CSS variables declared once in `globals.css` and exposed to Tailwind v4 with `@theme inline`; every component, including the Caltrain dashboard, styles through them. A `prebuild` script blocks internal terms from the public repo.

**Tech Stack:** Next.js 16, React 19, TypeScript, Tailwind CSS v4 + `@tailwindcss/typography`, next-themes, next-mdx-remote, gray-matter, zod, Recharts, lucide-react, Vitest. Netlify.

**Spec:** `docs/superpowers/specs/2026-11-25-website-overhaul-design.md`

## Global Constraints

- The repo is **public**. Nothing committed may contain internal project codes, document numbers, customer or vendor names, dollar figures, review content, private repo names, family or pet names, homelab hostnames, or the name of Jonathan's photography portfolio site. This includes code comments, tests, commit messages and this plan's follow-ups.
- Content facts come only from Jonathan's private career notes (the Master Resume, the public-safe LinkedIn draft for default wording, the sources-and-gaps log, and the public-vs-internal rules), plus public repo READMEs. The private notes are read-only.
- Internal metrics are written as "multi-fold capacity" and "several times faster". Never the exact multiples, hours or minutes.
- Typeface: Newsreader (display, headings, accent italics), Inter (body, UI), IBM Plex Mono (data figures only). Fraunces is banned.
- Light tokens: paper `#fbf8f1`, ink `#23201b`, ink-2 `#4a453c`, muted `#5d574c`, rule `#e3dccd`, accent `#2f6b4f`. Dark tokens are warm counterparts; every text/background pair passes WCAG AA (4.5:1 body, 3:1 large text and UI).
- Nav order: Work · Projects · Papers · Notes · Contact. Wordmark "Jonathan Sakkos".
- Caltrain: don't change numbers, the export format, `public/data/caltrain/*`, or incident labeling. The homepage on-time figure carries the label "all stops, unadjusted".
- Surviving URLs stay: `/projects`, `/projects/caltrain-tracker`, `/projects/caltrain-tracker/dashboard`, `/publications`, `/contact`. `trailingSlash: true` stays.
- No build step may depend on a network call without a fallback (`next/font/google` is the one accepted exception).
- No `alert()`, no gradients, no decorative stock icons.

## Review Focus

1. **Dark mode contrast:** a token pair that looks fine in light mode but fails AA in dark, especially muted text and the Caltrain chart axes. Pinned by `tokens.test.ts` in Task 3.
2. **Old links:** bookmarks and search results for `/about`, `/experience`, `/blog/welcome-to-my-new-site`, `/files/SakkosCV.pdf` and Hugo-era paths should land on the right new page, not a 404. Pinned by `redirects.test.ts` (Task 3) and a curl check in Task 11.
3. **Internal terms sneaking in:** a spaced code ("PLC 1234"), mixed case, inside MDX, or in a JSON file under `public/`. Pinned by `check-public-content.test.ts` (Task 2).
4. **Missing or malformed Caltrain stats at build:** the homepage must still build and simply omit the card's figures. Pinned by `caltrain-snapshot.test.ts` (Task 5).
5. **Narrow phones (320–375 px):** no horizontal scroll on any page, including the papers list and the Caltrain heatmaps. Pinned by the overflow check in Task 11.

---

## File Structure

| Path | Responsibility |
|---|---|
| `content/profile.json` | All public career data (created in Task 1; replaces `public/resume.json`) |
| `content/notes/*.mdx` | Notes posts (replaces `content/posts/`) |
| `src/lib/content.ts` | zod schema, `Profile` types, `getProfile()` and small selectors |
| `src/lib/format.ts` | Date ranges, DOI URLs, author highlighting |
| `src/lib/notes.ts` | Notes loader (replaces `src/lib/blog.ts`) |
| `src/lib/caltrain-snapshot.ts` | Build-time read of `stats.json` for the home card |
| `src/lib/redirects.ts` | Redirect table consumed by `next.config.ts` |
| `src/lib/metadata.ts` | `pageMetadata()` helper, site constants derived from the profile |
| `src/lib/contact.ts` | `submitContact()` Formspree call |
| `scripts/check-public-content.mjs` | Confidentiality check (CLI + exported functions) |
| `.content-denylist` | Local, gitignored named terms (never committed) |
| `src/app/globals.css` | Tokens (light/dark), `@theme inline`, typography plugin, print rules |
| `src/components/site-header.tsx`, `theme-toggle.tsx`, `site-footer.tsx` | Shell |
| `src/components/caltrain/palette.ts` | Single source for Caltrain chart colors and the performance ramp |
| `src/components/caltrain-snapshot.tsx` | Home and write-up card (server component) |
| `src/app/{page,work,resume,projects,publications,notes,contact}/…` | Pages |
| `tests/**/*.test.ts` | Vitest unit tests |

Delete: `src/app/about/`, `src/app/experience/`, `src/app/blog/`, `src/components/navigation.tsx`, `src/components/footer.tsx`, `src/components/caltrain-dashboard.tsx`, `src/lib/blog.ts`, `src/lib/resume.ts`, `public/resume.json`, `content/posts/`, `tailwind.config.ts`, `public/{next,vercel,file,globe,window}.svg`, `public/projects/`, `public/avatar.jpg`, `public/files/SakkosCV.pdf`, `scripts/export_to_website.py` (stale copy; the live one is in caltrain-tracker).

---

### Task 1: Test harness and content layer

**Files:**
- Modify: `package.json` (add `zod`; dev: `vitest`; script `"test": "vitest run"`)
- Create: `vitest.config.ts` (node environment, `@` alias to `src`)
- Create: `src/lib/content.ts`, `content/profile.json`
- Test: `tests/lib/content.test.ts`

**Interfaces:**
- Produces:
  - `type Profile` (zod-inferred) with keys `basics`, `columns`, `pillars`, `work`, `education`, `projects`, `publications`, `patents`, `talks`, `honors`, `service`.
  - `basics: { name, label, throughline, accent /* phrase inside throughline rendered in green italics */, intro: string[], offTheClock, location, email, url, image, imageCredit, profiles: { network: "GitHub"|"LinkedIn"|"Google Scholar"|"ORCID"; url; username? }[] }`
  - `columns: { now: string; before: string[]; onTheSide: string[] }`
  - `pillars: { title; claim; proof: string[] }[]` (exactly 4)
  - `work: { organization; position; location; startDate /* YYYY-MM */; endDate?; summary; highlights: string[]; url? }[]` (newest first; Curio's two titles are two entries)
  - `education: { institution; studyType; area; location; startDate; endDate; thesis? }[]`
  - `projects: { slug; name; group: "software"|"data"|"hardware"|"research"; pitch; stack: string[]; years; links: { label; url }[]; featured?: boolean }[]`
  - `publications: { title; authors: string[]; venue; year: number; doi /* bare, e.g. "10.1021/acssynbio.1c00035" */; note? }[]` (exactly 15 peer-reviewed)
  - `patents: { title; authors: string[]; number; year }[]`, `talks: { year; kind; event; location; title? }[]`, `honors: { year; title; org }[]`, `service: string[]`
  - `getProfile(): Profile` (reads `content/profile.json` once, validates, caches; throws a readable error listing zod issues)
  - `getFeaturedProjects(): Profile["projects"]`, `getRecentPublications(n: number): Profile["publications"]` (sorted by year desc, stable)

- [ ] **Step 1: Write the failing tests**

```ts
// tests/lib/content.test.ts
import { getProfile, getRecentPublications, getFeaturedProjects, profileSchema } from "@/lib/content";
test("profile validates and has the public-safe essentials", () => {
  const p = getProfile();
  expect(p.basics.name).toBe("Jonathan K. Sakkos");
  expect(p.basics.label).toBe("Staff Engineer, Spatial Genomics R&D");
  expect(p.basics.throughline).toBe("I turn biology into products by building the instruments, software, and processes in between.");
  expect(p.basics.throughline).toContain(p.basics.accent);
  expect(p.pillars).toHaveLength(4);
  expect(p.publications).toHaveLength(15);
  expect(p.work[0].organization).toBe("Takara Bio USA, Inc.");
  expect(p.work[0].endDate).toBeUndefined();
});
test("DOIs are bare and match Crossref-verified values", () => {
  const dois = getProfile().publications.map((x) => x.doi);
  dois.forEach((d) => expect(d).toMatch(/^10\.\d{4,}\//));
  expect(dois).toContain("10.1021/acssynbio.2c00527");
  expect(dois).toContain("10.1021/acs.jpca.2c02179");
  expect(dois).toContain("10.1021/acsami.7b06791");
  expect(dois).toContain("10.1002/bit.25821");
  expect(dois).toContain("10.17912/micropub.biology.001097");
});
test("recent publications are newest first", () => {
  const r = getRecentPublications(3);
  expect(r).toHaveLength(3);
  expect(r[0].year).toBeGreaterThanOrEqual(r[2].year);
});
test("featured projects lead with Engram", () => {
  expect(getFeaturedProjects()[0].slug).toBe("engram");
});
test("schema rejects a publication with a URL in the doi field", () => {
  const bad = structuredClone(getProfile());
  bad.publications[0].doi = "https://doi.org/10.1/x";
  expect(profileSchema.safeParse(bad).success).toBe(false);
});
```

- [ ] **Step 2: Run `npm test` and confirm it fails** (module not found).

- [ ] **Step 3: Implement `src/lib/content.ts`** with the schema above (`doi: z.string().regex(/^10\.\d{4,}\//)`, `startDate: z.string().regex(/^\d{4}-\d{2}$/)`), exported as `profileSchema`.

- [ ] **Step 4: Author `content/profile.json`** from the private career notes, applying the Global Constraints. Specifics:
  - `throughline` and pillar claims from the LinkedIn draft; `accent`: `"the instruments, software, and processes in between"`.
  - `intro`: two short first-person paragraphs adapted from LinkedIn's About; `offTheClock`: open-source tools, photography, cooking, a self-hosted homelab, and the bike-plus-Caltrain commute. No link for photography.
  - Takara highlights: LinkedIn's public-safe bullets with "multi-fold capacity" / "several times faster"; name the Trekker® FX kit and its The Scientist 2026 Top Innovations award.
  - Work entries back to Columbia Steel Casting (2007–2012, intern and engineer as one entry) and County of Sonoma (2006).
  - Publications: all 15 from Master Resume §7 with authors as arrays (`"Sakkos JK"` form); patents §8; talks §9 **academic only**; honors §10; `service`: "Mentored 16 students (7 graduate, 9 undergraduate)…" without names, the 2021 iGEM advising, the 2016 r/Science AMA.
  - Projects: engram (featured, first), caltrain-tracker (featured), photosift, lr-autotag, mkv-episode-matcher, airiq, cat-wheel-speedometer, nufeb (tools + contributions), microtools. Public repos only; links verified against `gh repo list Jsakkos`.
  - `image`: `/headshot.jpg`; `imageCredit`: `"Photo: Anne-Claire Brun"`. Copy the 2020 headshot to `public/headshot.jpg`.

- [ ] **Step 5: Run `npm test`; all five pass.**

- [ ] **Step 6: Commit** `feat: add validated public content layer` (stage `package.json`, `package-lock.json`, `vitest.config.ts`, `src/lib/content.ts`, `content/profile.json`, `public/headshot.jpg`, the test).

---

### Task 2: Confidentiality check

**Files:**
- Create: `scripts/check-public-content.mjs`, `.content-denylist` (local only)
- Modify: `.gitignore` (add `.content-denylist`), `package.json` (`"check:content": "node scripts/check-public-content.mjs"`; the `prebuild` hook is added in Task 7, once `public/resume.json` is gone)
- Test: `tests/scripts/check-public-content.test.ts`

**Interfaces:**
- Produces (named exports of the `.mjs`):
  - `GENERIC_PATTERNS: { name: string; regex: RegExp }[]`: project code `/\bPLC\s?\d{3,4}\b/i`, `/\bPMT\s?\d{3,4}\b/i`, `/\bQR-\d+\b/i`, `/\bCAPA\b/`, dollar amounts `/\$\s?\d/`.
  - `loadNamedTerms(file = ".content-denylist"): string[] | null`: one term per line, `#` comments; `null` when the file is missing.
  - `findViolations(text: string, file: string, named: string[]): { file; line; match; rule }[]`: named terms match case-insensitively on word boundaries.
  - `scanRepo(root: string): { violations; warnings: string[] }`: scans `content/**/*.{json,md,mdx}` and `public/**/*.json` except `public/data/caltrain/**`; adds a violation if `public/resume.json` exists; a warning if the denylist file is missing.
  - CLI: prints each violation as `file:line rule "match"`, prints warnings, exits 1 on any violation.

- [ ] **Step 1: Write the failing tests** (use made-up terms only, e.g. `"Acme Labs"`)

```ts
test("flags spaced and unspaced project codes", () => {
  expect(findViolations("PLC 1234 and plc5678", "x.mdx", [])).toHaveLength(2);
});
test("flags dollar amounts and CAPA", () => {
  expect(findViolations("saved $99K\nclosed the CAPA", "x.json", []).map(v => v.line)).toEqual([1, 2]);
});
test("named terms are case-insensitive whole words", () => {
  expect(findViolations("worked with ACME LABS", "x", ["Acme Labs"])).toHaveLength(1);
  expect(findViolations("acmelabsville", "x", ["Acme Labs"])).toHaveLength(0);
});
test("public/resume.json is always a violation", () => { /* temp dir fixture with public/resume.json → violations.length === 1 */ });
test("missing denylist warns but generic patterns still run", () => { /* temp dir without .content-denylist, content file with "PMT9999" → 1 violation, 1 warning */ });
test("caltrain data is not scanned", () => { /* temp dir: public/data/caltrain/x.json containing "$5" → 0 violations */ });
```

- [ ] **Step 2: Run `npm test -- check-public-content`; expect failures.**
- [ ] **Step 3: Implement the script** to the interface above. The script must contain no real named terms.
- [ ] **Step 4: Create `.content-denylist` locally** from the public-vs-internal rules (customer and vendor names, the portfolio site's name). Confirm `git status` does not list it.
- [ ] **Step 5: Run `npm test` (all pass) and `npm run check:content`.** Expected: exactly one violation, the still-present `public/resume.json`, which the old homepage and projects page read until Tasks 5 and 7.
- [ ] **Step 6: Commit** `feat: block internal terms from public content`.

---

### Task 3: Design system, shell, redirects

**Files:**
- Modify: `src/app/globals.css`, `src/app/layout.tsx`, `next.config.ts`, `netlify.toml` (remove all `[[redirects]]`; keep headers)
- Modify: `package.json` (dev: `@tailwindcss/typography`)
- Create: `src/components/site-header.tsx`, `src/components/theme-toggle.tsx`, `src/components/site-footer.tsx`, `src/lib/nav.ts`, `src/lib/redirects.ts`, `src/lib/metadata.ts` (rewrite), `src/app/not-found.tsx`
- Delete: `tailwind.config.ts`, `src/components/navigation.tsx`, `src/components/footer.tsx`, starter SVGs
- Test: `tests/styles/tokens.test.ts`, `tests/lib/nav.test.ts`, `tests/lib/redirects.test.ts`

**Interfaces:**
- Consumes: `getProfile()` (Task 1).
- Produces:
  - CSS variables `--paper --paper-2 --ink --ink-2 --muted --rule --accent --accent-strong --ontime --minor --major --chart-grid --chart-axis`, declared in `:root` and `.dark`, exposed as Tailwind colors `paper`, `paper-2`, `ink`, `ink-2`, `muted`, `rule`, `accent`, `accent-strong`, `ontime`, `minor`, `major`; fonts `font-serif`, `font-sans`, `font-mono`.
  - `NAV_ITEMS: { label: string; href: string }[]` = Work `/work/`, Projects `/projects/`, Papers `/publications/`, Notes `/notes/`, Contact `/contact/`.
  - `isActivePath(pathname: string, href: string): boolean` (trailing-slash tolerant; `/projects/caltrain-tracker/` is active for `/projects/`; `/` is never active for others).
  - `REDIRECTS: { source: string; destination: string; permanent: true }[]`
  - `pageMetadata(opts: { title?: string; description?: string; path: string }): Metadata`, `SITE_URL = "https://www.jonathanksakkos.com"`.

- [ ] **Step 1: Write the failing tests**

```ts
// tokens.test.ts: parse :root and .dark blocks out of globals.css, compute WCAG contrast
const pairs = [["ink","paper"],["ink-2","paper"],["muted","paper"],["accent","paper"],["ink","paper-2"],["muted","paper-2"],["chart-axis","paper"]];
test.each(["light","dark"])("%s tokens pass AA", (mode) => {
  for (const [fg, bg] of pairs) expect(contrast(tokens[mode][fg], tokens[mode][bg])).toBeGreaterThanOrEqual(4.5);
});
test("light tokens match the spec", () => {
  expect(tokens.light).toMatchObject({ paper: "#fbf8f1", ink: "#23201b", "ink-2": "#4a453c", muted: "#5d574c", rule: "#e3dccd", accent: "#2f6b4f" });
});
// nav.test.ts
test("nav order", () => expect(NAV_ITEMS.map(i => i.label)).toEqual(["Work","Projects","Papers","Notes","Contact"]));
test("nested routes activate their section", () => {
  expect(isActivePath("/projects/caltrain-tracker/dashboard/", "/projects/")).toBe(true);
  expect(isActivePath("/work", "/work/")).toBe(true);
  expect(isActivePath("/", "/work/")).toBe(false);
});
// redirects.test.ts
const to = (s: string) => REDIRECTS.find(r => r.source === s)?.destination;
test("retired pages", () => {
  expect(to("/about")).toBe("/work/");
  expect(to("/experience")).toBe("/work/");
  expect(to("/blog")).toBe("/notes/");
  expect(to("/blog/:slug*")).toBe("/notes/:slug*");
  expect(to("/files/SakkosCV.pdf")).toBe("/files/jonathan-sakkos-resume.pdf");
  expect(to("/files/cv.pdf")).toBe("/files/jonathan-sakkos-resume.pdf");
});
test("hugo-era paths no longer point at retired pages", () => {
  for (const r of REDIRECTS) expect(r.destination).not.toMatch(/^\/(about|experience|blog)\b/);
  expect(to("/author/:path*")).toBe("/work/");
  expect(to("/post/:path*")).toBe("/notes/");
});
```

The Hugo-era set to carry over from `netlify.toml`: `/author/*`, `/authors/*`, `/courses/*` → `/work/`; `/publication/*`, `/talk/*`, `/slides/*` → `/publications/`; `/project/*` → `/projects/`; `/home/*` → `/`; `/post/*` → `/notes/`.

- [ ] **Step 2: Run `npm test`; the three new files fail.**
- [ ] **Step 3: Rewrite `globals.css`:** `@import "tailwindcss"; @plugin "@tailwindcss/typography"; @custom-variant dark (&:where(.dark, .dark *));`, the light tokens from Global Constraints, warm dark tokens chosen to pass the test, `@theme inline` mapping, base body styles (paper background, ink text, `font-sans`), `prefers-reduced-motion`, and `@media print` (hide `header`, `footer`, `[data-print-hide]`; white background).
- [ ] **Step 4: Implement `nav.ts`, `redirects.ts`; wire `REDIRECTS` into `next.config.ts` `redirects()`; remove the `[[redirects]]` blocks from `netlify.toml`.**
- [ ] **Step 5: Rewrite `layout.tsx`:** `next/font/google` Newsreader (weights 400 and 600, normal and italic, `opsz` axis), Inter, IBM_Plex_Mono (400, 500) as CSS variables; `metadataBase: new URL(SITE_URL)`; default title `"Jonathan Sakkos · Staff Engineer, Spatial Genomics R&D"` with template `"%s · Jonathan Sakkos"`; description from `basics.throughline`. ThemeProvider (`attribute="class"`, `defaultTheme="system"`, `enableSystem`, `disableTransitionOnChange`), then SiteHeader, `<main id="main">`, SiteFooter. Add a skip link to `#main`.
- [ ] **Step 6: Build the shell components.**
  - **SiteHeader:** sticky, `bg-paper/90` with backdrop blur, bottom rule; serif wordmark; nav with `aria-current="page"` from `isActivePath`.
  - **Mobile menu** (below `md`): toggle button with `aria-expanded` and `aria-controls`; closes on Escape, on route change and on link click; focus returns to the toggle.
  - **ThemeToggle:** uses `resolvedTheme`; renders a fixed-size placeholder until mounted so there's no hydration mismatch; `aria-label` "Switch to dark theme" or "Switch to light theme".
  - **SiteFooter:** profile links from `basics.profiles` and email, `basics.imageCredit`, © year.
  - **not-found.tsx:** in the Field notes style, with links home, to Work and to Projects.
- [ ] **Step 7: Rewrite `metadata.ts`** (`pageMetadata` sets title, description, canonical `SITE_URL + path`, Open Graph and Twitter with `/og-image.png`).
- [ ] **Step 8: Run `npm test` (pass), `npm run lint` (no errors), `npm run build` (succeeds; old pages may still render unstyled until their tasks).**
- [ ] **Step 9: Commit** `feat: field notes design tokens, site shell, redirects`.

---

### Task 4: Formatting helpers

**Files:** Create `src/lib/format.ts`; Test `tests/lib/format.test.ts`

**Interfaces:**
- Produces: `formatDateRange(start: string, end?: string): string`, `doiUrl(doi: string): string`, `splitAuthors(authors: string[]): { name: string; self: boolean }[]` (self when the name contains "Sakkos"), `formatYearMonth(ym: string): string`.

- [ ] **Step 1: Write the failing tests**

```ts
expect(formatDateRange("2025-01")).toBe("Jan 2025 – present");
expect(formatDateRange("2022-10", "2023-12")).toBe("Oct 2022 – Dec 2023");
expect(doiUrl("10.1021/acssynbio.1c00035")).toBe("https://doi.org/10.1021/acssynbio.1c00035");
expect(doiUrl("doi:10.1/x")).toBe("https://doi.org/10.1/x");
expect(doiUrl("https://doi.org/10.1/x")).toBe("https://doi.org/10.1/x"); // the old double-prefix bug
expect(splitAuthors(["Yun L", "Sakkos JK", "Ducat DC"]).filter(a => a.self).map(a => a.name)).toEqual(["Sakkos JK"]);
```

- [ ] **Step 2: Run, see failures. Step 3: Implement** (month names fixed in English; en dash; no `Date` parsing, to avoid timezone shifts). **Step 4: Run, pass. Step 5: Commit** `feat: date, DOI and author formatting helpers`.

---

### Task 5: Home page and Caltrain snapshot

**Files:**
- Create: `src/lib/caltrain-snapshot.ts`, `src/components/caltrain-snapshot.tsx`
- Modify: `src/app/page.tsx` (rewrite)
- Test: `tests/lib/caltrain-snapshot.test.ts`
- (`src/components/caltrain-dashboard.tsx` stays until Task 8; the write-up page still imports it.)

**Interfaces:**
- Consumes: `getProfile`, `getFeaturedProjects`, `getRecentPublications` (Task 1); `doiUrl`, `splitAuthors` (Task 4).
- Produces: `getCaltrainSnapshot(file?: string): { onTimePct: string; arrivals: string; days: number; since: string; label: "all stops, unadjusted" } | null`. The default file is `public/data/caltrain/stats.json`; returns `null` on a missing file, bad JSON, or missing fields. `<CaltrainSnapshot variant="card" | "inline" />` is a server component.

- [ ] **Step 1: Write the failing tests**

```ts
test("formats the real stats file", () => {
  const s = getCaltrainSnapshot()!;
  expect(s.onTimePct).toMatch(/^\d{2}\.\d%$/);
  expect(s.arrivals).toMatch(/^\d{1,3}(,\d{3})+$/);
  expect(s.label).toBe("all stops, unadjusted");
});
test("missing or malformed file → null", () => {
  expect(getCaltrainSnapshot("does/not/exist.json")).toBeNull();
  // temp file containing "{" → null; temp file {} → null
});
```

- [ ] **Step 2: Run, fail. Step 3: Implement** (`fs.readFileSync` in try/catch; one decimal for the percentage; `toLocaleString("en-US")`; `since` = `date_range.start` as "Aug 2025" via `formatYearMonth`).
- [ ] **Step 4: Build the home page** in the spec §8 order. Layout and values:
  - **Hero:** the `throughline` as `h1` in serif at about 40–48 px desktop, with `accent` wrapped in `<em className="text-accent">`.
  - **Intro and links:** the `intro` paragraphs and `offTheClock`; a 160 px round headshot; links to Resume (`/resume/`), Email, GitHub, LinkedIn, Scholar.
  - **Now / Before / On the side:** three columns with italic serif green labels, separated by a top rule.
  - **Selected work:**
    1. Takara, from `work[0]` plus two pillar proof points, linking to `/work/`.
    2. Engram, from projects.
    3. Caltrain, with `<CaltrainSnapshot variant="card" />` (on-time figure, its label in small muted text, arrivals, days), linking to the dashboard.
  - **Recent papers:** three entries, each title linking to `doiUrl`, then "All 15 papers →".
  - No boxed cards: use thin rules and whitespace.
- [ ] **Step 5: Run `npm test`, `npm run build`; then view `/` in light and dark at 1280 and 375 wide** (Playwright or the browser pane). Expect no horizontal scroll and no default blue.
- [ ] **Step 6: Commit** `feat: field notes homepage with Caltrain snapshot`.

---

### Task 6: Work and Resume pages

**Files:**
- Create: `src/app/work/page.tsx`, `src/app/resume/page.tsx`, `public/files/jonathan-sakkos-resume.pdf`
- Delete: `src/app/about/`, `src/app/experience/`, `public/files/SakkosCV.pdf`, `public/avatar.jpg`

**Interfaces:** Consumes `getProfile`, `formatDateRange`, `pageMetadata`.

- [ ] **Step 1: `/work`:**
  - Open with the path narrative: 2–3 first-person paragraphs written from `work` and `education` and covering steel castings, the PhD, the postdoc, Curio and Takara. Every fact must come from the profile.
  - Then the four pillars (title, claim, proof bullets) and the role timeline (organization, position, dates, location, summary, highlights).
  - Then education with thesis, honors, and `service`.
  - End with "Download resume (PDF)" and a "View as a page" link to `/resume/`.
- [ ] **Step 2: `/resume`:**
  - A compact one-column resume: name, label, contact line, summary (the throughline plus one sentence), then experience (positions and two to four highlights each), education, selected skills (the pillar titles), and publication and patent counts with a link to the site.
  - Mark the site chrome `data-print-hide`.
  - It must print on US Letter in **at most 2 pages** in light colors.
  - Add a "Print or save as PDF" button (client island calling `window.print()`) marked `data-print-hide`.
- [ ] **Step 3: Generate the PDF:**
  - Run `npm run build && npm start`.
  - Render `http://localhost:3000/resume/` to PDF with headless Chromium (Playwright `page.pdf({ format: "Letter", printBackground: false })`).
  - Save it as `public/files/jonathan-sakkos-resume.pdf`.
  - Open it and check it has at most 2 pages, the right fonts, and no nav.
- [ ] **Step 4: Verify** `npm run build`, then view `/work/` (light, dark, 375 px) and `/resume/` in the browser's print preview.
- [ ] **Step 5: Commit** `feat: work page and printable resume`.

---

### Task 7: Projects page

**Files:** Modify `src/app/projects/page.tsx` (rewrite)

- [ ] **Step 1:** Group by `group`: Software, Data, Hardware, Research tools.
  - **Group order:** within Software, `featured` first, then in file order.
  - **Each project:** serif name, one-line `pitch`, `years`, a stack line in muted mono-small text, and links (repo, PyPI, write-up).
  - **Caltrain:** links to `/projects/caltrain-tracker/` and to the dashboard.
  - No images and no tag-chip clutter.
- [ ] **Step 2: Retire the old data file:**
  - Delete `public/resume.json` and `src/lib/resume.ts`; nothing imports them after this task.
  - Add `"prebuild": "npm run check:content"` to `package.json`.
  - `npm run check:content` now passes with zero violations.
- [ ] **Step 3: Verify** `npm run build` (the prebuild check runs first and passes); view at 1280 and 375 wide in both themes; check every outbound link returns 200 (`curl -sI` each URL).
- [ ] **Step 4: Commit** `feat: projects page; retire public resume.json`.

---

### Task 8: Caltrain restyle and write-up

**Files:**
- Create: `src/components/caltrain/palette.ts`
- Modify: every file in `src/components/caltrain/`, `src/app/projects/caltrain-tracker/page.tsx` (rewrite copy), `src/app/projects/caltrain-tracker/dashboard/page.tsx`
- Delete: `src/components/caltrain-dashboard.tsx` (replaced by `CaltrainSnapshot` from Task 5)
- Test: `tests/components/caltrain-palette.test.ts`

**Interfaces:**
- Produces:
  - `CHART = { grid: "var(--chart-grid)", axis: "var(--chart-axis)", ontime: "var(--ontime)", minor: "var(--minor)", major: "var(--major)", tooltipBg: "var(--paper)", tooltipBorder: "var(--rule)" }`
  - `COMMUTE_COLORS: Record<string, string>`, four distinguishable token-friendly hues
  - `performanceColor(pct: number): string`: one ramp, replacing the duplicated `getColor` in `heatmap.tsx` and `calendar-heatmap.tsx`

- [ ] **Step 1: Write the failing test**

```ts
expect(performanceColor(97)).toBe(performanceColor(95));   // top band
expect(performanceColor(94)).not.toBe(performanceColor(96));
expect(performanceColor(10)).toBe(performanceColor(59));    // bottom band
expect(new Set([95,90,85,80,75,70,60,0].map(performanceColor)).size).toBe(8);
```

- [ ] **Step 2: Run, fail. Step 3: Implement `palette.ts`:** eight bands from accent green through amber to the `major` red, readable on both paper colors.
- [ ] **Step 4: Restyle the components through tokens:**
  - Replace `gray-*`, `blue-*`, `emerald-*`, `amber-*` and `red-*` classes with token classes.
  - Replace hex strings in the Recharts props with `CHART` values.
  - Hero: the blue gradient becomes a `paper-2` panel with ink text and the big figure in `font-mono` accent, with the "all stops, unadjusted" label under it.
  - Keep every number and component; don't change data handling.
- [ ] **Step 5: Rewrite the write-up page** from `caltrain-tracker` `origin/main` `README.md` and `DATA.md`:
  - current pipeline
  - what's measured and how arrival is detected
  - the on-time definition
  - the caveat paragraph from spec §8
  - "Stories from the data: coming"
  
  Use `<CaltrainSnapshot variant="inline" />`. Remove the FastAPI, PostgreSQL and REST API claims and the `/api/caltrain/docs` link.
- [ ] **Step 6: Verify** `npm test`; `npm run build`; then view the dashboard in light and dark at 1280 and 375. Check the axes and grid are visible in dark, the heatmaps don't overflow, and the Marey section still renders.
- [ ] **Step 7: Commit** `feat: restyle Caltrain dashboard and correct the write-up`.

---

### Task 9: Papers page

**Files:** Modify `src/app/publications/page.tsx` (rewrite)

- [ ] **Step 1:** Title "Papers".
  - **Intro line:** "15 peer-reviewed papers, 3 patent applications", plus Scholar and ORCID links.
  - **Publications:** grouped by year, descending. Each entry has:
    - the title, linked to `doiUrl(doi)`
    - authors from `splitAuthors`, with self rendered in `<strong>`
    - venue in italics
    - `note` if present
  - **Then:** patents, then academic talks (year, kind, event, location).
- [ ] **Step 2: Verify** `npm run build`; `curl -sI` a sample of 5 DOI URLs returns 30x/200; view at 375 px with no overflow from long titles (`break-words`).
- [ ] **Step 3: Commit** `feat: papers page from the profile with verified DOIs`.

---

### Task 10: Notes

**Files:**
- Create: `src/lib/notes.ts`, `src/app/notes/page.tsx`, `src/app/notes/[slug]/page.tsx`, `content/notes/rebuilding-this-site.mdx`
- Modify: `mdx-components.tsx` (token styles or defer to `prose`)
- Delete: `src/lib/blog.ts`, `src/app/blog/`, `content/posts/`
- Test: `tests/lib/notes.test.ts`

**Interfaces:**
- Produces: `type NoteMeta = { slug; title; date /* YYYY-MM-DD */; summary; readingMinutes: number; draft: boolean }`, `getAllNotes(opts?: { includeDrafts?: boolean }): NoteMeta[]` (date desc; drafts excluded by default and always excluded when `NODE_ENV === "production"`), `getNote(slug: string): (NoteMeta & { content: string }) | null`, and in `src/lib/nav.ts` `navItemsFor(hasNotes: boolean)` (drops Notes when false). The layout passes `getAllNotes().length > 0`, so an all-draft Notes section never shows in production.

- [ ] **Step 1: Write the failing tests** against a fixtures dir (`tests/fixtures/notes/`, with one published and one `draft: true` note): sorted desc; drafts excluded by default; `getNote("nope")` → `null`; `readingMinutes` ≥ 1; a note missing `title` throws a clear error; `navItemsFor(false)` omits Notes and keeps the other four in order.
- [ ] **Step 2: Run, fail. Step 3: Implement** (gray-matter; directory injectable for tests).
- [ ] **Step 4: Pages:**
  - `/notes`: a list of title, date and summary, in the serif.
  - `/notes/[slug]`:
    - `generateStaticParams`, and `params: Promise<{ slug: string }>` awaited
    - `generateMetadata` via `pageMetadata`
    - `MDXRemote` inside `prose prose-lg dark:prose-invert`, with prose colors mapped to tokens via `prose-*` modifiers
- [ ] **Step 5: Draft `rebuilding-this-site.mdx`** (`draft: true`), about 600–900 words, first person, public facts only:
  - why the old site needed replacing
  - three directions and choosing "field notes"
  - the hunt for a serif whose J doesn't hook (Fraunces out, Newsreader in)
  - one source of truth for career facts
  - keeping a public repo free of internal detail
  - what's next (Caltrain stories)
  
  Jonathan edits it and flips `draft: false` before launch.
- [ ] **Step 6: Verify** `npm test`; `npm run build`. With drafts included locally (`NODE_ENV=development npm run dev`), `/notes/rebuilding-this-site/` renders with real heading and list styles in both themes.
- [ ] **Step 7: Commit** `feat: notes section with first draft post`.

---

### Task 11: Contact, SEO, docs, final verification

**Files:**
- Create: `src/lib/contact.ts`, `src/components/contact-form.tsx`, `public/og-image.png`, `scripts/og-image.html`
- Modify: `src/app/contact/page.tsx` (server page), `src/app/sitemap.ts`, `src/app/robots.ts`, `CLAUDE.md`, `README.md`
- Test: `tests/lib/contact.test.ts`, `tests/app/sitemap.test.ts`

**Interfaces:**
- Produces: `submitContact(data: { name: string; email: string; message: string }, fetchImpl = fetch): Promise<{ ok: true } | { ok: false; error: string }>` posting JSON to `https://formspree.io/f/mpqzbejw`.

- [ ] **Step 1: Write the failing tests**

```ts
test("ok response → ok", async () => {
  expect(await submitContact(valid, async () => new Response("{}", { status: 200 }))).toEqual({ ok: true });
});
test("non-ok and thrown fetch → friendly error", async () => {
  expect((await submitContact(valid, async () => new Response("", { status: 500 }))).ok).toBe(false);
  expect((await submitContact(valid, async () => { throw new Error("offline"); })).ok).toBe(false);
});
test("sitemap lists live routes and no retired ones", () => {
  const urls = sitemap().map(e => e.url);
  for (const p of ["/", "/work/", "/resume/", "/projects/", "/projects/caltrain-tracker/", "/projects/caltrain-tracker/dashboard/", "/publications/", "/notes/", "/contact/"])
    expect(urls).toContain(`https://www.jonathanksakkos.com${p}`);
  expect(urls.some(u => /\/(about|experience|blog)\//.test(u))).toBe(false);
});
```

- [ ] **Step 2: Run, fail. Step 3: Implement** `contact.ts`; the `sitemap.ts` (static routes plus published notes with their dates); `robots.ts` using `SITE_URL`.
- [ ] **Step 4: Contact page:** a short intro, `mailto:` email, profile links, and `<ContactForm />` (name, email, message, all required; inline success and error text in an `aria-live` region; no `alert()`).
- [ ] **Step 5: OG image:** `scripts/og-image.html` is a 1200×630 card (paper background, serif name, throughline, green accent). Screenshot it with headless Chromium to `public/og-image.png`.
- [ ] **Step 6: Docs:**
  - **`CLAUDE.md`:** document the content layer, `npm test`, `check:content` and the local denylist, how to regenerate `content/profile.json` from the private Master Resume (public-safe rules; the notes are read-only), how to regenerate the resume PDF and OG image, and the design tokens.
  - **Also in `CLAUDE.md`:** remove "public/resume.json is the source of truth".
  - **`README.md`:** the same in brief.
- [ ] **Step 7: Full verification:**
  - Run `npm test`, `npm run lint`, `npm run build`, all green.
  - Run `npm start`, then for each of `/about /experience /blog /blog/welcome-to-my-new-site /files/SakkosCV.pdf /post/x /author/x` run `curl -s -o /dev/null -w "%{http_code} %{redirect_url}\n" http://localhost:3000<path>`. Expect a 308 or 301 to the mapped destination; following it, `curl -L`, ends in 200.
  - For every page, at 320, 375 and 1280 wide in light and dark (Playwright), check `document.documentElement.scrollWidth <= window.innerWidth` and look at the screenshots.
  - Confirm the theme toggle switches on the first click when the OS is dark.
  - Confirm the mobile menu opens, closes on Escape, and returns focus.
  - Run `git grep -n -i -f .content-denylist` and expect no output. Also check `git log -p master..HEAD | grep -i -f .content-denylist` is empty.
- [ ] **Step 8: Commit** `feat: contact form, SEO, docs`.

---

## Handoff notes for Jonathan (not tasks)

- Edit and publish the first note (`draft: false`).
- Two of Jonathan's private notes still describe copying the notes' export to `public/resume.json`. Point them at `content/profile.json` and the public-safe regeneration instead.
- Next project: Caltrain stories.
