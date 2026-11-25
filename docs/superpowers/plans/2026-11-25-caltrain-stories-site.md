# Caltrain stories: site Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add the `/projects/caltrain-tracker/stories/` long read, move the homepage card, write-up and dashboard to the cleaned on-time measure, and show the dashboard's new fields.

**Architecture:** A server-side loader reads and validates the nightly `stories.json` at build time; a missing or invalid file yields `null`, and every link to the page hides. Story text lives in one MDX file rendered with `next-mdx-remote/rsc` and a component map of figure and chart tags. Charts are hand-built SVG components; the time-distance diagram is the one client component. Dashboard components read the new optional fields and fall back to the old ones, so either deploy order is safe.

**Tech Stack:** Next.js 16 App Router, TypeScript, Tailwind v4 tokens (`src/app/globals.css`), `next-mdx-remote/rsc`, vitest (node environment). No new dependencies.

**Spec:** `docs/superpowers/specs/2026-11-25-caltrain-stories-design.md`. The data side is the caltrain-tracker plan `docs/superpowers/plans/2026-11-25-caltrain-stories-pipeline.md` (Task 6 holds the JSON contract this plan consumes; Task 3 the dashboard fields).

## Global Constraints

- Builds on the redesign branch `claude/website-overhaul-review-f66afd`. The pull request targets `master` if that branch has merged, else stacks on it.
- `public/data/caltrain/` is written only by the nightly export. Never commit hand-made files there; tests use `tests/fixtures/caltrain/`.
- The build may not make network calls.
- Data problems never fail the build; code problems do (spec §8 site 3).
- WCAG AA in both themes, keyboard operable, honours `prefers-reduced-motion`. Colors come only from the CSS variables in `globals.css` and `src/components/caltrain/palette.ts`.
- Copy is first person in Jonathan's voice. "Strike" is always marked as inferred, except for the three confirmed events. No internal employer details.
- `npm run check:content` (with `.content-denylist` present locally) and `npm test` pass before every commit. `npm run lint` passes before the PR.
- New label for the cleaned headline: **"within 4 minutes of schedule"**. The legacy label "all stops, unadjusted" appears only when `stats.json` has no `clean` block.

## Review Focus

1. **`stats.json` without a `clean` block** (the site deploys before the server pull): the hero, card and write-up keep the legacy number and the "all stops, unadjusted" wording. Test in Task 2.
2. **`stories.json` present but `stories_example_day.json` missing**: the page renders and story 3 shows its events table without the diagram. Test in Task 5.
3. **A train with `last_stop_late_pct: null`, or old data without the field**: the leaderboard shows only the all-stops figure, never "null%". Test in Task 6.
4. **Timezone lag**: `data_through` is a Pacific date, but readers' clocks vary. The staleness notice must not appear at a 0–1 day lag. Test in Task 2.
5. **A 375 px viewport**: the headline strip wraps to 2 × 2, the league table's labels don't overflow, and the diagram's controls stay reachable. Visual check in Task 7.

---

### Task 1: Stories data layer

**Files:**
- Create: `src/lib/caltrain-stories.ts`
- Create: `tests/fixtures/caltrain/stories.json` (a valid payload with realistic values from INSIGHTS.md), `tests/fixtures/caltrain/stories_example_day.json` (3 trains, 2 stations, a freeze)
- Test: `tests/lib/caltrain-stories.test.ts`

