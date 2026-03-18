# CMS Admin Local Editing Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a client-side CMS admin at `/admin` that lets users pick a local project folder, browse content collections in a sidebar, and view content file listings with titles parsed from YAML frontmatter.

**Architecture:** Astro catch-all route serves an SPA shell. Svelte 5 components handle UI. Navigation API manages client-side routing. File System Access API reads the local filesystem. A Web Worker parses YAML frontmatter with js-yaml. Shared state lives in `.svelte.ts` reactive modules.

**Tech Stack:** Astro 6.x, Svelte 5 (runes), Navigation API, File System Access API, Web Workers, js-yaml, IndexedDB

**Spec:** `docs/superpowers/specs/2026-03-18-cms-admin-local-editing-design.md`

---

## Chunk 1: Dependencies, Cleanup, and Infrastructure

### Task 1: Add js-yaml dependency

**Files:**

- Modify: `package.json`

- [ ] **Step 1: Install js-yaml and its types**

```bash
pnpm add js-yaml
pnpm add -D @types/js-yaml @types/wicg-navigation-api
```

- [ ] **Step 2: Commit**

```bash
git add package.json pnpm-lock.yaml
git commit -m "Add js-yaml and Navigation API types"
```

### Task 2: Delete old schemas page and SchemaLog component

**Files:**

- Delete: `src/pages/schemas.astro`
- Delete: `src/components/SchemaLog.svelte`

- [ ] **Step 1: Delete the files**

```bash
rm src/pages/schemas.astro src/components/SchemaLog.svelte
```

- [ ] **Step 2: Commit**

```bash
git add -u src/pages/schemas.astro src/components/SchemaLog.svelte
git commit -m "Remove schemas page and SchemaLog, replaced by /admin"
```

### Task 3: Create the Astro catch-all route

**Files:**

- Create: `src/pages/admin/[...path].astro`

- [ ] **Step 1: Create `src/pages/admin/[...path].astro`**

This catch-all route serves the same SPA shell for all `/admin/*` URLs. Uses the `Donut` layout with `client:only="svelte"` on the Admin component. The `[...path]` rest parameter matches `/admin`, `/admin/posts`, `/admin/recipes/foo`, etc.

```astro
---
import Layout from '$layouts/Donut.astro';
import Admin from '$components/admin/Admin.svelte';
---

<Layout title="Admin" summary="Content management interface">
  <Admin client:only="svelte" />
</Layout>
```

- [ ] **Step 2: Commit**

```bash
git add src/pages/admin/\[...path\].astro
git commit -m "Add catch-all Astro route for admin SPA"
```

### Task 4: Create IndexedDB storage utility

**Files:**

- Create: `src/js/admin/storage.ts`

- [ ] **Step 1: Create `src/js/admin/storage.ts`**

Minimal IndexedDB wrapper for persisting and retrieving a `FileSystemDirectoryHandle`. Uses a single object store with a fixed key.

```ts
/**
 * Database name for admin CMS persistence
 */
const DB_NAME = 'cms-admin';
/** Database version */
const DB_VERSION = 1;
/** Object store for directory handles */
const STORE_NAME = 'handles';
/** Fixed key for the project root handle */
const HANDLE_KEY = 'projectRoot';

/**
 * Opens the IndexedDB database, creating the object store if needed.
 * @returns Promise resolving to the database instance
 */
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Stores a FileSystemDirectoryHandle in IndexedDB for persistence across sessions.
 * @param handle - The directory handle to store
 */
export async function saveHandle(
  handle: FileSystemDirectoryHandle,
): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).put(handle, HANDLE_KEY);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

/**
 * Retrieves a previously stored FileSystemDirectoryHandle from IndexedDB.
 * @returns The stored handle, or null if none exists
 */
export async function loadHandle(): Promise<FileSystemDirectoryHandle | null> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const request = tx.objectStore(STORE_NAME).get(HANDLE_KEY);
    request.onsuccess = () => resolve(request.result ?? null);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Removes the stored directory handle from IndexedDB.
 */
export async function clearHandle(): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).delete(HANDLE_KEY);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}
```

- [ ] **Step 2: Commit**

```bash
git add src/js/admin/storage.ts
git commit -m "Add IndexedDB storage utility for directory handle persistence"
```

