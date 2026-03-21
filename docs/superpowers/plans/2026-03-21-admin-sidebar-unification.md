# Admin Sidebar Unification Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Unify the collections sidebar and content list into a single `AdminSidebar` component with search filtering, sort popover (Material Symbols, CSS Anchor Positioning, Interest Invokers), and per-collection sort persistence.

**Architecture:** A single `AdminSidebar.svelte` replaces two components. The worker returns full frontmatter, the parent maps data to a generic `SidebarItem[]`, and the sidebar handles search/sort/rendering. Sort state is persisted per-collection in localStorage.

**Tech Stack:** Svelte 5 (runes), CSS Anchor Positioning, HTML Popover API (`popover="hint"`), Interest Invokers (`interestfor`), Material Symbols Outlined (variable font, icon-subsetted), localStorage.

**Spec:** `docs/superpowers/specs/2026-03-21-admin-sidebar-unification-design.md`

**IMPORTANT RULES (from CLAUDE.md):**

- Use `pnpm` only. Never `npm`, `npx`, or `pnpx`.
- Run `pnpm lint` and `pnpm format` before every commit. Fix all warnings/errors.
- ONE bash command per tool call. No `&&`, `;`, `||`, pipes, or redirects.
- No `cd` — run commands from the worktree root.
- CSS: `rem` units in `0.25rem` increments. Font sizes: `0.75rem` (captions only), `0.875rem` (compact/labels), `1rem` (default). No non-standard sizes. Prefer CSS Grid.
- Files must stay under 350 lines.
- JSDoc comments on all functions/classes with `@param`/`@returns` and TypeScript types.
- Use `//` for SCSS comments, not `/* */`.
- Click handlers only on `<button>` or `<a>` elements.
- No prop drilling or callback drilling. Use reactive state.
- No `:global` CSS except for top-layer rendering or scoped-parent + global-child patterns.
- Never add `Co-Authored-By` lines to git commits.

---

## File Structure

| File                                            | Action | Responsibility                                                        |
| ----------------------------------------------- | ------ | --------------------------------------------------------------------- |
| `src/js/admin/sort.ts`                          | Create | Sort types, constants, and localStorage persistence helpers           |
| `src/components/admin/AdminSidebar.svelte`      | Create | Unified sidebar: header (title + search + sort), scrollable item list |
| `src/js/admin/frontmatter-worker.ts`            | Modify | Return full frontmatter as `data` instead of just `title`             |
| `src/js/admin/state.svelte.ts`                  | Modify | Update `ContentItem` type to `{ filename, data }`                     |
| `src/components/admin/Admin.svelte`             | Modify | Use `AdminSidebar` twice, map data to `SidebarItem[]`, dynamic grid   |
| `src/layouts/Donut.astro`                       | Modify | Add named `head` slot for per-page head content                       |
| `src/pages/admin/[...path].astro`               | Modify | Add Material Symbols font link via head slot                          |
| `src/components/admin/CollectionSidebar.svelte` | Delete | Replaced by `AdminSidebar`                                            |
| `src/components/admin/ContentList.svelte`       | Delete | Replaced by `AdminSidebar`                                            |

---

### Task 1: Add Material Symbols font to admin page

**Files:**

- Modify: `src/layouts/Donut.astro`
- Modify: `src/pages/admin/[...path].astro`

- [ ] **Step 1: Add a named head slot to Donut.astro**

`Donut.astro` has a `<head>` section but no mechanism for pages to inject content into it. Add a named slot `<slot name="head" />` just before the closing `</head>` tag in `src/layouts/Donut.astro`:

```astro
<slot name="head" />
```

This allows any page using the layout to inject page-specific `<link>`, `<meta>`, or `<style>` elements.

- [ ] **Step 2: Add the font link in the admin page**

In `src/pages/admin/[...path].astro`, pass the Material Symbols font link into the head slot:

```astro
<Layout title="Admin" summary="Content management interface">
  <link
    slot="head"
    href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&icon_names=hourglass_arrow_down,hourglass_arrow_up,sort_by_alpha&display=block"
    rel="stylesheet"
  />
  <Admin client:only="svelte" />
</Layout>
```

- [ ] **Step 3: Verify the build**

Run: `pnpm build`
Expected: Build succeeds with no errors.

- [ ] **Step 4: Lint and commit**

Run `pnpm lint` then `pnpm format`, fix any issues, then commit:

```
feat(admin): add Material Symbols Outlined font for sort icons
```

---

### Task 2: Update frontmatter worker to return full data

**Files:**

