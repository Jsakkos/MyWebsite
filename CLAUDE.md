# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Personal website of Jonathan K. Sakkos (jonathanksakkos.com), built with Next.js 16 (App Router), TypeScript, and Tailwind CSS v4. Visual direction: "Field notes" (cream paper, Newsreader serif, cyanobacteria green). It serves hiring managers, collaborators, and Jonathan himself, and hosts the Caltrain performance dashboard.

**This repo is public.** Anything committed is public, including comments, tests and commit messages.

## Development Commands

- `npm run dev`: local dev server (http://localhost:3000). Draft notes are visible here only.
- `npm test`: Vitest unit tests (`tests/**/*.test.ts`)
- `npm run lint`: ESLint
- `npm run check:content`: confidentiality check (also runs automatically before `npm run build`)
- `npm run build` / `npm start`: production build and server

## Project Structure

- `content/profile.json`: **all career facts** (role, work history, pillars, projects, publications, patents, talks). Validated by the zod schema in `src/lib/content.ts`; a bad file fails the build.
- `content/notes/*.mdx`: Notes posts. Frontmatter: `title`, `date` (YYYY-MM-DD), `summary`, optional `draft: true`. Drafts never ship in production, and Notes is hidden from the nav until one post is published.
- `src/app`: pages (`/`, `/work`, `/resume`, `/projects`, `/projects/caltrain-tracker`, `/projects/caltrain-tracker/dashboard`, `/publications`, `/notes`, `/contact`)
- `src/lib`: `content.ts` (profile loader), `notes.ts`, `format.ts` (dates, DOIs, author names), `metadata.ts` (`pageMetadata`, `SITE_URL`), `nav.ts`, `redirects.ts`, `caltrain-snapshot.ts`, `contact.ts`, `api.ts` (Caltrain data types and loaders)
- `src/components`: site shell (`site-header`, `site-footer`, `theme-toggle`), `ui.tsx` (Label, SectionHeading, TextLink, PageIntro), `caltrain/*` dashboard components with one palette in `caltrain/palette.ts`
- `public/data/caltrain/*.json`: written nightly by the caltrain-tracker repo's export job. Don't edit by hand or change its format here.
- `scripts/check-public-content.mjs`: the confidentiality check
- `scripts/og-image.html`: template for `public/og-image.png`

## Content rules

- Career facts come from Jonathan's Master Resume (kept in his private notes; read-only from here). Regenerate `content/profile.json` from it by hand, applying the public-safe rules: no internal project codes or document numbers, customer or vendor names, dollar figures, review content, private repo names, family or pet names, or homelab hostnames. Internal metrics are written qualitatively ("multi-fold", "several times faster").
- Prose that appears on the site belongs in `content/` (profile fields or MDX), where the confidentiality check scans it.
- Never create `public/resume.json`; the check fails if it exists.
- The confidentiality check reads named terms from a local, gitignored `.content-denylist` (one per line). Never commit that file or write its terms anywhere in the repo.

## Design system

- Tokens are CSS variables in `src/app/globals.css` (`:root` and `.dark`), exposed to Tailwind via `@theme inline`: `paper`, `paper-2`, `ink`, `ink-2`, `muted`, `rule`, `accent`, `accent-strong`, `ontime`, `minor`, `major`, plus `--chart-*` and `--series-*` for charts. Use token classes (`bg-paper`, `text-ink-2`, `border-rule`), not raw Tailwind colors, and no `dark:` color pairs; the tokens switch themes on their own.
- `tests/styles/tokens.test.ts` checks WCAG AA contrast for both themes. Run it after changing colors.
- Fonts: Newsreader (`font-serif`, headings and italic accents), Inter (`font-sans`, body), IBM Plex Mono (`font-mono`, data figures). Avoid typefaces whose capital J hooks below the baseline.
- Long-form text uses `prose prose-field` (typography plugin mapped to tokens).
- Dynamic route `params` are Promises in Next 16: always `await params`.

## Regenerating assets

- **Resume PDF** (`public/files/jonathan-sakkos-resume.pdf`): build and start the site, open `/resume/`, and print to PDF (US Letter, no headers or backgrounds). It must fit on two pages.
- **Link preview** (`public/og-image.png`): screenshot `scripts/og-image.html` at 1200×630.

## Deployment

Netlify builds `master` (`netlify.toml`). Redirects live in `src/lib/redirects.ts` and are wired through `next.config.ts`; `netlify.toml` only sets headers.