### Task 5: Create the SPA router

**Files:**

- Create: `src/js/admin/router.svelte.ts`

- [ ] **Step 1: Create `src/js/admin/router.svelte.ts`**

Uses the Navigation API to intercept navigations under `/admin/`. Exposes reactive state for the current route. Handles initial page load by reading `location.pathname` directly (the Navigation API does not fire a `navigate` event on first load).

```ts
/** Parsed route state for the admin SPA */
export type AdminRoute =
  | { view: 'home' }
  | { view: 'collection'; collection: string };

/** Current route, reactive via Svelte 5 runes */
let route = $state<AdminRoute>(parsePathname(location.pathname));

/**
 * Parses a pathname into an AdminRoute.
 * @param pathname - The URL pathname to parse
 * @returns The parsed route object
 */
function parsePathname(pathname: string): AdminRoute {
  const segments = pathname
    .replace(/^\/admin\/?/, '')
    .split('/')
    .filter(Boolean);
  if (segments.length > 0) {
    return { view: 'collection', collection: segments[0] };
  }
  return { view: 'home' };
}

/**
 * Returns the current admin route (reactive).
 * @returns The current AdminRoute
 */
export function getRoute(): AdminRoute {
  return route;
}

/**
 * Navigates to a path within the admin SPA.
 * Uses the Navigation API to update the URL without a full page reload.
 * @param path - The path to navigate to (e.g., '/admin/posts')
 */
export function navigate(path: string): void {
  navigation.navigate(path);
}

/** Guard against duplicate listener registration (e.g., HMR remount) */
let initialized = false;

/**
 * Initializes the Navigation API listener.
 * Intercepts navigations under /admin/ and updates the reactive route state.
 * Safe to call multiple times -- only registers the listener once.
 */
export function initRouter(): void {
  if (initialized) return;
  initialized = true;

  navigation.addEventListener('navigate', (event) => {
    const url = new URL(event.destination.url);

    // Only intercept navigations within /admin/
    if (!url.pathname.startsWith('/admin')) return;

    // Don't intercept downloads or hash-only changes
    if (event.hashChange || event.downloadRequest) return;

    if (!event.canIntercept) return;

    event.intercept({
      handler() {
        route = parsePathname(url.pathname);
      },
    });
  });
}
```

- [ ] **Step 2: Commit**

```bash
git add src/js/admin/router.svelte.ts
git commit -m "Add Navigation API SPA router for admin"
```

### Task 6: Create the frontmatter Web Worker

**Files:**

- Create: `src/js/admin/frontmatter-worker.ts`

- [ ] **Step 1: Create `src/js/admin/frontmatter-worker.ts`**

Web Worker that receives a `FileSystemDirectoryHandle` (serialized via structured clone) and a collection name. Traverses to `src/content/{collection}/`, reads `.md` files, extracts YAML frontmatter, and returns title + filename pairs.