- Modify: `src/js/admin/frontmatter-worker.ts`

- [ ] **Step 1: Read the current worker file**

Read `src/js/admin/frontmatter-worker.ts` to understand the current structure.

- [ ] **Step 2: Update the worker to return full frontmatter**

Change the worker to return `{ filename, data }` where `data` is the full parsed frontmatter object (or an empty object if no frontmatter). The worker must still sort alphabetically by title (from `data.title`), falling back to filename.

Replace the `items` array type and population logic:

```ts
const items: Array<{ filename: string; data: Record<string, unknown> }> = [];
```

In the loop body, replace the title extraction with:

```ts
const data = frontmatter ?? {};
items.push({ filename: name, data });
```

Update the sort comparator to access title from `data`:

```ts
items.sort((a, b) => {
  const aTitle = typeof a.data.title === 'string' ? a.data.title : a.filename;
  const bTitle = typeof b.data.title === 'string' ? b.data.title : b.filename;
  return aTitle.toLowerCase().localeCompare(bTitle.toLowerCase());
});
```

- [ ] **Step 3: Verify the build**

Run: `pnpm build`
Expected: Build succeeds.

- [ ] **Step 4: Lint and commit**

Run `pnpm lint` then `pnpm format`, fix any issues, then commit:

```
feat(admin): return full frontmatter data from worker
```

---

### Task 3: Update state module ContentItem type

**Files:**

- Modify: `src/js/admin/state.svelte.ts`

- [ ] **Step 1: Read the current state file**

Read `src/js/admin/state.svelte.ts` to understand the current structure.

- [ ] **Step 2: Update the ContentItem type**

Change the `ContentItem` type from:

```ts
export type ContentItem = {
  filename: string;
  title: string | null;
};
```

To:

```ts
/** Content item with full frontmatter data returned by the worker */
export type ContentItem = {
  filename: string;
  data: Record<string, unknown>;
};
```

- [ ] **Step 3: Update the worker message handler**

In the `ensureWorker` function's message handler, the `data.items` assignment should work as-is since the shape change is compatible. Verify that `contentList` state variable type matches the new `ContentItem` type:

```ts
let contentList = $state<ContentItem[]>([]);
```

This should already work since the variable was typed as `ContentItem[]`.

- [ ] **Step 4: Verify the build**

Run: `pnpm build`
Expected: Build succeeds. There may be type errors in components that reference `item.title` — these will be fixed in subsequent tasks.

- [ ] **Step 5: Lint and commit**

Run `pnpm lint` then `pnpm format`, fix any issues, then commit:

```
refactor(admin): update ContentItem type to include full frontmatter data
```

---

### Task 4: Create sort utilities module

**Files:**

- Create: `src/js/admin/sort.ts`

- [ ] **Step 1: Create the sort utilities file**

Create `src/js/admin/sort.ts` with the sort types, constants, comparator, and localStorage helpers:

```ts
/**
 * Sidebar item displayed as a link in the admin navigation.
 * Used by AdminSidebar for both collections and content lists.
 */
export type SidebarItem = {
  label: string;
  href: string;
  subtitle?: string;
  date?: Date;
};

/** Sort mode identifiers */
export type SortMode = 'alpha' | 'date-asc' | 'date-desc';

/** Sort mode configuration: icon name and display label */
export const SORT_MODES: Record<SortMode, { icon: string; label: string }> = {
  alpha: { icon: 'sort_by_alpha', label: 'Alphabetical' },
  'date-asc': { icon: 'hourglass_arrow_down', label: 'Oldest first' },
  'date-desc': { icon: 'hourglass_arrow_up', label: 'Newest first' },
};

/** Fixed display order for sort options in the popover */
export const SORT_ORDER: SortMode[] = ['alpha', 'date-asc', 'date-desc'];

/**
 * Reads the persisted sort mode from localStorage.
 * @param key - Collection name to construct the storage key
 * @returns The stored SortMode, or 'alpha' if absent/invalid
 */
export function readSortMode(key: string): SortMode {
  const stored = localStorage.getItem(`cms-sort-${key}`);
  if (stored === 'alpha' || stored === 'date-asc' || stored === 'date-desc') {
    return stored;
  }
  return 'alpha';
}

/**
 * Writes the sort mode to localStorage.
 * @param key - Collection name to construct the storage key
 * @param mode - The sort mode to persist
 */
export function writeSortMode(key: string, mode: SortMode): void {
  localStorage.setItem(`cms-sort-${key}`, mode);
}

/**
 * Creates a comparator function for sorting SidebarItems by the given mode.
 * @param mode - The sort mode to use
 * @returns A comparator function for Array.sort()
 */
export function createComparator(
  mode: SortMode,
): (a: SidebarItem, b: SidebarItem) => number {
  return (a, b) => {
    if (mode === 'date-asc') {
      return (a.date?.getTime() ?? 0) - (b.date?.getTime() ?? 0);
    }
    if (mode === 'date-desc') {
      return (b.date?.getTime() ?? 0) - (a.date?.getTime() ?? 0);
    }
    return a.label.toLowerCase().localeCompare(b.label.toLowerCase());
  };
}
```

