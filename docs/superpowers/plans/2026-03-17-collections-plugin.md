# Collections Plugin Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create an Astro integration that exposes `.astro/collections/*.schema.json` to client-side JavaScript via a public symlink and a `virtual:collections` module.

**Architecture:** Single Astro integration in `lib/collections-plugin.ts` registers one Vite plugin via `updateConfig()` in `astro:config:setup`. That Vite plugin manages both the symlink (in `buildStart`) and the virtual module (`resolveId`/`load`). A sample page and Svelte component demonstrate usage.

**Tech Stack:** Astro 6.x integration API, Vite plugin API, Node.js `fs` for symlinks, Svelte 5 for demo component.

**Spec:** `docs/superpowers/specs/2026-03-17-collections-plugin-design.md`

---

## Chunk 1: Core Plugin

### Task 1: Create the integration and Vite plugin

**Files:**
- Create: `lib/collections-plugin.ts`

- [ ] **Step 1: Create `lib/collections-plugin.ts`**

This file exports a function that returns an Astro integration. The integration uses `astro:config:setup` to inject a Vite plugin with three capabilities: symlink management (`buildStart`), virtual module resolution (`resolveId`), and virtual module content generation (`load`).

```ts
import { existsSync, lstatSync, readlinkSync, readdirSync, symlinkSync, unlinkSync } from 'node:fs';
import { resolve, relative, dirname } from 'node:path';
import type { AstroIntegration, AstroIntegrationLogger } from 'astro';

/** Vite virtual module ID for collection schema paths */
const VIRTUAL_ID = 'virtual:collections';
/** Vite convention: resolved virtual IDs are prefixed with \0 */
const RESOLVED_ID = '\0' + VIRTUAL_ID;

/**
 * Astro integration that exposes content collection JSON schemas to client-side JavaScript.
 * Creates a symlink from public/collections -> .astro/collections and provides
 * a virtual module mapping collection names to their fetch-ready schema URLs.
 * @returns Astro integration config
 */
export default function collections(): AstroIntegration {
  return {
    name: 'collections',
    hooks: {
      'astro:config:setup': ({ updateConfig, logger }) => {
        updateConfig({
          vite: {
            plugins: [collectionsVitePlugin(logger)],
          },
        });
      },
    },
  };
}

/**
 * Vite plugin that handles symlink creation and virtual module resolution.
 * @param logger - Astro integration logger for warnings
 * @returns Vite plugin config
 */
function collectionsVitePlugin(logger: AstroIntegrationLogger) {
  return {
    name: 'vite-plugin-collections',

    /**
     * Creates symlink from public/collections to .astro/collections.
     * Runs after astro sync has generated the schema files.
     */
    buildStart() {
      const root = process.cwd();
      const source = resolve(root, '.astro/collections');
      const target = resolve(root, 'public/collections');

      // Guard: skip if .astro/collections doesn't exist yet
      if (!existsSync(source)) {
        logger.warn('`.astro/collections` not found — skipping symlink. Run `pnpm sync` first.');
        return;
      }

      // Check if something already exists at the target path.
      // Uses lstatSync instead of existsSync because existsSync follows symlinks
      // and returns false for broken symlinks, which would cause symlinkSync to
      // throw EEXIST on dangling links.
      let targetStat: ReturnType<typeof lstatSync> | null = null;
      try { targetStat = lstatSync(target); } catch { /* doesn't exist at all */ }

      if (targetStat !== null) {
        if (targetStat.isSymbolicLink()) {
          const linkTarget = resolve(dirname(target), readlinkSync(target));
          if (linkTarget === source) {
            return; // Symlink is correct, nothing to do
          }
        }
        // Wrong target, broken symlink, or not a symlink — remove it
        unlinkSync(target);
      }

      // Create relative symlink for portability
      const relPath = relative(dirname(target), source);
      symlinkSync(relPath, target);
    },

    /**
     * Resolves the virtual:collections import to a Vite-internal ID.
     * @param id - The import specifier
     * @returns Resolved ID if this is our virtual module
     */
    resolveId(id: string) {
      if (id === VIRTUAL_ID) return RESOLVED_ID;
    },

    /**
     * Generates the virtual module content by reading .astro/collections/.
     * Returns a mapping of collection name -> fetch URL for each schema file.
     * @param id - The resolved module ID
     * @returns Generated module source code
     */
    load(id: string) {
      if (id !== RESOLVED_ID) return;

      const root = process.cwd();
      const collectionsDir = resolve(root, '.astro/collections');

      // Guard: return empty object if directory doesn't exist
      if (!existsSync(collectionsDir)) {
        logger.warn('`.astro/collections` not found — virtual:collections will be empty.');
        return 'export default {};';
      }

      const files = readdirSync(collectionsDir).filter((f) => f.endsWith('.schema.json'));

      const entries = files.map((f) => {
        const name = f.replace('.schema.json', '');
        return `  ${JSON.stringify(name)}: ${JSON.stringify('/collections/' + f)}`;
      });

      return `export default {\n${entries.join(',\n')}\n};`;
    },
  };
}
```

