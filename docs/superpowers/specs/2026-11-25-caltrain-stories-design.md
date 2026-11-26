# Caltrain "stories from the data": design

**Date:** 2026-11-25
**Status:** Approved by Jonathan, 2026-11-25
**Repos:** github.com/Jsakkos/MyWebsite (this repo, public) and github.com/Jsakkos/caltrain-tracker (public)
**Follows:** `2026-11-25-website-overhaul-design.md`, which left this as a separate project (§3 there)

## 1. Intent

The Caltrain tracker has logged every train's position once a minute since August 2025. An
analysis pass in October 2026 (`caltrain-tracker/analysis/INSIGHTS.md`, with notebooks)
found patterns worth telling properly. This project turns four of them into a page on the
site, and fixes the dashboard's headline on-time number so the dashboard and the stories
agree.

**Who it's for:** someone curious about Caltrain or their own commute, or someone who just
likes data that tells a story. Not an analyst audience: plain language, one strong chart
per story, caveats gathered in one place.

**Two pages, two jobs:**

- **The dashboard** (`/projects/caltrain-tracker/dashboard/`, stays) is for looking things
  up: how is my station, my train, this week. It gets updated, not replaced.
- **The stories page** (`/projects/caltrain-tracker/stories/`, new) is for reading: four
  findings, each told with a headline figure, a short text and a chart, ending with a link
  into the dashboard to check your own train or station.

## 2. Goals

1. A stories page in the Field notes style with four stories (§5), a scene-setting heatmap,
   and a short "how much to trust these numbers" section.
2. One definition of "on time" used everywhere: the dashboard headline, every dashboard
   chart, the homepage card, the write-up and the stories (§4).
3. The stories stay current: their charts and every number in their text come from the
   tracker's nightly build, not from a one-off export.
4. A story whose central claim stops holding in the latest data says so on the page,
   automatically.
5. One playable chart: the time-distance diagram of a bad afternoon, with a play button.
6. The "all stops, unadjusted" label and caveat retired from the homepage card, the
   dashboard hero and the write-up, replaced by wording that matches the new measure.

## 3. Non-goals

- Moving-train animation (dots on a line, minute by minute). Its own later project.
- Collecting anything new from 511 (ServiceAlerts, TripUpdates). The API key is saturated.
- Naming the cause of any incident beyond "inferred from the shape of the data" and the
  three externally confirmed cases.
- Forecasting, anomaly alerts, a per-train lookup tool, or comparisons against Caltrain's
  own published on-time figure.