```ts
import { load } from 'js-yaml';

/**
 * Extracts YAML frontmatter from a markdown string.
 * Handles edge cases informed by gray-matter: BOM stripping, horizontal rule
 * rejection (----), \r\n line endings, and empty/missing frontmatter.
 * @param content - Raw markdown file content
 * @returns Parsed frontmatter object, or null if no valid frontmatter found
 */
function extractFrontmatter(content: string): Record<string, unknown> | null {
  // Strip BOM if present
  let str = content.startsWith('\uFEFF') ? content.slice(1) : content;

  // Normalize line endings
  str = str.replace(/\r\n/g, '\n');

  // Reject ---- (horizontal rule) before checking for valid frontmatter opener
  if (str.startsWith('----')) return null;
  if (!str.startsWith('---\n')) return null;

  // Find closing delimiter
  const closeIndex = str.indexOf('\n---\n', 3);
  if (closeIndex === -1) {
    // Check for --- at end of file with no trailing newline
    if (str.endsWith('\n---')) {
      const yaml = str.slice(4, str.length - 4);
      if (!yaml.trim()) return null;
      return (load(yaml) as Record<string, unknown>) ?? null;
    }
    return null;
  }

  const yaml = str.slice(4, closeIndex);
  if (!yaml.trim()) return null;

  return (load(yaml) as Record<string, unknown>) ?? null;
}

/**
 * Traverses from the project root handle to src/content/{collection}/.
 * @param root - The project root directory handle
 * @param collection - The collection name
 * @returns The directory handle for the collection's content folder
 */
async function getCollectionDir(
  root: FileSystemDirectoryHandle,
  collection: string,
): Promise<FileSystemDirectoryHandle> {
  const src = await root.getDirectoryHandle('src');
  const content = await src.getDirectoryHandle('content');
  return content.getDirectoryHandle(collection);
}

/**
 * Worker message handler. Receives parse requests with a directory handle
 * and collection name, reads .md files, extracts frontmatter titles.
 */
self.addEventListener('message', async (event) => {
  const { type, handle, collection } = event.data;
  if (type !== 'parse') return;

  try {
    const dir = await getCollectionDir(handle, collection);
    const items: Array<{ filename: string; title: string | null }> = [];

    for await (const [name, entry] of dir.entries()) {
      if (entry.kind !== 'file' || !name.endsWith('.md')) continue;

      const file = await entry.getFile();
      const text = await file.text();
      const frontmatter = extractFrontmatter(text);
      const title =
        frontmatter && typeof frontmatter.title === 'string'
          ? frontmatter.title
          : null;

      items.push({ filename: name, title });
    }

    // Sort alphabetically by title, falling back to filename
    items.sort((a, b) => {
      const aKey = (a.title ?? a.filename).toLowerCase();
      const bKey = (b.title ?? b.filename).toLowerCase();
      return aKey.localeCompare(bKey);
    });

    self.postMessage({ type: 'result', items });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    self.postMessage({ type: 'error', message });
  }
});
```

- [ ] **Step 2: Commit**

```bash
git add src/js/admin/frontmatter-worker.ts
git commit -m "Add frontmatter parsing web worker"
```

### Task 7: Create the shared state module

**Files:**

- Create: `src/js/admin/state.svelte.ts`

- [ ] **Step 1: Create `src/js/admin/state.svelte.ts`**

Central reactive state for the admin. Owns the Web Worker lifecycle. When `selectedCollection` changes, dispatches the directory handle to the worker. Components read from this state directly.