**Interfaces:**
- Produces types mirroring the tracker contract: `FigureUnit = "pct" | "count" | "minutes" | "hours" | "weeks" | "time" | "text"`, `Figure { value: number | string; unit: FigureUnit }`, `StoriesData`, `StoryId = "recovery" | "express" | "afternoons" | "saturday"`, `ExampleDay`.
- Produces: `STORY_FIGURE_KEYS: readonly string[]`, exactly the tracker's `REQUIRED_FIGURES` names.
- Produces: `loadStories(file = STORIES_FILE): StoriesData | null` and `loadExampleDay(file = EXAMPLE_DAY_FILE): ExampleDay | null`, which read with `fs` at build time. They return `null` and `console.warn` once for a missing file, bad JSON, `schema_version !== 1`, a missing `STORY_FIGURE_KEYS` entry, a non-finite number, an unknown unit, or a missing story array. Defaults: `public/data/caltrain/stories.json` and `public/data/caltrain/stories_example_day.json`.
- Produces: `storiesAvailable(file?: string): boolean`, `STORIES_PATH = "/projects/caltrain-tracker/stories/"`.
- Produces: `formatClock(hhmm: string): string` ("17:22" → "5:22 p.m."), used by `formatFigure`, `LeagueTable` and the diagram's readout; `formatFigure(f: Figure): string`; `daysStale(dataThrough: string, today: Date): number` (whole local calendar days; never negative).

- [ ] **Step 1: Write failing tests:**
  - The fixture loads, and `data.figures.sat_late_pct.value === 10.7`.
  - `loadStories("does/not/exist.json") === null`; a temp file missing `sat_late_pct` → `null`; `schema_version: 2` → `null`; `"value": "NaN"` with unit `pct` → `null`.
  - `formatFigure`: `{50, pct}` → `"50%"`, `{0.3, pct}` → `"0.3%"`, `{10.7, pct}` → `"10.7%"`, `{743, count}` → `"743"`, `{771334, count}` → `"771,334"`, `{"17:22", time}` → `"5:22 p.m."`, `{"08:22", time}` → `"8:22 a.m."`, `{4.5, weeks}` → `"4.5 weeks"`, `{1, hours}` → `"1 hour"`, `{3, hours}` → `"3 hours"`, `{0, minutes}` → `"0 minutes"`, `{1, minutes}` → `"1 minute"`, `{"Express", text}` → `"Express"`.
  - `daysStale("2026-11-25", new Date(2026, 10, 29, 9))` → `4`; `daysStale("2026-11-25", new Date(2026, 10, 25, 23))` → `0`; a future date → `0`.
- [ ] **Step 2: Run** `npx vitest run tests/lib/caltrain-stories.test.ts`. Expected: FAIL (module missing).
- [ ] **Step 3: Implement** `src/lib/caltrain-stories.ts`.
- [ ] **Step 4: Run** the same command. Expected: PASS.
- [ ] **Step 5: Commit** `feat: load and validate the nightly Caltrain stories data`.

### Task 2: One headline for card, hero and write-up, plus the staleness notice

**Files:**
- Create: `src/lib/caltrain-headline.ts`, `src/components/caltrain/stale-notice.tsx`
- Modify: `src/lib/caltrain-snapshot.ts`, `src/components/caltrain-snapshot.tsx`, `src/app/projects/caltrain-tracker/page.tsx`, `src/lib/api.ts` (`CaltrainStats.clean?: CleanStats`)
- Test: `tests/lib/caltrain-headline.test.ts`, `tests/lib/caltrain-snapshot.test.ts`

**Interfaces:**
- Produces: `headline(stats: CaltrainStats): { onTimePct: number; rolling7d: number; rolling30d: number; totalArrivals: number; daysTracked: number; cleaned: boolean; label: "within 4 minutes of schedule" | "all stops, unadjusted" }`. It uses `stats.clean` when present.
- `CaltrainSnapshot.label` widens to the same union and gains `cleaned: boolean`; `getCaltrainSnapshot` goes through `headline()`.
- `StaleNotice({ dataThrough }: { dataThrough: string })` is a client component. It renders nothing until mounted, then, when `daysStale > 3`, renders "The tracker last reported on {formatDate(dataThrough)}; these numbers may be out of date." in `text-minor`.
- The card (`variant="card"`) adds a "Read the stories" `TextLink` to `STORIES_PATH` when `storiesAvailable()`.
- The write-up page:
  - The caveat section renders the new text when `cleaned`, the current text otherwise. New text, in substance: the figure counts arrivals within 4 minutes of schedule; it leaves out each train's first stop, calls after midnight, and days when the real-time feed went stale; Caltrain counts its own figure at each train's final stop, so the two aren't comparable.
  - The Method section's "On time" paragraph names the same exclusions.
  - "Next: stories from the data" becomes "Stories from the data" with a link to `STORIES_PATH` when available, and keeps today's "coming" sentence otherwise.

