# jonathanksakkos.com overhaul: design

**Date:** 2026-11-25
**Status:** Approved by Jonathan, 2026-11-25
**Repo:** github.com/Jsakkos/MyWebsite (public; deployed by Netlify from `master`)

## 1. Intent

The site is the public face of Jonathan K. Sakkos, a Staff Engineer in Spatial Genomics R&D at Takara Bio USA. It serves three readers at once:

- **Someone sizing them up to hire.** They skim. Within about 30 seconds they should know what they do now, the arc that got them here (mechanical engineering, then engineered living materials, then synthetic biology, then spatial genomics), proof of impact, and where to get a resume.
- **Someone who might collaborate.** They want to see how they think and what they build: Engram, the Caltrain tracker, the hardware projects, the papers. They need an easy way to reach them.
- **Jonathan, for fun.** The site should feel like them, not like a template, and be something they enjoy adding to.

Today's site fails all three: it is a stock Tailwind starter with stale and contradictory facts, a broken blog, a 2022 academic CV, and their best work buried.

## 2. Goals

1. A homepage that answers the hiring question fast and the collaborator question on scroll, in Jonathan's own voice, built around the through-line from their LinkedIn draft: *"I turn biology into products by building the instruments, software, and processes in between."*
2. The "Field notes" look (chosen from three mockups): warm, editorial, cream paper, a serif with character, cyanobacteria green.
3. One source of truth for career facts, derived from Jonathan's private Master Resume, so pages can't contradict each other again.
4. A current, downloadable resume that replaces the March 2022 CV.
5. Every bug from the review fixed (list in §9).
6. A Notes section (blog) that works, for occasional project write-ups.

## 3. Non-goals

- **The Caltrain story/infographic page.** That is a separate, later project: picking stories from `caltrain-tracker/analysis/INSIGHTS.md`, reconciling the on-time numbers in the tracker pipeline, then building the page. This overhaul only restyles the existing dashboard, corrects the write-up, and leaves a place for the stories to land.
- **Changing any Caltrain numbers or the data export.** `public/data/caltrain/*.json` is overwritten nightly by the tracker's export; leave its contents and format alone.
- A photo gallery or portfolio. Photography gets a mention in the bio only.
- A CMS, analytics, comments, newsletters.
- Automating the export from Jonathan's private notes to this site.

## 4. Anti-goals (failure even if it technically works)

- **Leaking confidential employer information.** The repo is public, so anything committed is public, even if no page renders it. No internal project or document codes, customer names, vendor names, lot IDs, dollar figures, corrective-action references, internal performance metrics, or performance-review content. See §7.
- **Linking or naming Jonathan's separate photography portfolio site.** They don't want it associated with this site yet. (Its name goes in the local denylist, §9.)
- Looking like a generic template again: centered avatar, blue buttons, gray cards, filler like "Innovation" as a stat.
- Anything that signals abandonment: stale dates, dead links, an empty or years-old blog, wrong job titles.
- Fraunces, or any typeface whose capital J has a hooked tail below the baseline. Jonathan rejected it on sight.

## 5. Constraints

- Keep the stack: Next.js 16 (App Router), TypeScript, Tailwind CSS v4, MDX, lucide-react, next-themes, Netlify. The repo's `CLAUDE.md` requires dark mode support via next-themes.
- Netlify redeploys on the nightly "chore: update Caltrain data" commits. Nothing in the build may depend on network calls that can fail (for example, live GitHub star counts) without a fallback.
- Keep surviving URLs stable and redirect retired ones (§8). The Caltrain dashboard URL is cited elsewhere, so it must not move.
- This design doc and everything else committed here is public. It contains no internal terms, private file paths or private note contents, and the build tooling must not either (§9, confidentiality check).
- WCAG AA contrast in both themes; keyboard-navigable; respects `prefers-reduced-motion`.

## 6. Approaches considered