```ts
import schemas from 'virtual:collections';
import { loadHandle, saveHandle, clearHandle } from './storage';
import { getRoute, navigate } from './router.svelte';

/** Content list item returned by the worker */
export type ContentItem = {
  filename: string;
  title: string | null;
};

/** Permission state for the stored directory handle */
type PermissionState = 'granted' | 'prompt' | 'denied';

/** Collection names derived from virtual:collections, sorted alphabetically */
const collectionNames = Object.keys(schemas).sort();

/** The project root directory handle */
let directoryHandle = $state<FileSystemDirectoryHandle | null>(null);
/** Current permission state -- starts as 'denied' to show picker until restore completes */
let permissionState = $state<PermissionState>('denied');
/** Content items for the selected collection */
let contentList = $state<ContentItem[]>([]);
/** Error message, or null if no error */
let error = $state<string | null>(null);
/** Whether the worker is currently parsing */
let loading = $state(false);

/** Singleton web worker instance */
let worker: Worker | null = null;

/**
 * Returns the sorted list of collection names.
 * @returns Array of collection name strings
 */
export function getCollections(): string[] {
  return collectionNames;
}

/**
 * Returns the current directory handle (reactive).
 * @returns The FileSystemDirectoryHandle or null
 */
export function getDirectoryHandle(): FileSystemDirectoryHandle | null {
  return directoryHandle;
}

/**
 * Returns the current permission state (reactive).
 * @returns The current PermissionState
 */
export function getPermissionState(): PermissionState {
  return permissionState;
}

/**
 * Returns the content list for the selected collection (reactive).
 * @returns Array of ContentItem
 */
export function getContentList(): ContentItem[] {
  return contentList;
}

/**
 * Returns the current error message (reactive).
 * @returns Error string or null
 */
export function getError(): string | null {
  return error;
}

/**
 * Returns whether the worker is currently loading (reactive).
 * @returns Boolean loading state
 */
export function isLoading(): boolean {
  return loading;
}

/**
 * Initializes the worker and sets up message handling.
 */
function ensureWorker(): Worker {
  if (worker) return worker;
  worker = new Worker(new URL('./frontmatter-worker.ts', import.meta.url), {
    type: 'module',
  });
  worker.addEventListener('message', (event) => {
    const data = event.data;
    if (data.type === 'result') {
      contentList = data.items;
      loading = false;
      error = null;
    } else if (data.type === 'error') {
      error = data.message;
      loading = false;
      contentList = [];
    }
  });
  return worker;
}

/**
 * Dispatches a parse request to the worker for the given collection.
 * @param collection - The collection name to parse
 */
function dispatchWorker(collection: string): void {
  if (!directoryHandle) return;
  loading = true;
  error = null;
  contentList = [];
  const w = ensureWorker();
  w.postMessage({ type: 'parse', handle: directoryHandle, collection });
}

/**
 * Attempts to restore a stored directory handle from IndexedDB
 * and check its permission state.
 * @returns Promise that resolves when restoration is complete
 */
export async function restoreHandle(): Promise<void> {
  try {
    const stored = await loadHandle();
    if (!stored) {
      permissionState = 'denied';
      return;
    }

    const perm = await stored.queryPermission({ mode: 'read' });
    directoryHandle = stored;
    permissionState = perm;

    if (perm === 'granted') {
      navigateToFirstCollection();
    }
  } catch {
    permissionState = 'denied';
  }
}

/**
 * Requests read permission on the stored handle.
 * MUST be called from a user gesture handler (click).
 * @returns Promise that resolves when permission check is complete
 */
export async function requestPermission(): Promise<void> {
  if (!directoryHandle) return;
  try {
    const perm = await directoryHandle.requestPermission({ mode: 'read' });
    permissionState = perm;
    if (perm === 'granted') {
      navigateToFirstCollection();
    }
  } catch {
    permissionState = 'denied';
  }
}

/**
 * Opens the directory picker, stores the handle, and navigates to admin.
 * MUST be called from a user gesture handler (click).
 * @returns Promise that resolves when pick and navigation are complete
 */
export async function pickDirectory(): Promise<void> {
  try {
    const handle = await window.showDirectoryPicker({ mode: 'read' });
    directoryHandle = handle;
    permissionState = 'granted';
    await saveHandle(handle);
    navigateToFirstCollection();
  } catch (err) {
    // AbortError = user cancelled, silently ignore
    if (err instanceof DOMException && err.name === 'AbortError') return;
    error = err instanceof Error ? err.message : String(err);
  }
}

/**
 * Clears the stored handle, terminates the worker, and resets state.
 * @returns Promise that resolves when cleanup is complete
 */
export async function disconnect(): Promise<void> {
  worker?.terminate();
  worker = null;
  await clearHandle();
  directoryHandle = null;
  permissionState = 'denied';
  contentList = [];
  error = null;
  loading = false;
  navigate('/admin');
}

/**
 * Navigates to the first collection alphabetically.
 */
function navigateToFirstCollection(): void {
  if (collectionNames.length > 0) {
    navigate(`/admin/${collectionNames[0]}`);
  }
}

/**
 * Call when the selected collection changes to trigger worker parsing.
 * @param collection - The collection name to load
 */
export function loadCollection(collection: string): void {
  dispatchWorker(collection);
}
```

- [ ] **Step 2: Commit**

```bash
git add src/js/admin/state.svelte.ts
git commit -m "Add shared reactive state module for admin"
```

## Chunk 2: UI Components

### Task 8: Create the DirectoryPicker component

**Files:**

- Create: `src/components/admin/DirectoryPicker.svelte`

- [ ] **Step 1: Create `src/components/admin/DirectoryPicker.svelte`**

Renders a button to open the directory picker, or a re-authorize button if permission needs re-granting. Also handles the error display for permission issues.

