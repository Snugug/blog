# Metadata Form Editor Design

## Overview

Add a dynamic metadata form to the CMS admin editor (`/admin/{collection}/{slug}`) that renders form fields from JSON Schema and existing frontmatter data. The editor area switches from a full-bleed CodeMirror surface to a tabbed interface with metadata editing, body editing, and custom schema-defined tabs.

## Architecture

### Approach: Hybrid — Recursive Rendering, Centralized Reactive State

- **Rendering** is driven by the JSON Schema: a recursive `SchemaField` component reads each schema node and dispatches to the appropriate input component
- **Data** lives in a single reactive `formData` object (the parsed frontmatter), stored in `editor.svelte.ts`
- Components read/write to `formData` by path; array operations mutate the state object directly and the recursive tree reactively updates

## Data Flow

### On File Load

1. User navigates to `/admin/{collection}/{slug}`
2. The content list for the collection is already loaded (via the frontmatter worker), and each item has a pre-parsed `data: Record<string, unknown>` object
3. `Admin.svelte` looks up the matching `ContentItem` from `getContentList()` by slug, then calls `loadFile(fileHandle, item.data)` with the pre-parsed frontmatter object
4. The file is read to extract the body content (frontmatter splitting still needed to find where body starts)
5. `formData` is set to the pre-parsed `data` object — no duplicate YAML parsing
6. The collection's JSON Schema is fetched (from `/collections/{name}.schema.json`) if not already cached
7. Body goes to CodeMirror (existing behavior)

### On Form Edit

- Form inputs write to `formData` by path (e.g., `formData.title`, `formData.instructions[0].time.active`)
- Any mutation marks the editor as dirty (unified dirty tracking with body edits)

### On Save

- Serialize `formData` to YAML using `js-yaml`'s `dump()` with appropriate options (e.g., `lineWidth: -1` to prevent line folding of long strings, and quoting options as needed to produce clean YAML)
- Reconstitute the file as `---\n${yaml}\n---\n${body}`
- Write via File System Access API (existing flow)

### Schema Caching

- A new `schema.svelte.ts` state module fetches and caches schemas per collection
- The schema is fetched once when a collection is first opened, then reused for all files in that collection
- The `virtual:collections` module provides the URL mapping (`collection name → /collections/{name}.schema.json`)

## Tab System

### Tab Bar

- **Metadata** tab — always first, shows all schema fields (complete form)
- **Body** tab — always second, shows the CodeMirror editor
- **Custom tabs** — derived by scanning all schema properties for `tab` arrays, collecting unique values, sorted alphabetically

### Field Filtering

- **Metadata tab:** renders all properties from the schema (unfiltered)
- **Custom tab (e.g., "dates"):** renders only properties whose `tab` array includes that tab name
- A field with `tab: ["dates", "social"]` appears in Metadata, Dates, and Social
- Collections with no `tab` annotations show only Metadata and Body

### Active Tab State

- Local component state, not URL-routed

## Component Architecture

```
Admin.svelte
└── editor-area
    ├── EditorToolbar.svelte (existing)
    ├── EditorTabs.svelte (NEW)
    └── tab content
        ├── MetadataForm.svelte (NEW)
        │   └── SchemaField.svelte (NEW — recursive dispatcher)
        │       ├── StringField.svelte (NEW)
        │       ├── NumberField.svelte (NEW)
        │       ├── BooleanField.svelte (NEW)
        │       ├── EnumField.svelte (NEW)
        │       ├── DateField.svelte (NEW)
        │       ├── ArrayField.svelte (NEW)
        │       │   └── SchemaField.svelte (recurse per item)
        │       └── ObjectField.svelte (NEW)
        │           └── SchemaField.svelte (recurse per property)
        └── EditorPane.svelte (existing — CodeMirror)
```

### Component Responsibilities

- **EditorTabs:** renders the tab bar, manages active tab state, derives custom tab names from schema
- **MetadataForm:** receives schema `properties`, `required` array, `formData` object, and optional `tab` filter string; walks properties and renders `SchemaField` for each
- **SchemaField:** reads a JSON Schema node, handles `anyOf` nullable patterns, dispatches to the correct leaf component based on `type`, `format`, `enum`, etc. Note: `$ref`/`$defs` resolution is not needed — Astro's generated schemas inline everything.
- **Leaf field components** (`StringField`, `NumberField`, etc.): thin wrappers around native HTML inputs, handling labels, descriptions, required indicators, and two-way binding to `formData`

## Schema-to-Input Mapping

| Schema Pattern | Component | HTML Element |
|---|---|---|
| `type: "string"` | `StringField` | `<input type="text">` |
| `type: "string", enum: [...]` | `EnumField` | `<select>` |
| `type: "string", format: "date-time"` | `DateField` | `<input type="date">` |
| `type: "boolean"` | `BooleanField` | `<input type="checkbox">` |
| `type: "number"` / `type: "integer"` | `NumberField` | `<input type="number">` |
| `type: "array"` | `ArrayField` | List with add/remove/reorder |
| `type: "object"` | `ObjectField` | Fieldset grouping, recurse |
| `anyOf: [{type: T}, {type: "null"}]` | Dispatch for type T | Nullable — unwrap the non-null type from `anyOf` and dispatch to whatever field that type normally produces. Empty input saves as `null`. |