| | Approach | Trade-off |
|---|---|---|
| **A (chosen)** | Rebuild in place on the current stack. Facts in one cleaned JSON file regenerated from the Master Resume; prose in Markdown/MDX beside it; a build-time confidentiality check; the Caltrain components restyled through design tokens. | Some existing structure carries over, but working code (the Caltrain dashboard) is kept and Jonathan's vault workflow ("the website is derived from the Master Resume") keeps working with a safety net. |
| B | Same stack, every page hand-written in Markdown. | Easier to give each page a voice, but facts live in several places again. That is how the current site ended up with three different publication lists. |
| C | Restart on a content-first framework such as Astro. | Lighter output, but the React/Recharts dashboard would need porting and the Netlify setup redone, for little visible gain. |

Claude recommended A; Jonathan chose A.

## 7. Content

### Sources (read these, in this order)

All in Jonathan's private notes (read-only from this project):

- **The Master Resume:** the source of truth for roles, bullets, projects, all 15 publications, patents, talks, honors and mentoring. **Contains internal detail.**
- **The public-vs-internal rules** that accompany it: what may be published.
- **A public-safe LinkedIn draft:** the through-line, four pillars with proof points, headline options, an About draft, and public-safe experience bullets. Use this as the default wording.
- **A sources-and-gaps log:** Crossref-verified DOIs and the known errors on the current site (wrong DOIs, three missing papers).
- **A 2020 headshot:** a higher-resolution version of the current avatar. Credit the photographer.

Do **not** copy the private notes' JSON export into the repo as-is: it contains internal details.

### Public-safe rules

- Default wording is the LinkedIn draft's, which is already scrubbed.
- Two metrics in that draft are flagged internal. **Jonathan decided:** say "multi-fold capacity" and "several times faster" instead, and never publish the exact figures.
- Use only the career notes listed above, plus the public project repos. Nothing else from the private notes, no family details, pet names, or homelab hostnames or addresses.
- Products and public facts that may be named: Seeker® and Trekker® product lines, the Trekker® FX FFPE kit and its The Scientist 2026 Top Innovations award, Curio Bioscience's acquisition by Takara Bio.

### Personal notes for the bio (public-safe)

Photography (mention only), cooking, a self-hosted homelab, bike-plus-Caltrain commuter, building open-source tools. A one-line "off the clock" sentence is enough.

### Projects to feature

Software: **Engram** (lead; successor to MKV Episode Matcher, AGPL, 60+ GitHub stars, outside contributors), MKV Episode Matcher (predecessor), PhotoSift (Rust/Tauri photo culling; repo is public), lr-autotag (CLIP keyword tagger for Lightroom, on PyPI). Data: Caltrain Performance Tracker. Hardware: AirIQ air-quality sensor, Cat Wheel Speedometer. Research tools: NuFEB contributions and nufeb_tools, microtools. List only public repos with something to show; skip private and design-stage projects. Descriptions come from each repo's README and the Master Resume §5.

## 8. Information architecture

Nav: **Work · Projects · Papers · Notes · Contact**, plus the theme toggle. The wordmark "Jonathan Sakkos" links home.