```svelte
<script>
  import {
    getDirectoryHandle,
    getPermissionState,
    getError,
    pickDirectory,
    requestPermission,
  } from '$js/admin/state.svelte';

  /** Whether the stored handle needs re-authorization */
  const needsReauth = $derived(
    getDirectoryHandle() !== null && getPermissionState() === 'prompt',
  );

  /** Whether to show the initial picker */
  const showPicker = $derived(
    getDirectoryHandle() === null || getPermissionState() === 'denied',
  );
</script>

<div class="picker">
  {#if needsReauth}
    <p>This folder requires re-authorization to continue.</p>
    <button onclick={requestPermission}>Re-authorize folder</button>
  {:else if showPicker}
    <p>Select your project folder to get started.</p>
    <button onclick={pickDirectory}>Choose project folder</button>
  {/if}

  {#if getError()}
    <p class="error">{getError()}</p>
  {/if}
</div>

<style lang="scss">
  .picker {
    display: grid;
    place-items: center;
    gap: 1rem;
    padding: var(--spacing);
    min-height: 50vh;
    text-align: center;
  }

  button {
    background: var(--plum);
    border: none;
    border-radius: 0.5rem;
    color: var(--white);
    cursor: pointer;
    font-size: 1rem;
    padding: 0.75rem 1.5rem;

    &:hover {
      background: var(--light-plum);
    }
  }

  .error {
    color: var(--light-red);
    font-size: 0.875rem;
  }
</style>
```

- [ ] **Step 2: Commit**

```bash
git add src/components/admin/DirectoryPicker.svelte
git commit -m "Add DirectoryPicker component"
```

### Task 9: Create the CollectionSidebar component

**Files:**

- Create: `src/components/admin/CollectionSidebar.svelte`

- [ ] **Step 1: Create `src/components/admin/CollectionSidebar.svelte`**

Left sidebar listing all collection names as links. The Navigation API intercepts clicks on these `<a>` elements naturally -- no custom click handlers needed. Active collection is highlighted based on the router state.

```svelte
<script>
  import { getCollections } from '$js/admin/state.svelte';
  import { getRoute } from '$js/admin/router.svelte';

  /** The currently selected collection name, if any */
  const activeCollection = $derived.by(() => {
    const r = getRoute();
    return r.view === 'collection' ? r.collection : null;
  });
</script>

<nav class="sidebar" aria-label="Content collections">
  <h2 class="sidebar-heading">Collections</h2>
  <ul class="sidebar-list">
    {#each getCollections() as name}
      <li>
        <a
          href="/admin/{name}"
          class="sidebar-link"
          aria-current={activeCollection === name ? 'page' : undefined}
        >
          {name}
        </a>
      </li>
    {/each}
  </ul>
</nav>

<style lang="scss">
  .sidebar {
    border-right: 1px solid var(--dark-grey);
    padding: 1rem;
    overflow-y: auto;
  }

  .sidebar-heading {
    font-size: 0.875rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--grey);
    margin-bottom: 0.75rem;
  }

  .sidebar-list {
    display: grid;
    gap: 0.25rem;
  }

  .sidebar-link {
    display: block;
    padding: 0.5rem 0.75rem;
    border-radius: 0.25rem;
    color: var(--white);
    text-decoration: none;
    font-size: 1rem;
    // Override global link box-shadow underline — sidebar items use background highlight instead
    box-shadow: none;

    &:hover {
      background: var(--dark-grey);
    }

    &[aria-current='page'] {
      background: var(--plum);
    }
  }
</style>
```

- [ ] **Step 2: Commit**

```bash
git add src/components/admin/CollectionSidebar.svelte
git commit -m "Add CollectionSidebar component"
```

### Task 10: Create the ContentList component

**Files:**

- Create: `src/components/admin/ContentList.svelte`

- [ ] **Step 1: Create `src/components/admin/ContentList.svelte`**

Secondary sidebar showing content files for the selected collection. Pure display component -- reads from reactive state. Shows a loading indicator while the worker is parsing and an error message if something fails.