- [ ] **Step 2: Verify the build**

Run: `pnpm build`
Expected: Build succeeds.

- [ ] **Step 3: Lint and commit**

Run `pnpm lint` then `pnpm format`, fix any issues, then commit:

```
feat(admin): add sort utilities module
```

---

### Task 5: Create AdminSidebar component

**Files:**

- Create: `src/components/admin/AdminSidebar.svelte`

The component imports sort types and helpers from `src/js/admin/sort.ts` to keep the file under 350 lines.

- [ ] **Step 1: Create the component with props and reactive state**

Create `src/components/admin/AdminSidebar.svelte`. The script block imports from the sort module and defines props and local state:

```svelte
<script lang="ts">
  import {
    type SidebarItem,
    type SortMode,
    SORT_MODES,
    SORT_ORDER,
    readSortMode,
    writeSortMode,
    createComparator,
  } from '$js/admin/sort';

  export type { SidebarItem };

  interface Props {
    /** Heading text displayed at the top of the sidebar */
    title: string;
    /** Items to display in the sidebar list */
    items: SidebarItem[];
    /** href of the currently active item, highlighted with aria-current */
    activeItem?: string;
    /** Collection name for localStorage sort persistence (constructs key: cms-sort-{storageKey}) */
    storageKey?: string;
    /** Whether items are currently loading */
    loading?: boolean;
    /** Error message to display instead of items */
    error?: string;
  }

  let {
    title,
    items,
    activeItem,
    storageKey,
    loading = false,
    error,
  }: Props = $props();

  /** Whether any items have dates, controlling sort button visibility */
  const hasDates = $derived(items.some((item) => item.date != null));

  /** Search query for filtering items by label */
  let searchQuery = $state('');

  /** Current sort mode, initialized from localStorage if storageKey is provided */
  let sortMode = $state<SortMode>(
    storageKey ? readSortMode(storageKey) : 'alpha',
  );

  /** Re-read sort mode when storageKey changes (switching collections) */
  $effect(() => {
    if (storageKey) {
      sortMode = readSortMode(storageKey);
    } else {
      sortMode = 'alpha';
    }
  });

  /** Sort options available in the popover (all modes except the active one) */
  const popoverOptions = $derived(
    SORT_ORDER.filter((mode) => mode !== sortMode),
  );

  /**
   * Handles sort option selection from the popover.
   * @param mode - The selected sort mode
   */
  function selectSort(mode: SortMode): void {
    sortMode = mode;
    if (storageKey) {
      writeSortMode(storageKey, mode);
    }
  }

  /** Items filtered by search query and sorted by current mode */
  const displayedItems = $derived.by(() => {
    const query = searchQuery.toLowerCase();
    const filtered = query
      ? items.filter((item) => item.label.toLowerCase().includes(query))
      : items;
    return [...filtered].sort(createComparator(sortMode));
  });

  /** Unique ID for the sort popover element, reactive to title changes */
  const popoverId = $derived(
    `sort-popover-${title.toLowerCase().replace(/\s+/g, '-')}`,
  );

  /** Bound reference to the popover element for imperative hidePopover() calls */
  let popoverEl = $state<HTMLDivElement | null>(null);
</script>
```

- [ ] **Step 2: Add the template markup**

Add the template below the script block:

