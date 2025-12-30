# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a professional personal website built with Next.js 16 (App Router), TypeScript, and Tailwind CSS. It showcases biotech engineering expertise, technical projects, and real-time data integrations (Caltrain tracker).

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS (v4), clsx, tailwind-merge
- **Content**: MDX for blog posts
- **Icons**: Lucide React
- **Deployment**: Netlify

## Development Commands

- `npm run dev`: Start local development server (http://localhost:3000)
- `npm run build`: Build for production
- `npm start`: Start production server locally
- `npm run lint`: Run ESLint

## Project Structure

- `src/app`: Next.js App Router pages and layouts
- `src/components`: Reusable React components
- `src/lib`: Utility functions, types, and data access (resume.ts)
- `content/posts`: MDX files for blog posts
- `public`: Static assets (images, resume.json)

## Coding Conventions

- **Components**: Functional components with TypeScript interfaces for props.
- **Styling**: Use Tailwind utility classes. For complex class logic, use `clsx` and `tailwind-merge`.
- **Types**: Define interfaces for data structures (e.g., in `src/lib/resume.ts`).
- **Icons**: Use `lucide-react` for icons.
- **Dark Mode**: Support dark mode using `next-themes` (check `src/app/layout.tsx` or theme provider).

## Important Files

- `src/lib/resume.ts`: Type definitions and loader for resume data.
- `public/resume.json`: The source of truth for portfolio data.
- `next.config.ts`: Next.js configuration (MDX setup, trailing slashes).
- `netlify.toml`: Deployment and redirect configuration.
