# Gemini Project Context: Snugug Blog

## Overview

This is a personal blog site built with **Astro** and **Svelte**. The project uses **Sass** for styling and **Astro Content Collections** for managing content (posts, recipes, pages, categories). It includes PWA capabilities via `vite-plugin-pwa`.

## Tech Stack

- **Framework:** Astro 5
- **UI Library:** Svelte 5
- **Styling:** SCSS (`src/sass`)
- **Package Manager:** pnpm
- **Content:** Local Markdown files via Astro Content Collections (`src/content`)
- **PWA:** `vite-plugin-pwa`

## Project Structure

- `src/content/`: Markdown content for collections (posts, recipes, etc.).
- `src/components/`: Svelte and Astro components.
- `src/pages/`: Astro pages/routes.
- `src/sass/`: Global and component-specific SCSS.
- `src/content.config.ts`: Configuration for Astro Content Collections.
- `lib/`: Utility scripts, including `tweetback` for Twitter archive imports.
- `astro.config.mjs`: Astro configuration.

## Key Commands

- **Development:** `pnpm dev` (starts Astro dev server)
- **Build:** `pnpm build` (builds the site for production)
- **Preview:** `pnpm preview` (previews the build)
- **Import Data:** `pnpm run import` (runs `lib/tweetback/import.js`)
- **Lint/Fix:** `pnpm lint`, `pnpm fix`

## Conventions

- **PR Titles:** Follow the emoji convention defined in `README.md` (e.g., `🐛(site) Fix layout`).
- **Styling:** Use SCSS. Global styles are in `src/sass/global`.
- **Content:** New content should be added as Markdown files in `src/content/{collection_name}`.

## Notes

- `src/content.config.ts` defines schemas for `categories`, `pages`, `posts`, and `recipes`.