```svelte
<nav class="sidebar" aria-label={title}>
  <div class="sidebar-header">
    <h2 class="sidebar-heading">{title}</h2>

    {#if !loading && !error}
      <div class="toolbar" class:toolbar--search-only={!hasDates}>
        <input
          type="text"
          class="search-input"
          placeholder="Filter..."
          bind:value={searchQuery}
        />

        {#if hasDates}
          <button
            class="sort-btn"
            title={SORT_MODES[sortMode].label}
            interestfor={popoverId}
          >
            <span class="material-symbols-outlined">
              {SORT_MODES[sortMode].icon}
            </span>
          </button>

          <div
            id={popoverId}
            class="sort-popover"
            popover="hint"
            bind:this={popoverEl}
          >
            {#each popoverOptions as mode}
              <button
                class="sort-option"
                onclick={() => {
                  selectSort(mode);
                  popoverEl?.hidePopover();
                }}
              >
                <span class="material-symbols-outlined">
                  {SORT_MODES[mode].icon}
                </span>
                {SORT_MODES[mode].label}
              </button>
            {/each}
          </div>
        {/if}
      </div>
    {/if}
  </div>

  <div class="sidebar-items">
    {#if loading}
      <p class="status">Loading...</p>
    {:else if error}
      <p class="status status--error">{error}</p>
    {:else if displayedItems.length === 0}
      <p class="status">No items found.</p>
    {:else}
      <ul class="sidebar-list">
        {#each displayedItems as item}
          <li>
            <a
              href={item.href}
              class="sidebar-link"
              aria-current={activeItem === item.href ? 'page' : undefined}
            >
              {item.label}
              {#if item.subtitle}
                <span class="item-subtitle">{item.subtitle}</span>
              {/if}
            </a>
          </li>
        {/each}
      </ul>
    {/if}
  </div>
</nav>
```

- [ ] **Step 3: Add the styles**

Add the `<style lang="scss">` block. Key layout points:

- The `.sidebar` is a CSS Grid with `grid-template-rows: auto 1fr` and `height: 100dvh`
- `.sidebar-header` has padding and does not scroll
- `.sidebar-items` has `overflow-y: auto` and horizontal padding
- The sort button uses `anchor-name: --sort-btn`
- The sort popover uses `position-anchor: --sort-btn` and is positioned bottom-right extending left

```svelte
<style lang="scss">
  .sidebar {
    display: grid;
    grid-template-rows: auto 1fr;
    height: 100dvh;
    border-right: 1px solid var(--dark-grey);
  }

  .sidebar-header {
    padding: 1rem;
  }

  .sidebar-heading {
    font-size: 0.875rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--grey);
    margin-bottom: 0.75rem;
  }

  .toolbar {
    display: grid;
    grid-template-columns: 1fr auto;
    gap: 0.5rem;
    align-items: center;
  }

  .toolbar--search-only {
    grid-template-columns: 1fr;
  }

  .search-input {
    width: 100%;
    padding: 0.5rem;
    background: var(--dark-grey);
    border: 1px solid var(--grey);
    border-radius: 0.25rem;
    color: var(--white);
    font-size: 0.875rem;

    &::placeholder {
      color: var(--grey);
    }
  }

  // Shared icon size for sort button and popover options
  .material-symbols-outlined {
    font-size: 1.25rem;
  }

  .sort-btn {
    anchor-name: --sort-btn;
    background: none;
    border: 1px solid var(--grey);
    border-radius: 0.25rem;
    color: var(--white);
    padding: 0.25rem;
    cursor: pointer;
    display: grid;
    place-items: center;
    width: 2rem;
    height: 2rem;

    &:hover {
      background: var(--dark-grey);
    }
  }

  .sort-popover {
    position-anchor: --sort-btn;
    position: fixed;
    inset: unset;
    top: anchor(bottom);
    right: anchor(right);
    margin-top: 0.25rem;
    background: var(--dark-grey);
    border: 1px solid var(--grey);
    border-radius: 0.25rem;
    padding: 0.25rem;
    display: grid;
    gap: 0.25rem;
  }

  .sort-option {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem;
    border-radius: 0.25rem;
    cursor: pointer;
    font-size: 0.875rem;
    color: var(--white);
    background: none;
    border: none;
    white-space: nowrap;

    &:hover {
      background: var(--grey);
    }
  }

  .sidebar-items {
    overflow-y: auto;
    padding: 0 1rem 1rem;
  }

  .status {
    color: var(--grey);
    font-size: 0.875rem;
    padding: 0.5rem 0.75rem;
  }

  .status--error {
    color: var(--light-red);
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

  .item-subtitle {
    display: block;
    font-size: 0.75rem;
    color: var(--grey);
    margin-top: 0.25rem;
  }
</style>
```

- [ ] **Step 4: Verify the build**

Run: `pnpm build`
Expected: Build succeeds. Component won't be used yet but should compile without errors.

- [ ] **Step 5: Verify line count is under 350**

Count the lines in the new file to ensure it's under 350.

- [ ] **Step 6: Lint and commit**

Run `pnpm lint` then `pnpm format`, fix any issues, then commit:

```
feat(admin): create unified AdminSidebar component
```

---

### Task 6: Wire up Admin.svelte with new AdminSidebar