```svelte
<script>
  import { getContentList, isLoading, getError } from '$js/admin/state.svelte';
  import { getRoute } from '$js/admin/router.svelte';

  /** The currently selected collection name */
  const collection = $derived.by(() => {
    const r = getRoute();
    return r.view === 'collection' ? r.collection : null;
  });
</script>

{#if collection}
  <section class="content-list" aria-label="Content files for {collection}">
    <h2 class="list-heading">{collection}</h2>

    {#if isLoading()}
      <p class="status">Loading...</p>
    {:else if getError()}
      <p class="status error">{getError()}</p>
    {:else if getContentList().length === 0}
      <p class="status">No content files found.</p>
    {:else}
      <ul class="file-list">
        {#each getContentList() as item}
          <li class="file-item">
            <span class="file-title">{item.title ?? item.filename}</span>
            {#if item.title}
              <span class="file-name">{item.filename}</span>
            {/if}
          </li>
        {/each}
      </ul>
    {/if}
  </section>
{/if}

<style lang="scss">
  .content-list {
    padding: 1rem;
    overflow-y: auto;
  }

  .list-heading {
    font-size: 1.25rem;
    margin-bottom: 0.75rem;
    text-transform: capitalize;
  }

  .status {
    color: var(--grey);
    font-size: 0.875rem;
  }

  .error {
    color: var(--light-red);
  }

  .file-list {
    display: grid;
    gap: 0.25rem;
  }

  .file-item {
    display: grid;
    gap: 0.25rem;
    padding: 0.5rem 0.75rem;
  }

  .file-title {
    font-size: 1rem;
    color: var(--white);
  }

  .file-name {
    font-size: 0.75rem;
    color: var(--grey);
  }
</style>
```

- [ ] **Step 2: Commit**

```bash
git add src/components/admin/ContentList.svelte
git commit -m "Add ContentList component"
```

### Task 11: Create the Admin shell component

**Files:**

- Create: `src/components/admin/Admin.svelte`

- [ ] **Step 1: Create `src/components/admin/Admin.svelte`**

Top-level admin shell. Initializes the router and restores the directory handle on mount. Renders DirectoryPicker when no handle is available, or the two-sidebar layout when connected. Uses `$effect` to dispatch worker parsing when the selected collection changes.

```svelte
<script>
  import { onMount } from 'svelte';
  import { initRouter, getRoute } from '$js/admin/router.svelte';
  import {
    getDirectoryHandle,
    getPermissionState,
    restoreHandle,
    loadCollection,
  } from '$js/admin/state.svelte';
  import DirectoryPicker from './DirectoryPicker.svelte';
  import CollectionSidebar from './CollectionSidebar.svelte';
  import ContentList from './ContentList.svelte';

  /** Whether the admin is ready (handle exists and permission granted) */
  const ready = $derived(
    getDirectoryHandle() !== null && getPermissionState() === 'granted',
  );

  /** The current route for tracking collection changes */
  const currentRoute = $derived(getRoute());

  /**
   * Dispatch worker when collection changes.
   * State module owns the worker, this effect just triggers it.
   */
  $effect(() => {
    if (ready && currentRoute.view === 'collection') {
      loadCollection(currentRoute.collection);
    }
  });

  onMount(() => {
    initRouter();
    restoreHandle();
  });
</script>

<div class="admin" class:admin--connected={ready}>
  {#if !ready}
    <DirectoryPicker />
  {:else}
    <CollectionSidebar />
    <ContentList />
  {/if}
</div>

<style lang="scss">
  .admin {
    min-height: 80vh;
  }

  .admin--connected {
    display: grid;
    grid-template-columns: 15rem 1fr;
  }
</style>
```

- [ ] **Step 2: Commit**

```bash
git add src/components/admin/Admin.svelte
git commit -m "Add Admin shell component"
```

### Task 12: Lint, format, and verify

- [ ] **Step 1: Run lint and format**

```bash
pnpm lint
pnpm prettier:fix
```

Fix any issues that arise.

- [ ] **Step 2: Check if the dev server is running, or start it**

First check if port 4321 is listening (`lsof -i :4321` or `curl -s http://localhost:4321 > /dev/null`). Only run `pnpm dev` if not already running. Note: `pnpm dev` triggers a `predev` hook that runs tweet import.

- [ ] **Step 3: Visit `http://localhost:4321/admin` in a browser**

Expected:

- Page loads without errors
- "Choose project folder" button is visible
- Clicking it opens the system directory picker
- After selecting the blog project root, the sidebar shows collection names (categories, pages, posts, recipes)
- First collection (categories) is auto-selected and its content files are listed
- Clicking other collections in the sidebar updates the URL and content list
- Reloading the page restores the handle (may prompt for re-authorization)

- [ ] **Step 4: Commit any lint/format fixes**

```bash
git add -A
git commit -m "Fix lint and formatting issues"
```