- Changing the 4-minute threshold, the arrival-detection rule, or the collector.
- Stories #5–#11 from INSIGHTS.md beyond what §5 folds in. The timetable sawtooth (#9),
  weather (#11) and the feed-quality sidebar are out.
- The old NotebookLM infographic brief, which describes a retired stack.

## 4. The on-time measure

**Definition (Jonathan's pick: per stop, cleaned).** The share of station arrivals within
4 minutes of schedule, counting only arrivals that pass the clean rules:

- not the trip's first stop (a train waiting at its origin platform has no meaningful
  arrival);
- scheduled before midnight (511 drops every vehicle at 00:00 Pacific);
- closest ping within 1 km of the platform;
- a real train number (no foreign-vehicle ids);
- not on a bad-feed day: a service day where fewer than 45% of consecutive pings changed
  position, or fewer than 60% of non-origin arrivals were located within 1 km.

These are exactly the notebooks' `clean` and `feed_days` rules (`analysis/common.py`). From
the notebooks' figures the result is roughly 92.8% against today's 93.4%. That is an
estimate; the build will produce the real number.

**Delay is signed.** Early arrivals keep their negative delay instead of being clamped to
zero. This changes averages, not the on-time share.

**Scope.** The headline covers all days, weekends included. Stories quote weekday figures
where the finding is about commuting, and say so.

**Hour means scheduled hour** *(Claude's call)*. A train due at 8:55 that arrives at 9:20
counts in the 8 a.m. bucket. The notebooks already do this; the dashboard's hour heatmap
and commute periods switch from actual arrival time to scheduled time so they match the
stories' opener.

**Bad-feed days** drop out of every figure, but stay visible: the dashboard's daily chart
and calendar show them greyed out and marked "feed unreliable".

**Why per stop and not per trip.** It is what a rider experiences, every other dashboard
chart (by station, hour, train) is a slice of the same measure, and the stories use it.
The trust section says in a sentence or two why it isn't Caltrain's own figure, which is
counted at each train's final stop.

## 5. The stories

Order on the page, with the claim each one makes and the check that guards it. Figures
quoted are from INSIGHTS.md and will be recomputed nightly. Notebook references are to
`caltrain-tracker/analysis/`.

**Opener: the shape of a day.** Hour × day-of-week heatmap of late share, all days
(`02_when_where_which §1`). Not a story; it sets the scene. No claim check.

**Headline strip.** Four figures across the top, one per story, doubling as the table of
contents: share of 10-minute-late trains that get back on time (0.3%); how often the least
reliable train is late at the last stop we see it reach (523 at 22nd Street, 50% of
weekday runs); number of line-wide stops (12); Saturday late share
(10.7% vs 6.7% weekdays).

**1. Ten minutes late stays late** (INSIGHTS #1; `03_propagation §4`).
Once a weekday train first reaches ≥ 10 minutes late at a non-origin stop, its delay over
the next ten stops doesn't recover: median change 0 to +1 minute, 0.3% back under 4.
*Chart:* fan chart, x = stops after going 10 minutes late, y = change in delay, median line
with 25–75 and 10–90 bands, the "back on time" line marked.
*Claim check:* median change at +5 stops ≥ 0 and back-on-time share < 5%.

**2. The fastest trains are the least reliable** (INSIGHTS #3, #4, #5;
`02_when_where_which §5–6`, `03_propagation §1–3`).
Northbound expresses are late far more often than any other service, and the reason is
mechanical: an express can't pass the local ahead of it, and it loses time on the
approach into San Francisco.
*Chart:* league table of the least reliable weekday trains (≥ 80 clean runs), late share
at the last observed stop with Wilson intervals, colored by service type.
*Which figure (Jonathan's pick):* trains are quoted by how often they're late at the last
stop we see them reach, labeled as such ("late at 22nd Street on half its weekday runs").
It's the same per-stop definition measured at one stop, and it's what a rider going into
San Francisco feels. The dashboard's train leaderboard gains a matching column, so the
"check your own train" link lands on the same number.
*Supporting chart (small):* follower late share by leader delay × scheduled headway (the
5 × 4 heatmap), or Express vs Local at 22nd Street by leader state. Builder picks the one
that reads better at small size.
*Claim check:* Express northbound has the highest weekday late share of the six service ×
direction groups, per stop, all hours *(Claude's call)*.

**3. A few bad afternoons** (INSIGHTS #2 and #8; `05_network_stops`, `03_propagation §5`).
About a dozen times a year the whole line freezes at once (inferred to be mostly
trespasser strikes), and those few afternoons hold about a third of all arrivals more than
15 minutes late. Departures stay disrupted for around three hours, and the expresses are
what get cancelled.
*Chart:* the playable time-distance diagram (§6) of **Thursday 6 November 2025**, the
fixed example day. It is an illustration, not a statistic, so it doesn't change nightly.
*Supporting:* a small table of detected line-wide stops (date, where trains were held, how
long, trains ≥ 15 min late afterwards), newest first.
*Claim check:* the detected stops' windows hold ≥ 20% of all ≥ 15-minute-late arrivals.

**4. Saturday is the worst day to ride** (INSIGHTS #7; `02_when_where_which §2`).
Pooled, Saturday arrivals are late more often than weekdays or Sundays, driven by a fat
tail of bad Saturdays (one in five over 15% late). Presented as suggestive, since it rests
on a few dozen days.
*Chart:* strip plot of per-day late share for weekdays, Sundays and Saturdays, with the
15% line marked.
*Claim check:* Saturday's pooled late share is the highest of the three day types.

**When a claim check fails** the story stays on the page with a dated note above its
chart: "As of [data-through date], this no longer holds in the latest data." The note is
part of the page, not an error.

**Each story ends** with a "Check your own train/station" link to the matching dashboard
section.

**How much to trust these numbers** (end of page, short): one-minute precision; the
validation against 511's own arrival records from the October 2026 analysis (r = 0.96,
97% within two minutes), stated as of that analysis; what's excluded and why; that the
feed never shows a train's final arrival, so "end of the line" means the stop before it;
that incident causes are inferred; why this isn't Caltrain's own on-time figure.

## 6. The playable diagram

- The time-distance diagram of 6 Nov 2025: every train a line (distance along the line
  against time), colored by delay, the frozen window shaded.
- **Play** sweeps a clock across the afternoon; each train's line draws in as the clock
  passes, so the reader watches the line freeze and the delay spread. Pause and a scrubber
  let them stop on any minute.
- Keyboard operable; the button and scrubber have labels.
- With `prefers-reduced-motion`, and before Play is pressed, it shows the complete
  diagram with the freeze shaded. The static view must work on its own.
- Data: that day's trajectories, trimmed to the afternoon window. Today the dashboard gets
  them from `incident_trajectories.json` (25 worst days, ~4.7 MB); the stories page needs
  its own small file so it doesn't depend on that day staying in the worst-25 list.

## 7. Approaches considered

**How the stories get their data** (Jonathan's pick: nightly).

| | Approach | Trade-off |
|---|---|---|
| | Dated snapshot: a script computes story data once, committed to the site, refreshed by hand | Cheap; text and charts can't drift apart. But the stories age. |
| **Chosen** | Nightly: story analysis runs in the tracker's nightly build and ships with the dashboard files | Always current. Costs porting four notebooks' logic with tests, and the text can drift from the data, which the claim checks (§5) guard against. |

**How the page reads** (Jonathan's pick: long read; mockups in `.superpowers/brainstorm/7399-1795632907/content/stories-format.html`, not checked in).

| | Approach | Trade-off |
|---|---|---|
| **Chosen** | Long read with a headline strip: one scrolling page, charts wider than the text column | Cheapest, reads well on a phone, fits the editorial look. |
| | Scrollytelling: sticky chart that changes as paragraphs scroll past | Most "newspaper data feature", about twice the cost, needs a separate phone layout and accessibility care. |
| | Chapters: an index page plus one page per story | Easiest to share one story; fewer readers get through all four. |

**How much animation** (Jonathan's pick: playable diagram): static diagram (small) /
playable diagram (moderate) / moving trains (large, its own phase).

**How the page gets its words** (Jonathan's pick: MDX).

| | Approach | Trade-off |
|---|---|---|
| **Chosen** | Story text in an MDX file; numbers and charts placed by tags that read the nightly JSON | Jonathan can rewrite the stories without touching React; a little more wiring. |
| | Text written into a React page with numbers interpolated | Simplest wiring; every wording change is a code edit. |
| | The pipeline writes finished sentences | Rewording means changing pipeline code and waiting a night. Dropped. |

## 8. How it's built

### Tracker (caltrain-tracker, `src/pipeline`)

1. **Richer arrivals.** The nightly `arrivals` table gains the columns the notebooks
   derive in `analysis/build_dataset.py`: signed delay, closest-approach distance, stop
   rank within the trip, number of stops, route (service type) and direction. Existing
   columns stay so nothing downstream breaks. Needs one `--full` rebuild (about 15 s
   today).
2. **Feed health.** A per-day table with the notebooks' feed-health statistics and the
   `bad_feed` and `partial_day` flags.
3. **One set of clean rules** in one module, used by the dashboard build and the stories
   build alike. The notebooks should import it too, so analysis and site can't drift.
4. **Dashboard files from clean arrivals.** Every dashboard JSON is computed from the
   clean subset with signed delay. `daily_performance.json` gains a per-day `bad_feed`
   flag so the site can grey those days out. `train_performance.json` gains each train's
   weekday late share at its last observed stop, with its run count, computed exactly as
   story 2's league table is.
5. **Additive rollout for the headline.** `stats.json` keeps its current fields and adds
   the cleaned headline alongside them (names left to the builder). Jonathan pulls tracker
   changes on the server themself, so the site and the data deploy at different times: the
   site must never show a cleaned number under the old label or the reverse. The site
   switches field and label in one change; the legacy fields are removed in a later
   cleanup once both sides are live.
6. **Network-stop detector** (`05_network_stops` Detectors A and B) runs nightly on the
   raw pings and produces the events table used by story 3 and the dashboard.
7. **Stories step.** Computes each story's chart data, every figure its text quotes, and
   its claim check, and writes them with a "data through" date. Also writes the example
   day's trajectories (§6).
8. **Export.** `scripts/export_to_website.py` copies the new files to the site alongside
   the dashboard files.
9. **Tests** in the existing style (`tests/pipeline_fixtures.py`): clean rules, feed-health
   flags, each story's computation and claim check on small fixtures, the detector on a
   synthetic freeze.
10. **Budget.** The nightly build takes about 37 s today and runs with a 1 GB DuckDB memory
    cap on a shared host. Keep it within a few minutes under the same cap; compute
    incrementally where a full pass is slow.

### Site (this repo)

1. **Stories page** at `/projects/caltrain-tracker/stories/`. A server component reads the
   stories JSON at build time. Text lives in one MDX file (location left to the builder,
   inside `content/` so the confidentiality check scans it).
2. **MDX tags**: one to insert a figure by name (formatted for display), one per chart, one
   for the claim-check note.
3. **Code problems fail; data problems don't** *(Claude's call)*. A tag or figure name that
   isn't in the stories schema is a code bug: a test renders the MDX against fixture JSON,
   so it fails `npm test` and the build before it can merge. A missing or invalid stories
   file is a data problem and must not block the nightly deploy (the dashboard and
   homepage card would stop updating). In that case the build succeeds, logs a warning,
   the stories page shows a short "stories are being refreshed" note instead of its
   figures and charts, and the links to it from the homepage card, write-up, dashboard and
   projects page are not rendered.
4. **Staleness notice** *(Claude's call)*. The site only rebuilds when the export commits,
   so a stopped pipeline can't be noticed at build time. A small client-side check on the
   stories page and the dashboard compares the "data through" date with today and, after
   3 days, says when the tracker last reported.
5. **Charts** are hand-built SVG React components in the Field notes palette, following
   dark mode through the existing CSS variables (`src/app/globals.css`,
   `src/components/caltrain/palette.ts`). Each has a caption and a text alternative.
6. **Dashboard updates.**
   - Hero: the headline from the cleaned field, labeled plainly as the share of arrivals
     within 4 minutes; "all stops, unadjusted" goes.
   - Daily chart and calendar: bad-feed days greyed and marked "feed unreliable".
   - Incident panel: drop the "root cause station/train" labels, which are wrong most of
     the time (they name San Jose Diridon for 6 Nov 2025, when the line closed near Palo
     Alto). Where the network-stop detector fires on a day, show where trains were held
     instead.
   - Methodology section: describe the clean rules.
   - A link to the stories page.
   - Train leaderboard: a second column, "late at last stop seen (weekdays)", next to the
     all-stops figure.
   - Section anchors so stories can link to them.
7. **Homepage card and write-up.** The card shows the cleaned figure with the new label
   and links to the stories. The write-up's caveat section is rewritten to explain the
   clean measure, and its "Next: stories" section becomes a link to the page.
8. **Projects page and sitemap** list the stories page.
9. `npm run check:content` and `npm test` pass before every commit.

### Order

1. **Tracker first.** The tracker changes merge, Jonathan pulls them on the server, and the
   nightly export starts shipping the new files. The stories step validates its own output
   before writing; if a story fails to compute, it logs an error and leaves the previous
   file in place (writes are already atomic), so the export keeps shipping the last good
   one.
2. **Launch gate.** Before the site change merges, a full tracker build on a fresh copy of
   the server's database must produce the cleaned headline and all four claim checks
   passing. If a claim fails on current data, the story goes back to Jonathan before
   launch rather than shipping with its "no longer holds" note on day one.
3. **Site.** It can merge before or after the server pull, because of the additive rollout
   and the "data problems don't fail the build" rule (§8 site 3); until the stories file
   exists the page isn't linked from anywhere. Its tests use fixtures.

**Development data** *(Claude's call)*: a fresh read-only snapshot of the server's
database, taken on the server with Python's `sqlite3` backup API (the live file is being
written every minute) and copied down. The local copy is from December 2025.

**Branch** *(Claude's call)*: the site work builds on the unmerged redesign branch. Its
pull request targets `master` if the redesign has merged by then, and otherwise stacks on
the redesign branch. Netlify deploys `master`, so nothing goes live before the redesign does.

## 9. Constraints

- Both repos are public. Nothing this project commits may contain internal employer
  details, private paths, or server hostnames and addresses. (The tracker repo already has
  a few of the latter in existing files; cleaning those up is a separate task.)
- `public/data/caltrain/` is overwritten nightly by the tracker's export; never hand-edit it.
- The site build may not depend on network calls.
- WCAG AA contrast in both themes, keyboard navigable, respects `prefers-reduced-motion`
  (as the overhaul design requires).
- The redesign this builds on is on `claude/website-overhaul-review-f66afd`, not yet
  merged to `master`.

## 10. Anti-goals

- The dashboard and the stories disagreeing about a number or a definition.
- A chart that quietly contradicts the text above it.
- Stating a cause as fact when it's inferred.
- A stale "data through" date, or a page that looks abandoned when the pipeline stops.
- Looking like a generic chart template rather than the Field notes look.

## 11. Left to the builder

- JSON schema and file names for the stories export, and the names of the new
  `stats.json` fields.
- MDX tag names and file location, number formatting, chart component structure.
- Which supporting chart story 2 uses (§5).
- Incremental vs full recomputation for the detector and stories, within the time budget.
- Exact copy, in Jonathan's voice; Jonathan edits the MDX before launch.

## 12. Decisions log

| Decision | Who | Outcome |
|---|---|---|
| Dashboard | Jonathan | Keep it, updated |
| Stories | Jonathan | A separate page |
| Audience | Jonathan | Curious about Caltrain, their commute, or pretty data telling a story |
| Stories chosen | Jonathan | Ten minutes late stays late; fastest trains least reliable; a few bad afternoons; Saturday |
| Headline measure | Jonathan | Per stop, cleaned |
| Data freshness | Jonathan | Nightly |
| Animation | Jonathan | Playable time-distance diagram |
| Page format | Jonathan | Long read with headline strip |
| Text wiring | Jonathan | MDX with data tags |
| Page URL `/projects/caltrain-tracker/stories/` | Claude | §1 |
| Every dashboard chart moves to the clean measure | Claude | §4, §8 |
| Bad-feed days greyed, not hidden; headline covers all days | Claude | §4 |
| Claim checks with a dated note instead of hiding a story | Claude | §5 |
| Root-cause labels dropped from the incident panel | Claude | §8 |
| Hand-built SVG charts, not Recharts | Claude | §8 |
| Additive `stats.json` rollout | Claude | §8 |
| Code problems fail the build; data problems show a note and keep deploying | Claude | §8 |
| Hour means scheduled hour on the dashboard too | Claude | §4 |
| Story 2's claim check: weekday, per stop, all hours | Claude | §5 |
| Story 2 quotes trains at their last observed stop; leaderboard gets a matching column | Jonathan | §5, §8 |
| Client-side staleness notice after 3 days | Claude | §8 |
| Launch gate: all four claims hold on fresh data | Claude | §8 |
| Fresh database snapshot via the backup API; site branch stacks on the redesign | Claude | §8 |