**Files:**

- Modify: `src/components/admin/Admin.svelte`
- Delete: `src/components/admin/CollectionSidebar.svelte`
- Delete: `src/components/admin/ContentList.svelte`

- [ ] **Step 1: Read the current Admin.svelte**

Read `src/components/admin/Admin.svelte` to understand the current structure.

- [ ] **Step 2: Update Admin.svelte**

Replace the component to use `AdminSidebar` twice. The full updated file:

```svelte
<script>
  import { onMount } from 'svelte';
  import { initRouter, getRoute } from '$js/admin/router.svelte';
  import {
    getCollections,
    getDirectoryHandle,
    getPermissionState,
    restoreHandle,
    loadCollection,
    getContentList,
    isLoading,
    getError,
  } from '$js/admin/state.svelte';
  import DirectoryPicker from './DirectoryPicker.svelte';
  import AdminSidebar from './AdminSidebar.svelte';

  /** Whether the admin is ready (handle exists and permission granted) */
  const ready = $derived(
    getDirectoryHandle() !== null && getPermissionState() === 'granted',
  );

  /** The current route for tracking collection changes */
  const currentRoute = $derived(getRoute());

  /** Whether a collection is currently selected */
  const hasCollection = $derived(currentRoute.view === 'collection');

  /** The active collection name, if any */
  const activeCollection = $derived(
    currentRoute.view === 'collection' ? currentRoute.collection : null,
  );

  /** Collection names mapped to SidebarItems */
  const collectionItems = $derived(
    getCollections().map((name) => ({
      label: name,
      href: `/admin/${name}`,
    })),
  );

  /** Content items mapped to SidebarItems for the active collection */
  const contentItems = $derived(
    getContentList().map((item) => {
      const title =
        typeof item.data.title === 'string' ? item.data.title : item.filename;
      const published = item.data.published;
      const slug = item.filename.replace(/\.md$/, '');
      return {
        label: title,
        href: `/admin/${activeCollection}/${slug}`,
        subtitle: item.filename,
        ...(typeof published === 'string' ? { date: new Date(published) } : {}),
      };
    }),
  );

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

<div
  class="admin"
  class:admin--connected={ready}
  class:admin--collection={ready && hasCollection}
>
  {#if !ready}
    <DirectoryPicker />
  {:else}
    <AdminSidebar
      title="Collections"
      items={collectionItems}
      activeItem={activeCollection ? `/admin/${activeCollection}` : undefined}
    />
    {#if hasCollection && activeCollection}
      <AdminSidebar
        title={activeCollection}
        items={contentItems}
        storageKey={activeCollection}
        loading={isLoading()}
        error={getError() ?? undefined}
      />
    {/if}
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

  .admin--collection {
    grid-template-columns: 15rem 15rem 1fr;
  }
</style>
```

- [ ] **Step 3: Delete old components**

Delete `src/components/admin/CollectionSidebar.svelte` and `src/components/admin/ContentList.svelte`.

- [ ] **Step 4: Verify the build**

Run: `pnpm build`
Expected: Build succeeds with no errors.

- [ ] **Step 5: Lint and commit**

Run `pnpm lint` then `pnpm format`, fix any issues, then commit:

```
feat(admin): wire AdminSidebar into Admin shell, remove old components
```

---

### Task 7: Manual verification in browser

**Files:** None (testing only)

- [ ] **Step 1: Start the dev server if not already running**

Check if the dev server is running. If not, start it with `pnpm dev`.

- [ ] **Step 2: Verify collections sidebar**

Open the admin page in Chrome. Verify:

- Collections sidebar appears at 15rem wide with heading "Collections"
- Search input filters collection names
- No sort button (collections have no dates)
- Clicking a collection navigates and highlights it
- Heading and search stay pinned; only the list scrolls (test with browser zoom or narrow viewport)

- [ ] **Step 3: Verify content list sidebar**

Click on "posts" collection. Verify:

- Second sidebar appears at 15rem wide
- Heading shows "posts"
- Search input filters by title
- Sort button shows `sort_by_alpha` icon
- Hovering/focusing the sort button shows the popover with two date sort options
- Popover is anchored bottom-right of button, extending left
- Clicking a sort option changes the button icon and re-sorts the list
- Sort persists after page reload

- [ ] **Step 4: Verify collections without dates**

Click on "categories" or "pages". Verify:

- No sort button appears
- Search still works

- [ ] **Step 5: Verify loading/error/empty states**

- Loading: Should briefly show "Loading..." when switching collections
- Empty: If a collection has no .md files, shows "No items found."
