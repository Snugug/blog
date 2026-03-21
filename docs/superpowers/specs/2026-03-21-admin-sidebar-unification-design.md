# Admin Sidebar Unification & Sort/Filter

## Summary

Unify the collections sidebar and content list into a single reusable `AdminSidebar` component with fuzzy text search and a sort popover. The sort button uses Material Symbols icons with CSS Anchor Positioning, the HTML Popover API, and Interest Invokers.

## Component: `AdminSidebar.svelte`

Replaces both `CollectionSidebar.svelte` and `ContentList.svelte` with a single component.

### Props

| Prop | Type | Description |
|------|------|-------------|
| `title` | `string` | Heading text (e.g. "Collections", "Posts") |
| `items` | `SidebarItem[]` | List of items to display |
| `activeItem` | `string \| undefined` | `href` of the currently active item (highlighted) |
| `storageKey` | `string \| undefined` | Collection name used to construct the localStorage key (`cms-sort-{storageKey}`). Only needed when items have dates. |

### `SidebarItem` type

```ts
type SidebarItem = {
  label: string;
  href: string;
  subtitle?: string;
  date?: Date;
};
```

### Loading, error, and empty states

The component accepts optional props for loading/error/empty feedback (only relevant for the content sidebar):

| Prop | Type | Description |
|------|------|-------------|
| `loading` | `boolean` | Defaults to `false`. When `true`, shows "Loading..." instead of the list |
| `error` | `string \| undefined` | When set, shows the error message in `var(--light-red)` instead of the list |

When `items` is empty and `loading` is `false` and `error` is `undefined`, shows "No items found." in `var(--grey)`. The search input and sort button are hidden during loading/error states.

### Rendering

- The sidebar is `100dvh` tall, laid out as a CSS Grid with two rows: a fixed header area (title + search/sort toolbar) and a scrollable item list
- The header area contains the heading and the search/sort toolbar. It does **not** scroll — it stays pinned at the top
- The item list area has `overflow-y: auto` and scrolls independently
- Heading uses the existing `.sidebar-heading` style: `0.875rem`, uppercase, letter-spacing `0.05em`, `var(--grey)`
- Fixed width of `15rem`, with `border-right: 1px solid var(--dark-grey)`, `padding: 1rem` on the header area, and horizontal padding on the scroll area
- Items are links (`<a>`) styled with the existing `.sidebar-link` pattern: `0.5rem 0.75rem` padding, `0.25rem` border-radius, `var(--plum)` background when `aria-current="page"`
- Items with a `subtitle` show it below the label at `0.75rem`, `var(--grey)`
- The component is a `<nav>` with an `aria-label` derived from the title

## Search

- A text `<input>` with placeholder "Filter..." appears at the top of every sidebar instance
- Case-insensitive substring match against each item's `label`
- Filters the displayed list reactively; search state is ephemeral (not persisted)
- When sort button is absent, the search input takes full width. When present, they share a row via `grid-template-columns: 1fr auto`

## Sort

### Visibility

The sort button only renders when **at least one item** in the `items` array has a `date` property. Collections without dates (categories, pages) never show the sort button.

### Sort modes

| Mode | Icon | Description |
|------|------|-------------|
| `alpha` | `sort_by_alpha` | Alphabetical by title (default) |
| `date-asc` | `hourglass_arrow_down` | Oldest first (ascending published date) |
| `date-desc` | `hourglass_arrow_up` | Newest first (descending published date) |

### Sort button

- A `<button>` displaying the Material Symbol icon for the currently active sort mode
- Uses `interestfor` (Interest Invoker) to reference the popover element, displaying it on hover/focus interest
- The button has `anchor-name` for CSS Anchor Positioning

### Sort popover

- A `<div popover>` containing buttons for the two sort modes **not** currently selected
- Each button shows the icon + text label (e.g. "Oldest first")
- Options always appear in fixed order (skipping the active one): alphabetical, then oldest first, then newest first
- Positioned via CSS Anchor Positioning: anchored to the bottom-right of the sort button, extending left (`right` edge aligned to anchor's `right`, top edge below anchor's bottom)
- Clicking an option: updates the sort, swaps the button icon, closes the popover, persists to localStorage

### Persistence

- The component constructs the full localStorage key as `cms-sort-{storageKey}` (e.g. `cms-sort-posts`)
- Stored value: `"alpha"`, `"date-asc"`, or `"date-desc"`
- On mount, reads stored sort using the constructed key. Defaults to `"alpha"` if absent
- Written immediately on sort change

## Data flow

### Worker changes (`frontmatter-worker.ts`)

- Returns full frontmatter as `data` instead of extracting only `title`
- Return type: `{ filename: string; data: Record<string, unknown> }`
- Worker maintains its current alphabetical-by-title default sort

### State changes (`state.svelte.ts`)

- `ContentItem` type updated to `{ filename: string; data: Record<string, unknown> }`
- Getter functions updated accordingly

### Parent mapping (`Admin.svelte`)

- Maps `ContentItem[]` to `SidebarItem[]` for the content sidebar: `label` from `data.title` (falling back to `filename` when title is absent), `subtitle` from `filename`, `date` converted from `data.published` string to `Date` via `new Date(value)` (omitted when `published` is absent), `href` set to `/admin/{collection}/{slug}` (where slug is filename without `.md` extension — route exists but does nothing yet; hard-refresh on these URLs will 404 in static mode, deferred to a future spec when the editor view is implemented)
- Maps `collectionNames` to `SidebarItem[]` for the collections sidebar: `label` from name, `href` from `/admin/{name}`, no subtitle or date
- Grid changes from `15rem 1fr` to `15rem 15rem 1fr` when a collection is active

## Material Symbols font

Loaded via Google Fonts in the admin page's `<head>` with variable font optimization and icon subsetting:

```html
<link
  href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&icon_names=hourglass_arrow_down,hourglass_arrow_up,sort_by_alpha&display=block"
  rel="stylesheet"
/>
```

Only the three required icon glyphs are downloaded (~2.6KB).

## File changes

### Created
- `src/js/admin/sort.ts` — sort types, constants, comparator, and localStorage persistence helpers
- `src/components/admin/AdminSidebar.svelte`

### Modified
- `src/components/admin/Admin.svelte` — uses `AdminSidebar` twice, dynamic grid
- `src/js/admin/state.svelte.ts` — updated `ContentItem` type
- `src/js/admin/frontmatter-worker.ts` — returns full frontmatter as `data`
- `src/layouts/Donut.astro` — add named `head` slot for per-page head content
- `src/pages/admin/[...path].astro` — Material Symbols font link via head slot

### Deleted
- `src/components/admin/CollectionSidebar.svelte`
- `src/components/admin/ContentList.svelte`
