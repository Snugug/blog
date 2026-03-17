# Astro Collections Plugin Design

Expose `.astro/collections/*.schema.json` files to client-side JavaScript via a symlink into `public/` and a virtual module that maps collection names to fetch-ready URLs.

## Architecture

Single Astro integration (`lib/collections-plugin.ts`) registered in `astro.config.mjs`. It injects one Vite plugin via `updateConfig()` in the `astro:config:setup` hook. That Vite plugin handles both concerns: symlink management and virtual module resolution.

## Symlink Management

In the Vite plugin's `buildStart` hook (fires after `astro sync` for both dev and build):

1. If `.astro/collections` does not exist, skip symlink creation and log a warning -- this handles fresh clones or CI environments where sync hasn't run yet
2. Check if `public/collections` exists and is a valid symlink to `.astro/collections`
3. If missing or broken, create a relative symlink (`../.astro/collections` -> `public/collections`)
4. `public/collections` is added to `.gitignore`

Relative symlink path keeps it portable across machines.

## Virtual Module: `virtual:collections`

Registered via `resolveId`/`load` hooks in the Vite plugin. The `load()` function runs lazily at import time (after sync has completed), reads `.astro/collections/`, finds all `*.schema.json` files, and generates the module. If `.astro/collections/` does not exist, returns an empty object and logs a warning.

```ts
export default {
  posts: '/collections/posts.schema.json',
  categories: '/collections/categories.schema.json',
  pages: '/collections/pages.schema.json',
  recipes: '/collections/recipes.schema.json',
};
```

Keys derived from filenames (strip `.schema.json`). Values are site-root-relative URLs served from `public/collections/`.

Type declarations provided in `lib/collections-plugin.d.ts`:

```ts
declare module 'virtual:collections' {
  const schemas: Record<string, string>;
  export default schemas;
}
```

## Sample Page

- **Page**: `src/pages/schemas.astro` -- uses `Donut` layout with `title="Schema Explorer"` and `summary="Developer tool for browsing content collection JSON schemas"`, renders `SchemaLog` component with `client:only="svelte"`
- **Component**: `src/components/SchemaLog.svelte` -- on mount, imports `virtual:collections`, fetches each schema, logs parsed JSON to console

## Files to Create/Modify

| File | Action |
|------|--------|
| `lib/collections-plugin.ts` | Create -- integration + Vite plugin |
| `lib/collections-plugin.d.ts` | Create -- type declarations for virtual module |
| `astro.config.mjs` | Modify -- add `collections()` to integrations |
| `.gitignore` | Modify -- add `public/collections` |
| `src/pages/schemas.astro` | Create -- sample page |
| `src/components/SchemaLog.svelte` | Create -- sample component |