- [ ] **Step 1: Write failing tests:**
  - `headline` with a `clean` block → `cleaned: true`, the clean values and the new label; without one → the legacy values and `"all stops, unadjusted"`.
  - In `caltrain-snapshot.test.ts`, change "formats the real stats file" to accept either label, and add a temp-file case with a `clean` block expecting `{ onTimePct: "92.8%", label: "within 4 minutes of schedule", cleaned: true, … }`.
- [ ] **Step 2: Run** `npx vitest run tests/lib`. Expected: FAIL.
- [ ] **Step 3: Implement.**
- [ ] **Step 4: Run** `npm test`. Expected: PASS.
- [ ] **Step 5: Commit** `feat: cleaned Caltrain headline with a legacy fallback`.

### Task 3: Static story charts

**Files:**
- Create: `src/lib/charts.ts`, and in `src/components/caltrain/stories/`: `headline-strip.tsx`, `opener-heatmap.tsx`, `recovery-fan.tsx`, `league-table.tsx`, `headway-grid.tsx`, `day-strip.tsx`, `stops-table.tsx`, `chart-frame.tsx`
- Test: `tests/lib/charts.test.ts`, `tests/components/story-charts.test.ts`

**Interfaces:**
- `src/lib/charts.ts`: `linearScale(domain: [number, number], range: [number, number]): (v: number) => number`; `bandPath(points: { x: number; lo: number; hi: number }[]): string` (closed SVG path); `minutesOfDay("15:55" | "15:55:30"): number`.
- `ChartFrame({ title, caption, summary, children })` renders a `<figure>` with a wide container (it breaks out of the text column at `sm:` and up), an `<svg role="img" aria-label={summary}>` slot and a `<figcaption>`.
- Each chart takes its slice of `StoriesData["stories"]` as `data`, plus `figures` where it annotates. Each is a server component with no hooks. Colors: `CHART.grid/axis/text`, `--ontime/--minor/--major`, `--series-1…4` for services (Local `series-3`, Limited `series-2`, Express `series-1`, matching the mockup's direction colors), and `performanceColor` for heatmap cells.
- What each draws:
  - `HeadlineStrip`: four figures with their one-line captions, linking to `#story-1`…`#story-4`; 4 columns at `sm:`, 2 × 2 below.
  - `OpenerHeatmap`: day (Mon–Sun) × scheduled hour 5–23, cell color by `late_pct`, empty cells in `--paper-2`.
  - `RecoveryFan`: k = 0–10 on x; p10–p90 and p25–p75 bands; median line; a dashed line labelled "back on time".
  - `LeagueTable`: horizontal bars for `league`, labelled "Train {train} · {formatClock(departs)} {service} {NB/SB}", Wilson whiskers, a value label `{late_pct}%`.
  - `HeadwayGrid`: 5 × 4 cells with `late_pct` and `n`.
  - `DayStrip`: per-day dots for weekday/Sunday/Saturday columns, deterministic jitter (index-based, not random), and a labelled 15% line.
  - `StopsTable`: the newest 12 rows of `events` as an HTML table (date, where held, minutes, trains ≥ 15 min late, cancelled), or "No line-wide stops detected yet." when empty.

- [ ] **Step 1: Write failing tests.** `charts.test.ts`: `linearScale([0, 10], [0, 100])(2.5) === 25`; `bandPath` of two points starts with `"M"` and ends with `"Z"`; `minutesOfDay("15:55:30") === 955.5`. `story-charts.test.ts` renders each chart from the fixture with `renderToStaticMarkup(createElement(Chart, props))`: every output contains `role="img"` and a non-empty `aria-label`; `LeagueTable` contains `"Train 523"` and `"50%"`; `StopsTable` with `events: []` contains `"No line-wide stops detected yet."`.
- [ ] **Step 2: Run** `npx vitest run tests/lib/charts.test.ts tests/components/story-charts.test.ts`. Expected: FAIL.
- [ ] **Step 3: Implement.**
- [ ] **Step 4: Run** the same command. Expected: PASS.
- [ ] **Step 5: Commit** `feat: hand-built SVG charts for the Caltrain stories`.

### Task 4: The playable time-distance diagram

**Files:**
- Create: `src/lib/marey-playback.ts`, `src/components/caltrain/stories/playable-marey.tsx`
- Test: `tests/lib/marey-playback.test.ts`, `tests/components/story-charts.test.ts` (add a case)

**Interfaces:**
- `clipTrajectory(points: { time: string; distance: number }[], tMinutes: number): { time: string; distance: number }[]` keeps the points at or before `t`, plus one point interpolated at exactly `t` when `t` falls between two points.
- `delayBand(maxDelayMin: number): "ontime" | "minor" | "major"` (≤ 4, ≤ 15, > 15).
- `PlayableMarey({ day }: { day: ExampleDay })`, `"use client"`:
  - Distance (stations as y labels, north at the top) against time across `day.window`, with the `freeze` window shaded in `--major` at low opacity.
  - Each train is a polyline colored by `delayBand`.
  - Before Play, and always under `prefers-reduced-motion`, it shows the full diagram. **Play** resets `t` to the window start and advances with `requestAnimationFrame`, so the whole window plays in about 20 s; **Pause** stops it.
  - A range input (`aria-label="Time"`, step 1 minute) scrubs. A clock readout shows `t` as "h:mm p.m.".
  - Controls are real `<button>` and `<input type="range">` elements with visible focus rings.

- [ ] **Step 1: Write failing tests:** `clipTrajectory` with points at 15:00 (0 km) and 15:10 (10 km) at `t = 905` → last point `{ distance: 5 }`; `t` before the first point → `[]`; `delayBand(4) === "ontime"`, `delayBand(15) === "minor"`, `delayBand(16) === "major"`. Static render of `PlayableMarey` from the fixture contains one `<polyline` per train and a button labelled "Play".
- [ ] **Step 2: Run** `npx vitest run tests/lib/marey-playback.test.ts tests/components/story-charts.test.ts`. Expected: FAIL.
- [ ] **Step 3: Implement.**
- [ ] **Step 4: Run** the same command. Expected: PASS.
- [ ] **Step 5: Commit** `feat: playable time-distance diagram for the bad-afternoon story`.

### Task 5: MDX components, the stories page and draft copy

**Files:**
- Create: `src/components/caltrain/stories/mdx-components.tsx`, `src/app/projects/caltrain-tracker/stories/page.tsx`, `content/caltrain/stories.mdx`
- Test: `tests/lib/stories-mdx.test.ts`

**Interfaces:**
- `storyComponents(data: StoriesData, day: ExampleDay | null): Record<string, ComponentType<any>>` provides these tags:
  - `Fig k` renders `formatFigure(data.figures[k])` in `font-mono`, and **throws** on an unknown key.
  - `HeadlineStrip`, `OpenerHeatmap`, `RecoveryFan`, `LeagueTable`, `HeadwayGrid`, `DayStrip`, `StopsTable`.
  - `AfternoonDiagram` renders `PlayableMarey`, or nothing when `day` is null.
  - `ClaimNote story` renders nothing when `holds`; otherwise a note in `text-minor`: "As of {formatDate(data.data_through)}, this no longer holds in the latest data."
  - `Story n title` renders a section with `id="story-{n}"`, a serif numeral and an `h2`.
  - `CheckYourTrain to` renders a `TextLink` to `/projects/caltrain-tracker/dashboard/#{to}`, where `to` is one of `trains`, `stations`, `hours`, `incidents`, `days`.
- `page.tsx` (server):
  - Metadata via `pageMetadata({ title: "How Caltrain runs late", description, path: STORIES_PATH })`.
  - It loads `loadStories()`. If that's `null`, it renders a `PageIntro` and the paragraph "The stories are being refreshed. The [dashboard] has the latest numbers."
  - Otherwise, the layout follows mockup A: kicker "Caltrain · stories from the data", `h1`, a dek, then the meta line "Data through {formatDate(data_through)} · updates nightly · how much to trust these numbers" (the last part links to `#trust`), then `<StaleNotice>`, then `MDXRemote source={mdx} components={storyComponents(...)}`.
  - The prose column is `max-w-3xl`; chart frames break wider.
- `content/caltrain/stories.mdx` skeleton, in order:
  1. Opening paragraph, `<HeadlineStrip />` and `<OpenerHeatmap />`.
  2. `<Story n={1} title="Ten minutes late stays late">` → `<ClaimNote story="recovery" />`, prose quoting `recovery_*` figures, `<RecoveryFan />`, `<CheckYourTrain to="trains" />`.
  3. Story 2, "The fastest trains are the least reliable": prose quoting `worst_train*`, the group shares and `headway_*`; `<LeagueTable />` and `<HeadwayGrid />`.
  4. Story 3, "A few bad afternoons": the prose says "inferred" for causes, and names the three confirmed cases as confirmed; `<AfternoonDiagram />` and `<StopsTable />`, then `<CheckYourTrain to="incidents" />`.
  5. Story 4, "Saturday is the worst day to ride": framed as suggestive; `<DayStrip />`, then `<CheckYourTrain to="days" />`.
  6. `## How much to trust these numbers {#trust}` (an `id` via a `Trust` tag if MDX heading ids aren't supported). It covers one-minute precision; the October 2026 validation (r = 0.96, 97% within two minutes, stated as of that analysis); what's excluded and why; "end of the line" meaning the last stop we see; inferred causes; and why this isn't Caltrain's own figure.

  Claude drafts the copy from INSIGHTS.md. Every number in prose is a `<Fig>`, except the dated validation figures.

- [ ] **Step 1: Write failing tests** in `stories-mdx.test.ts`:
  - every `<Fig k="…">` key in `content/caltrain/stories.mdx` is in `STORY_FIGURE_KEYS` and in the fixture;
  - every capitalised tag used in the MDX is a key of `storyComponents(fixture, null)`;
  - every `ClaimNote story` value is a `StoryId`;
  - compiling the MDX with `compileMDX` (from `next-mdx-remote/rsc`) and the fixture components, then rendering the result with `renderToStaticMarkup`, doesn't throw, both with the example day and with `null`;
  - rendering a compiled `<Fig k="nope" />` throws an error that names `"nope"`.
- [ ] **Step 2: Run** `npx vitest run tests/lib/stories-mdx.test.ts`. Expected: FAIL.
- [ ] **Step 3: Implement** the components, page and draft MDX.
- [ ] **Step 4: Run** `npm test` and `npm run check:content`. Expected: PASS.
- [ ] **Step 5: Commit** `feat: Caltrain stories page with draft copy`.

### Task 6: Dashboard updates and links

**Files:**
- Modify: `src/lib/api.ts` (`DailyPerformance.bad_feed?: boolean`; `TrainPerformance.last_stop_late_pct?: number | null`, `last_stop_runs?: number`, `last_stop_name?: string | null`; `Incident.held_near?: string | null`)
- Modify: `src/app/projects/caltrain-tracker/dashboard/page.tsx`, `.../dashboard/layout.tsx`, `src/components/caltrain/{hero-section,daily-trends-chart,calendar-heatmap,incident-analysis,train-leaderboard,heatmap,commute-analysis}.tsx`
- Modify: `content/profile.json` (a "Stories" link on the caltrain-tracker project), `src/app/projects/page.tsx`, `src/app/sitemap.ts`
- Create: `src/lib/caltrain-dashboard.ts`
- Test: `tests/lib/caltrain-dashboard.test.ts`, `tests/app/sitemap.test.ts`, `tests/components/story-charts.test.ts` (leaderboard case)

**Interfaces:**
- `src/lib/caltrain-dashboard.ts`: `lastStopLabel(t: TrainPerformance): string | null` returns `"late at {last_stop_name} on {last_stop_late_pct}% of weekday runs"`, or `null` when the value is `null`/absent. `isBadFeedDay(d: DailyPerformance): boolean` is `d.bad_feed === true`.
- Hero: takes `headline(stats)` and shows its `label` under "on time". The trend badges use its rolling values.
- Daily chart and calendar: bad-feed days are drawn in `--field` with the tooltip or title "feed unreliable"; the legend gains "Feed unreliable".
- Incident panel: never renders `root_cause_*`; shows "Trains held near {held_near}" when it's present.
- Leaderboard cards: a second line from `lastStopLabel` when it isn't null.
- Heatmap and commute captions say "by scheduled hour".
- Section anchors: `id`s `days`, `hours`, `commute`, `incidents`, `stations`, `trains`.
- The methodology block describes the clean rules in one sentence each.
- The page shows `<StaleNotice dataThrough={stats.date_range.end} />` under the hero.
- `layout.tsx` (server) renders a "Read the stories" link above `children` when `storiesAvailable()`.
- The projects page drops any link whose `url === STORIES_PATH` when `!storiesAvailable()`. `sitemap.ts` adds `STORIES_PATH` (priority 0.7, `changeFrequency: "daily"`) when available.

- [ ] **Step 1: Write failing tests:**
  - `lastStopLabel` with `{ last_stop_late_pct: 50, last_stop_name: "22nd Street" }` → `"late at 22nd Street on 50% of weekday runs"`; with `null` → `null`; with the field absent → `null`.
  - The sitemap contains `/projects/caltrain-tracker/stories/` when `storiesAvailable` is mocked `true`, and not when it's `false` (`vi.mock("@/lib/caltrain-stories")`).
  - A static render of `TrainLeaderboard` with one null-field train doesn't contain `"null"`.
- [ ] **Step 2: Run** `npx vitest run tests/lib/caltrain-dashboard.test.ts tests/app/sitemap.test.ts tests/components/story-charts.test.ts`. Expected: FAIL.
- [ ] **Step 3: Implement.**
- [ ] **Step 4: Run** `npm test`, `npm run check:content` and `npm run lint`. Expected: PASS.
- [ ] **Step 5: Commit** `feat(dashboard): cleaned measure, feed-unreliable days, last-stop figures, links to the stories`.

### Task 7: Check with real data, then hand over

- [ ] **Step 1: Real data, locally only.** Copy the tracker plan's Task 8 outputs (`stats.json`, `daily_performance.json`, `train_performance.json`, `incidents.json`, `stories.json`, `stories_example_day.json`, plus the other dashboard files) into `public/data/caltrain/`. **Don't commit them**; restore with `git restore public/data/caltrain` at the end of this task.
- [ ] **Step 2: Build and serve:** `npm run build`, then `npm start`. Expected: the build passes the content check and generates `/projects/caltrain-tracker/stories/`.
- [ ] **Step 3: Look at it** in the browser pane, at desktop and the mobile preset, in light and dark: the stories page (strip, opener, each chart, Play/Pause/scrub on story 3, keyboard only, and with reduced motion emulated), the dashboard (hero label, greyed days, leaderboard second line, incident panel, anchors from each `CheckYourTrain` link), the homepage card and the write-up. Fix what's wrong, re-running `npm test` after each fix.
- [ ] **Step 4: The data-missing path.** Delete the local `stories.json`, rebuild, and confirm the page shows the "being refreshed" note and no link to it remains on the card, write-up, dashboard, projects page or sitemap.
- [ ] **Step 5: Restore and hand over.** Run `git restore public/data/caltrain` and `git status` (clean apart from intended changes). Push the branch, open the PR (target per Global Constraints), and ask Jonathan to edit `content/caltrain/stories.mdx` before merging.
