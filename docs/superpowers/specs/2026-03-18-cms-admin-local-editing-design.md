# CMS Admin: Local Editing Setup

A client-side admin interface at `/admin` that uses the File System Access API to browse local content collections and the Navigation API for SPA routing.

## Architecture

Single-page application rendered inside an Astro catch-all route (`src/pages/admin/[...path].astro`). One top-level `Admin.svelte` component loaded with `client:only="svelte"` manages the shell. Shared reactive state lives in `.svelte.ts` modules (Svelte 5 runes), not prop drilling. A Web Worker handles frontmatter parsing off the main thread using `js-yaml`.

## SPA Router

**File**: `src/js/admin/router.svelte.ts`

Uses the Navigation API (`window.navigation`) to manage client-side routing within `/admin/`.

- On init, reads `location.pathname` to determine the current view (Navigation API doesn't fire `navigate` on initial page load)
- Listens to `navigation.addEventListener('navigate', ...)` and intercepts navigations under `/admin/` with `event.intercept()`
- Exposes reactive state: `route` (e.g., `{ view: 'collection', collection: 'posts' }`)
- Provides a `navigate(path)` helper that calls `navigation.navigate()`

**Route structure**:

- `/admin` -- directory picker (if no handle) or redirect to first collection (alphabetically first by collection name)
- `/admin/{collection}` -- content listing for that collection

## State Architecture

**File**: `src/js/admin/state.svelte.ts`

Shared reactive state as Svelte 5 signals:

- `directoryHandle` -- `FileSystemDirectoryHandle` from the picker, persisted to IndexedDB
- `collections` -- list of collection names from `virtual:collections`
- `selectedCollection` -- active collection, driven by router
- `contentList` -- array of `{ title: string | null, filename: string }` for the selected collection
- `error` -- error message string or `null`
- `loading` -- boolean, true while the worker is parsing

**Flow**:

1. Page loads -> check IndexedDB for stored handle
2. If no handle -> show directory picker button
3. If handle exists -> call `handle.queryPermission({ mode: 'read' })`:
   - If `'granted'` -> proceed silently, fetch collection names from `virtual:collections`, navigate to `/admin/{firstCollection}` (alphabetically first)
   - If `'prompt'` -> show a "Re-authorize folder" button; call `requestPermission()` only inside that button's click handler (requires user gesture)
   - If `'denied'` -> treat as no handle, show directory picker
4. When collection changes (router) -> state module dispatches directory handle + collection name to Web Worker (state owns the worker lifecycle, not any component)
5. Worker reads files, parses frontmatter, returns title + filename list
6. State updates -> UI re-renders

## IndexedDB Persistence

**File**: `src/js/admin/storage.ts`

Stores and retrieves the `FileSystemDirectoryHandle` in IndexedDB. On page load, restores the handle and calls `queryPermission()` to check access status (see State Architecture flow for the full permission check sequence).

## Web Worker: Frontmatter Parsing

**File**: `src/js/admin/frontmatter-worker.ts`

Receives a `FileSystemDirectoryHandle` for a content directory via `postMessage()` (handles are serializable via structured clone, not transferable -- main thread retains its copy). The worker:

1. Receives the project root handle + collection name. Traverses to the content directory via `root.getDirectoryHandle('src')` -> `.getDirectoryHandle('content')` -> `.getDirectoryHandle(collectionName)` (hardcoded `src/content/{collection}/` convention)
2. Iterates entries, reads each `.md` file via `handle.getFile()` + `file.text()`
3. Extracts and parses YAML frontmatter with `js-yaml`
4. Returns title + filename list

**Frontmatter extraction edge cases** (informed by gray-matter):

- Strip BOM (`\uFEFF`) from file content
- Reject `----` (horizontal rule, not frontmatter delimiter)
- Find content between opening and closing `---\n`
- Handle `\r\n` line endings
- Empty/missing frontmatter -> `null` for title

**Message protocol**:

```ts
// Main thread -> Worker
{ type: 'parse', handle: FileSystemDirectoryHandle, collection: string }

// Worker -> Main thread (success)
{ type: 'result', items: Array<{ filename: string, title: string | null }> }

// Worker -> Main thread (error)
{ type: 'error', message: string }
```

**Dependency**: `js-yaml` (38 KB min, 12.7 KB gzip, zero runtime deps). Added with `@types/js-yaml` as dev dependency.

## Components

All in `src/components/admin/`.

**`Admin.svelte`** -- Top-level shell. Checks for stored directory handle on mount. If none, renders `DirectoryPicker`. If handle exists, renders the two-sidebar layout. Listens to router state.

**`DirectoryPicker.svelte`** -- Button calling `window.showDirectoryPicker()`. On success, stores handle to IndexedDB and navigates to `/admin/{firstCollection}`.

**`CollectionSidebar.svelte`** -- Left sidebar listing collection names. Active collection highlighted via router state. Items are `<a>` elements linking to `/admin/{collection}` (Navigation API intercepts naturally).

**`ContentList.svelte`** -- Secondary sidebar showing files for the selected collection. Pure display component driven by `contentList` and `loading` state (worker dispatch is handled by the state module, not this component). Each item shows title as primary text and filename as secondary text, sorted alphabetically by title (falling back to filename if no title).

**Layout**: CSS Grid on `Admin.svelte` -- two-column sidebar layout when a collection is selected. Collection sidebar is narrow/fixed-width, content list takes remaining space.

## Error Handling

- `showDirectoryPicker()` cancelled (`AbortError`) -- silently ignore, keep showing picker
- `showDirectoryPicker()` denied (`NotAllowedError`) -- display error in UI
- Worker parse errors (malformed YAML, unreadable files) -- worker sends `{ type: 'error' }`, state sets `error`, UI displays it
- Directory traversal failure (collection folder doesn't exist) -- worker sends error, UI shows message
- Permission revoked mid-session -- file read errors in worker trigger error flow, UI re-runs permission check

## Files to Create/Modify

| File                                            | Action                                       |
| ----------------------------------------------- | -------------------------------------------- |
| `src/pages/admin/[...path].astro`               | Create -- SPA shell, catch-all route         |
| `src/pages/schemas.astro`                       | Delete -- moved to /admin                    |
| `src/components/SchemaLog.svelte`               | Delete -- replaced by admin UI               |
| `src/components/admin/Admin.svelte`             | Create -- top-level admin component          |
| `src/components/admin/DirectoryPicker.svelte`   | Create -- directory picker button            |
| `src/components/admin/CollectionSidebar.svelte` | Create -- left sidebar of collection types   |
| `src/components/admin/ContentList.svelte`       | Create -- secondary sidebar of content files |
| `src/js/admin/router.svelte.ts`                 | Create -- Navigation API SPA router          |
| `src/js/admin/state.svelte.ts`                  | Create -- shared reactive state              |
| `src/js/admin/storage.ts`                       | Create -- IndexedDB handle persistence       |
| `src/js/admin/frontmatter-worker.ts`            | Create -- Web Worker for YAML parsing        |
| `package.json`                                  | Modify -- add js-yaml + @types/js-yaml       |