| Route | Contents |
|---|---|
| `/` | Hero: the through-line as the headline, with an italic green accent phrase; a short first-person paragraph (role, arc, off-the-clock line); round headshot; links to Resume, Email, GitHub, LinkedIn, Scholar. Then **Now / Before / On the side** in three columns. Then **Selected work** (3): spatial genomics at Takara (public-safe proof points, links to `/work`), Engram, and the Caltrain tracker with its live on-time figure from `stats.json` labeled **"all stops, unadjusted"**, plus arrivals logged and days tracked (links to the dashboard). Then **Recent papers** (3 newest, link to all). Footer. |
| `/work` | Replaces `/about` and `/experience`. Narrative of the path (Columbia Steel Casting → UMN PhD → MSU postdoc → Curio → Takara), the four pillars with proof points, a role timeline (3–5 public-safe bullets per role), education, honors. Link to `/resume`. |
| `/resume` | A print-optimized resume page built from the same JSON (a one- or two-page professional resume, not the academic CV). Must print cleanly to PDF from a browser. A PDF generated from this page is committed at a stable path and offered as a download; how it's generated is the builder's call (§10). |
| `/projects` | Grouped list (Software, Data, Hardware, Research tools). Each item: name, one-line pitch, stack, links (repo, write-up, PyPI). |
| `/projects/caltrain-tracker` | Write-up, rewritten for the current architecture (it still describes FastAPI/PostgreSQL and links a dead "API Documentation" page). Includes a short, plain caveat from the tracker's `DATA.md`: the published on-time figure counts every stop, including terminal stations where parked trains register as on time (about 11% of arrivals), so it runs high; a cleaner measure comes with the stories project. Mention the stories project only as "coming". |
| `/projects/caltrain-tracker/dashboard` | The existing dashboard, restyled to the new tokens. Same URL, same data, same components. |
| `/publications` | Nav label "Papers". All 15 peer-reviewed papers with Crossref DOIs, Jonathan's name bolded in author lists, grouped by year; patents (3 applications); selected talks; Google Scholar and ORCID links. |
| `/notes`, `/notes/[slug]` | MDX posts with real typography. The 2024 "Welcome to my new site" post is retired (it describes Curio and Next.js 14). **First post:** Claude drafts a short piece on rebuilding this site (the three directions, the hunt for a serif whose J doesn't hook, keeping a public repo free of internal detail), using only public facts and this design; Jonathan edits it before launch. |
| `/contact` | Email (mailto), LinkedIn, GitHub, Scholar, ORCID, and a three-field form (name, email, message) on the existing Formspree endpoint with inline success and error states. No `alert()`. |
| 404 | Styled in the new look. |

Redirects (in `netlify.toml`, 301): `/about` and `/experience` → `/work`; `/blog` → `/notes`; `/blog/*` → `/notes/:splat`; `/files/cv.pdf` and `/files/SakkosCV.pdf` → the new resume PDF. Keep the existing Hugo-era redirects, retargeting any that point at retired pages.

## 9. Design and technical requirements

### Visual system ("Field notes")

- **Light:** paper `#fbf8f1`, ink `#23201b`, secondary text `#4a453c`, muted `#5d574c`, rules `#e3dccd`, accent green `#2f6b4f`.
- **Dark:** a warm dark counterpart (near-black brown paper, warm off-white ink, a lighter green that passes AA). The builder sets exact values and verifies contrast.
- **Type:** Newsreader (Jonathan's pick) for display, headings and accent italics; Inter for body and UI; a monospace (e.g. IBM Plex Mono) only for data figures and labels. Self-host via `next/font`. Italic serif in the accent green labels sections ("Now", "Before", "On the side").
- **Feel:** generous whitespace, thin rules instead of boxed cards, first-person copy, no gradients, no stock icons as decoration.
- The approved mockups are in `.superpowers/brainstorm/976-1795625397/content/` (`visual-direction.html` option C; `serif-choice-v2.html`). They are not checked in.

### Bugs and debt that must be fixed

1. `/blog/[slug]` 404s: Next 16 `params` is a Promise. Await it in every dynamic route.
2. Tailwind v4 never loads `tailwind.config.ts`, so `bg-background`, `text-primary` etc. don't exist (the sticky header is transparent). Define tokens with `@theme` in `globals.css` and delete the JS config.
3. `prose` classes do nothing: add `@tailwindcss/typography` via `@plugin` and style it to the tokens.
4. `/og-image.png` 404s and `metadataBase` is unset. Add `metadataBase` and a generated Open Graph image in the new style.
5. Site title and description still say "Senior Process Development Engineer at Curio Bioscience" (`layout.tsx`, `src/lib/metadata.ts`, blog list). All metadata comes from the JSON.
6. Theme toggle uses `theme` instead of `resolvedTheme`. Fix, add an accessible label, and avoid a hydration flash.
7. Mobile menu: add `aria-expanded`, close on Escape and on route change, trap or return focus.
8. Broken links: the doubled `https://doi.org/https://doi.org/…` DOI, and `/api/caltrain/docs`.
9. Hard-coded career data in `about`, `experience`, `publications` and `page.tsx`: delete it; everything reads from the content layer.
10. `sitemap.ts`: generate from routes and notes, using the real domain.
11. Remove Next.js starter leftovers (`public/next.svg`, `vercel.svg`, `file.svg`, `globe.svg`, `window.svg`) and the unused `resume.json` type fields.

### Content layer

- Career data lives in one JSON file that is **not** under `public/` (it shouldn't be downloadable as a raw file). It follows the JSON Resume shape where possible, extended for pillars, headline, project groups and links, publication authors/DOIs, patents and talks.
- Load it through typed accessors in `src/lib/` and validate its shape at build time, so a bad regeneration fails the build rather than rendering blanks.
- **Confidentiality check:** a script run before every build that fails if the content layer or MDX contains internal patterns. Generic patterns are committed: internal project and document codes, corrective-action references, dollar amounts. Named terms (customer and vendor names, the portfolio site's name) must **not** be written into the public repo, since that would publish them: keep them in a gitignored local file that the script reads when present, and make the script say clearly when that file is missing. Jonathan supplies the named terms; the builder seeds the local file from the public-vs-internal rules.
- The check also scans the JSON files under `public/` (except `public/data/caltrain/`, which is generated) and fails outright if a `public/resume.json` exists, because an older workflow note says to copy the unscrubbed export there.
- **The private notes stay read-only** *(Claude's call)*. The site's JSON is a derived file maintained in this repo: regenerate it from the Master Resume by applying the public-safe rules, then let the check verify it. Update `CLAUDE.md` and `README.md` to describe the content layer, the check, and that procedure. At handoff, tell Jonathan which of their notes still describe the old copy-to-`public/` step so they can update them.

### Caltrain

- Restyle the dashboard and home widget through the design tokens: the blue gradient hero and chart colors move to the Field notes palette (keep semantic on-time/minor/major colors, tuned for the palette and both themes).
- Rewrite the write-up's architecture and methodology sections from the tracker repo's current `README.md` and `DATA.md` (the caltrain-tracker repo, branch `origin/main`).
- Don't touch the numbers, the export format, or the incident labeling. Those belong to the stories project.

## 10. Left to the builder

- Component structure, file layout, and how the MDX pipeline is wired.
- Exact dark-mode colors (within AA), spacing scale, and motion.
- How the resume PDF is produced: generated from `/resume` by a script, or printed by hand and committed. If a script, keep any headless browser a dev-only dependency.
- Whether GitHub star counts appear (only if fetched at build time with a safe fallback; otherwise omit).
- Whether the `/api/caltrain/*` routes stay (no page should link to them) and whether the stale `scripts/export_to_website.py` copy is removed (the live script is in caltrain-tracker).
- Copy-editing within Jonathan's voice, using the LinkedIn draft as the base. Anything that states a new fact must come from the Master Resume.

## 11. Decisions log

| Decision | Who | Outcome |
|---|---|---|
| Audience | Jonathan | Hiring managers, collaborators, and themself ("make it feel like me") |
| Visual direction | Jonathan | C, "Field notes"; Fraunces rejected |
| Typeface | Jonathan | Newsreader |
| Photography | Jonathan | Mention only; no gallery, no link to their portfolio site |
| Notes section | Jonathan | Keep; Claude drafts the first post, Jonathan edits |
| Scope | Jonathan | Site first; Caltrain stories are a separate later project |
| Build approach | Jonathan | A, rebuild in place |
| Internal metrics | Jonathan | "Multi-fold", not exact multiples |
| Caltrain homepage figure | Jonathan | Show the % labeled "all stops, unadjusted", caveat on the write-up |
| Private notes stay read-only; JSON maintained in repo | Claude | §9 content layer |
| Named denylist terms kept out of the public repo | Claude | §9 content layer |
| Nav label "Papers" on the existing `/publications` URL; `/blog` becomes `/notes` | Claude | §8 |
| Use the higher-resolution 2020 headshot, credited | Claude | §7 |
