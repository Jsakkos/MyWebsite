[![Netlify Status](https://api.netlify.com/api/v1/badges/96c68816-5ef0-4fea-98a7-d5492305e6a6/deploy-status)](https://app.netlify.com/sites/vibrant-lumiere-c7de04/deploys)

# jonathanksakkos.com

Personal site of Jonathan K. Sakkos, Staff Engineer in Spatial Genomics R&D at Takara Bio USA. Built with Next.js 16, TypeScript and Tailwind CSS v4, deployed on Netlify.

## What's here

- **Home, Work, Resume:** who I am, what I do, and a printable two-page resume
- **Projects:** Engram, PhotoSift, lr-autotag, the Caltrain tracker, small hardware builds, research tools
- **Caltrain dashboard:** on-time performance, delay patterns and incident diagrams, refreshed nightly from the [caltrain-tracker](https://github.com/Jsakkos/caltrain-tracker) pipeline
- **Papers:** 15 peer-reviewed papers, patents and talks
- **Notes:** occasional write-ups (MDX)

## Development

```bash
npm install
npm run dev      # http://localhost:3000
npm test         # unit tests (Vitest)
npm run lint
npm run build    # runs the confidentiality check first
```

## How content works

- Career facts live in `content/profile.json`, validated at build time by `src/lib/content.ts`. Every page reads from it, so facts can't drift between pages.
- Notes are MDX files in `content/notes/`. Set `draft: true` to keep a post out of production.
- Caltrain data in `public/data/caltrain/` is committed nightly by the tracker's export job.
- `npm run check:content` blocks internal details (project codes, dollar figures, and a local list of names kept in the gitignored `.content-denylist`) from reaching this public repo.

## Design

"Field notes": cream paper, Newsreader for headings, Inter for text, cyanobacteria green. Colors are CSS variables in `src/app/globals.css` with light and dark values, checked for WCAG AA contrast by `tests/styles/tokens.test.ts`.

See `CLAUDE.md` for conventions, and `docs/superpowers/specs/` for the design behind the 2026 rebuild.