- [ ] **Step 2: Verify the file was created**

Run: `ls -la lib/collections-plugin.ts`
Expected: File exists

- [ ] **Step 3: Commit**

```bash
git add lib/collections-plugin.ts
git commit -m "Add collections Astro integration and Vite plugin"
```

### Task 2: Create the type declarations for the virtual module

**Files:**
- Create: `lib/collections-plugin.d.ts`

- [ ] **Step 1: Create `lib/collections-plugin.d.ts`**

This provides TypeScript types for `virtual:collections` so imports resolve without errors in Svelte components and Astro pages. The `tsconfig.json` `include: ["**/*"]` glob picks this up automatically.

```ts
declare module 'virtual:collections' {
  /** Mapping of collection name to its fetch-ready schema URL */
  const schemas: Record<string, string>;
  export default schemas;
}
```

- [ ] **Step 2: Commit**

```bash
git add lib/collections-plugin.d.ts
git commit -m "Add type declarations for virtual:collections"
```

### Task 3: Register the integration and update gitignore

**Files:**
- Modify: `astro.config.mjs`
- Modify: `.gitignore`

- [ ] **Step 1: Add import and registration in `astro.config.mjs`**

Add the import after the existing `import path from 'node:path';` line:

```ts
import collections from './lib/collections-plugin';
```

Add `collections()` to the integrations array:

```ts
integrations: [svelte(), sitemap(), collections()],
```

- [ ] **Step 2: Add `public/collections` to `.gitignore`**

Append to the end of `.gitignore`:

```
# Symlink to .astro/collections (created by collections plugin)
public/collections
```

- [ ] **Step 3: Verify the config is valid**

Run: `pnpm sync`
Expected: Completes without errors

- [ ] **Step 4: Commit**

```bash
git add astro.config.mjs .gitignore
git commit -m "Register collections integration and gitignore symlink"
```

## Chunk 2: Sample Page

### Task 4: Create the SchemaLog Svelte component

**Files:**
- Create: `src/components/SchemaLog.svelte`

- [ ] **Step 1: Create `src/components/SchemaLog.svelte`**

Imports the virtual module, fetches each schema on mount, and logs the results. Uses `client:only` so the virtual module is only resolved client-side.

```svelte
<script>
  import { onMount } from 'svelte';
  import schemas from 'virtual:collections';

  /**
   * Fetches all content collection JSON schemas and logs them to the console.
   * Intended as a developer tool for inspecting schema structure.
   */
  onMount(async () => {
    for (const [name, url] of Object.entries(schemas)) {
      const res = await fetch(url);
      const schema = await res.json();
      console.log(name, schema);
    }
  });
</script>

<p>Check the console for schema output.</p>
```

- [ ] **Step 2: Commit**

```bash
git add src/components/SchemaLog.svelte
git commit -m "Add SchemaLog component for schema debugging"
```

### Task 5: Create the sample page

**Files:**
- Create: `src/pages/schemas.astro`

- [ ] **Step 1: Create `src/pages/schemas.astro`**

Uses the `Donut` layout with required `title` and `summary` props. Renders `SchemaLog` with `client:only="svelte"` since it needs browser APIs (`fetch`, `console`).

```astro
---
import Layout from '$layouts/Donut.astro';
import SchemaLog from '$components/SchemaLog.svelte';
---

<Layout
  title="Schema Explorer"
  summary="Developer tool for browsing content collection JSON schemas"
>
  <main>
    <SchemaLog client:only="svelte" />
  </main>
</Layout>
```

- [ ] **Step 2: Commit**

```bash
git add src/pages/schemas.astro
git commit -m "Add schema explorer sample page"
```

### Task 6: Verify end-to-end

- [ ] **Step 1: Check that the dev server is running, or start it**

First check if the dev server is already running (e.g., `lsof -i :4321` or `curl -s http://localhost:4321 > /dev/null`). Only run `pnpm dev` if it is not already running. Note: `pnpm dev` triggers a `predev` hook that runs `pnpm import` (tweet archive import), which may take a moment.

- [ ] **Step 2: Visit `http://localhost:4321/schemas` in a browser**

Expected:
- Page loads without errors
- Browser console shows 4 log entries (categories, pages, posts, recipes), each with their parsed JSON schema object

- [ ] **Step 3: Run lint and format**

Run: `pnpm lint`
Expected: No errors or warnings. If there are any, fix them.

Run: `pnpm format` (which is `pnpm prettier:fix`)
Expected: Files formatted. If any files changed, commit the formatting fixes.