### Note on `$schema` Property

Astro-generated schemas include a `$schema: { type: "string" }` entry in `properties`. This is a legitimate property — content files may declare a `$schema` key in their frontmatter. It renders as a normal string field like any other property. Do not filter or special-case it.

### Annotation Handling

- `title` → field label (falls back to property name, title-cased)
- `description` → help text displayed below the input
- `required` → asterisk on label
- `default` → pre-fill value when adding new array items or when value is undefined
- `deprecated` → dimmed styling with strikethrough label
- `readOnly` → disabled input

### Validation Constraint Display

- `maxLength` → shown in help text (e.g., "max 350")
- `minimum`, `maximum` → mapped to HTML `min`/`max` attributes on number inputs
- `exclusiveMinimum`, `exclusiveMaximum` → mapped to `min`/`max` with offset
- `multipleOf` → mapped to HTML `step` attribute
- `minItems`, `maxItems` → enforced on array add/remove controls
- `pattern` → mapped to HTML `pattern` attribute

## Array Management

### Rendering

- Each array item is a visual card with a header showing the item index ("Item 1", "Item 2")
- Arrays of objects: collapsible cards — header shows summary (first string property value or index), click toggles body
- Arrays of primitives: inline inputs with controls beside them (no collapsing)

### Per-Item Controls

- Drag handle (grip icon) on the left for drag-and-drop reorder
- Up arrow button (disabled on first item)
- Down arrow button (disabled on last item)
- Remove button (X icon)

### Array-Level Controls

- "Add" button at the bottom of the list
- New object items populated with `default` values from schema where available
- New primitive items: empty string / 0 / false depending on type

### Drag and Drop

- Native HTML Drag and Drop API (`draggable`, `dragstart`/`dragover`/`drop`)
- Visual feedback: drop target indicator line between items during drag
- No external library

### Empty State

- "No items" message with the Add button

## CodeMirror Layout Changes

### Current State

- `EditorPane` fills the entire editor area with `height: 100%`
- Borders only on left and right
- No constraints on vertical size

### New State

- CodeMirror renders inside the Body tab content area
- Fully bordered box (all four sides) with border-radius
- Padding around the box within the tab content area
- Max-height with internal scroll (does not stretch to fill viewport)
- Future toolbar slot above the CodeMirror content, inside the bordered box (empty for now)
- `EditorPane` already has `max-width: 80ch` — this is preserved, not new

### Editor Area Grid

- Changes from `grid-template-rows: auto 1fr` to `grid-template-rows: auto auto 1fr` (toolbar + tabs + tab content)
- Tab content panel scrolls independently

## State Changes to `editor.svelte.ts`

### New State

- `formData: Record<string, unknown>` — replaces `rawFrontmatter` as the source of truth for metadata
- `lastSavedFormData: Record<string, unknown>` — snapshot at last save for dirty comparison

### Modified Functions

- `loadFile(fileHandle, data)` — accepts pre-parsed frontmatter data, sets `formData = data`
- `saveFile()` — serializes `formData` via `js-yaml` `dump()` instead of using `rawFrontmatter`
- `clearEditor()` — also clears `formData`
- Dirty tracking — compares both `body !== lastSavedBody` and `JSON.stringify(formData) !== JSON.stringify(lastSavedFormData)` for deep equality (simple, reliable for serializable frontmatter data; `lastSavedFormData` is stored as a JSON string snapshot via `JSON.stringify` at save/load time)

### New Exports

- `getFormData()` — reactive getter for form data
- `updateFormField(path, value)` — updates a field in `formData` by path and marks dirty

## New Module: `schema.svelte.ts`

- Imports `virtual:collections` for the URL mapping
- `fetchSchema(collection: string)` — fetches and caches the JSON Schema for a collection
- `getSchema()` — reactive getter for the current schema
- Cache is a simple `Map<string, object>` keyed by collection name

## Files to Create

- `src/components/admin/EditorTabs.svelte`
- `src/components/admin/MetadataForm.svelte`
- `src/components/admin/fields/SchemaField.svelte`
- `src/components/admin/fields/StringField.svelte`
- `src/components/admin/fields/NumberField.svelte`
- `src/components/admin/fields/BooleanField.svelte`
- `src/components/admin/fields/EnumField.svelte`
- `src/components/admin/fields/DateField.svelte`
- `src/components/admin/fields/ArrayField.svelte`
- `src/components/admin/fields/ObjectField.svelte`
- `src/js/admin/schema.svelte.ts`

## Files to Modify

- `src/js/admin/editor.svelte.ts` — add `formData` state, modify `loadFile`, `saveFile`, `clearEditor`
- `src/components/admin/Admin.svelte` — pass pre-parsed data to `loadFile`, add tab structure
- `src/components/admin/EditorPane.svelte` — constrain CodeMirror to bounded box with border, padding, max-height, toolbar slot
