# Metadata Form Editor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a dynamic metadata form editor to the CMS admin that renders form fields from JSON Schema, supports tabbed navigation, and serializes back to YAML frontmatter.

**Architecture:** Recursive component tree renders form fields from JSON Schema nodes. A centralized reactive `formData` object (parsed frontmatter) is the source of truth. A tab system provides Metadata (all fields), Body (CodeMirror), and custom schema-defined tabs. Pure schema interpretation logic is extracted into testable utility functions.

**Tech Stack:** Svelte 5 (runes), JSON Schema 2020-12, js-yaml, CodeMirror 6, File System Access API, native HTML Drag and Drop API.

**Spec:** `docs/superpowers/specs/2026-03-21-metadata-form-design.md`

---

## File Structure

### New Files

| File | Responsibility |
|------|---------------|
| `src/js/admin/schema-utils.ts` | Pure functions: resolve schema types, extract tabs, create defaults, path-based object access |
| `src/js/admin/schema.svelte.ts` | Reactive state: fetch/cache JSON Schemas per collection |
| `src/components/admin/EditorTabs.svelte` | Tab bar: Metadata, Body, custom tabs from schema |
| `src/components/admin/MetadataForm.svelte` | Walks schema properties, renders SchemaField per property |
| `src/components/admin/fields/SchemaField.svelte` | Recursive dispatcher: reads schema node, renders correct field |
| `src/components/admin/fields/StringField.svelte` | `<input type="text">` with label, description, constraints |
| `src/components/admin/fields/NumberField.svelte` | `<input type="number">` with min/max/step |
| `src/components/admin/fields/BooleanField.svelte` | `<input type="checkbox">` with label |
| `src/components/admin/fields/EnumField.svelte` | `<select>` with enum options |
| `src/components/admin/fields/DateField.svelte` | `<input type="date">` |
| `src/components/admin/fields/ArrayField.svelte` | Array container: manages items list, add button, empty state |
| `src/components/admin/fields/ArrayItem.svelte` | Single array item: controls (drag, arrows, remove), collapse, renders SchemaField |
| `src/components/admin/fields/ObjectField.svelte` | Fieldset grouping, recurses SchemaField per property |
| `tests/js/admin/schema-utils.test.ts` | Tests for pure schema utility functions |

### Modified Files

| File | Changes |
|------|---------|
| `src/js/admin/editor.svelte.ts` | Replace `rawFrontmatter` with `formData`, change `loadFile` signature, update `saveFile` to serialize via `js-yaml` `dump()`, update dirty tracking |
| `src/components/admin/Admin.svelte` | Look up ContentItem by slug, pass `item.data` to `loadFile`, add EditorTabs, wire tabbed layout |
| `src/components/admin/EditorPane.svelte` | Bounded box with full border, padding, max-height, toolbar slot, remove `height: 100%` |

---

## Important Context for Implementers

- **Test runner:** `node --test --experimental-strip-types`. Tests go in `tests/` mirroring source structure. Use `node:test` and `node:assert`. Run with `pnpm unit:test`.
- **Svelte 5 runes:** This project uses `$state`, `$derived`, `$effect` — NOT stores or `$:` syntax.
- **Reactive state pattern:** State modules export getter functions (e.g., `getFormData()`) that read `$state` variables. Components call these in `$derived` or `$effect` to create reactive dependencies.
- **CSS rules:** Sizes in `rem` at `0.25rem` increments. Font sizes: `1rem` default, `0.875rem` for compact/labels, `0.75rem` only for captions/secondary info. Prefer CSS Grid. No pixels except borders ≤ 5px.
- **Semantic HTML:** Click handlers only on `<button>` or `<a>`. Use proper form elements (`<label>`, `<input>`, `<select>`).
- **Component size:** Files must not exceed 350 lines. Compose smaller components.
- **JSDoc:** All functions and classes require JSDoc comments with types, inputs, outputs, and brief descriptions.
- **Before committing:** Run `pnpm lint` and `pnpm fix`.
- **`virtual:collections`:** Returns `Record<string, string>` mapping collection name → schema URL (e.g., `"posts"` → `"/collections/posts.schema.json"`).
- **Existing `ContentItem` type** in `src/js/admin/state.svelte.ts`: `{ filename: string; data: Record<string, unknown> }`. The `data` field is already-parsed frontmatter.

---

### Task 1: Schema Utility Functions (Pure, Testable)

**Files:**
- Create: `src/js/admin/schema-utils.ts`
- Create: `tests/js/admin/schema-utils.test.ts`

These are pure functions with no Svelte dependencies — fully testable with node:test.

- [ ] **Step 1: Write tests for `resolveFieldType`**

This function takes a JSON Schema property node and returns a discriminated type descriptor. It handles: string, number, integer, boolean, array, object, enum, date-time format, anyOf nullable unwrapping.

```ts
// tests/js/admin/schema-utils.test.ts
import { describe, it } from 'node:test';
import assert from 'node:assert';
import { resolveFieldType } from '../../../src/js/admin/schema-utils.ts';

describe('resolveFieldType', () => {
  it('returns string for type: "string"', () => {
    const result = resolveFieldType({ type: 'string' });
    assert.strictEqual(result.kind, 'string');
  });

  it('returns enum for string with enum', () => {
    const result = resolveFieldType({ type: 'string', enum: ['a', 'b'] });
    assert.strictEqual(result.kind, 'enum');
    assert.deepStrictEqual(result.options, ['a', 'b']);
  });

  it('returns date for format: "date-time"', () => {
    const result = resolveFieldType({ type: 'string', format: 'date-time' });
    assert.strictEqual(result.kind, 'date');
  });

  it('returns number for type: "number"', () => {
    const result = resolveFieldType({ type: 'number' });
    assert.strictEqual(result.kind, 'number');
  });

  it('returns number for type: "integer"', () => {
    const result = resolveFieldType({ type: 'integer' });
    assert.strictEqual(result.kind, 'number');
  });

  it('returns boolean for type: "boolean"', () => {
    const result = resolveFieldType({ type: 'boolean' });
    assert.strictEqual(result.kind, 'boolean');
  });

  it('returns array for type: "array"', () => {
    const result = resolveFieldType({ type: 'array', items: { type: 'string' } });
    assert.strictEqual(result.kind, 'array');
  });

  it('returns object for type: "object"', () => {
    const result = resolveFieldType({ type: 'object', properties: {} });
    assert.strictEqual(result.kind, 'object');
  });

  it('unwraps anyOf nullable to inner type', () => {
    const result = resolveFieldType({
      anyOf: [{ type: 'string' }, { type: 'null' }],
    });
    assert.strictEqual(result.kind, 'string');
    assert.strictEqual(result.nullable, true);
  });

  it('unwraps anyOf nullable for non-string types', () => {
    const result = resolveFieldType({
      anyOf: [{ type: 'number' }, { type: 'null' }],
    });
    assert.strictEqual(result.kind, 'number');
    assert.strictEqual(result.nullable, true);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm unit:test`
Expected: FAIL — module not found

- [ ] **Step 3: Write tests for `extractTabs`**

Append to the test file:

```ts
import { extractTabs } from '../../../src/js/admin/schema-utils.ts';

describe('extractTabs', () => {
  it('returns empty array when no tabs defined', () => {
    const schema = {
      properties: { title: { type: 'string' } },
    };
    assert.deepStrictEqual(extractTabs(schema), []);
  });

  it('extracts unique tab names sorted alphabetically', () => {
    const schema = {
      properties: {
        published: { type: 'string', tab: ['dates', 'social'] },
        updated: { type: 'string', tab: ['dates'] },
        summary: { type: 'string', tab: ['social'] },
      },
    };
    assert.deepStrictEqual(extractTabs(schema), ['dates', 'social']);
  });

  it('sorts tabs alphabetically regardless of discovery order', () => {
    const schema = {
      properties: {
        a: { type: 'string', tab: ['zebra'] },
        b: { type: 'string', tab: ['alpha'] },
      },
    };
    assert.deepStrictEqual(extractTabs(schema), ['alpha', 'zebra']);
  });
});
```

- [ ] **Step 4: Write tests for `createDefaultValue`**

Append to the test file:

```ts
import { createDefaultValue } from '../../../src/js/admin/schema-utils.ts';

describe('createDefaultValue', () => {
  it('returns empty string for string type', () => {
    assert.strictEqual(createDefaultValue({ type: 'string' }), '');
  });

  it('returns 0 for number type', () => {
    assert.strictEqual(createDefaultValue({ type: 'number' }), 0);
  });

  it('returns false for boolean type', () => {
    assert.strictEqual(createDefaultValue({ type: 'boolean' }), false);
  });

  it('returns empty array for array type', () => {
    assert.deepStrictEqual(createDefaultValue({ type: 'array' }), []);
  });

  it('returns object with default values for object type', () => {
    const schema = {
      type: 'object',
      properties: {
        name: { type: 'string' },
        count: { type: 'number' },
      },
    };
    assert.deepStrictEqual(createDefaultValue(schema), { name: '', count: 0 });
  });

  it('uses schema default when provided', () => {
    assert.strictEqual(
      createDefaultValue({ type: 'string', default: 'hello' }),
      'hello',
    );
  });

  it('returns null for nullable types', () => {
    const schema = { anyOf: [{ type: 'string' }, { type: 'null' }] };
    assert.strictEqual(createDefaultValue(schema), null);
  });
});
```

- [ ] **Step 5: Write tests for `getByPath` and `setByPath`**

Append to the test file:

```ts
import { getByPath, setByPath } from '../../../src/js/admin/schema-utils.ts';

describe('getByPath', () => {
  it('gets top-level property', () => {
    assert.strictEqual(getByPath({ title: 'Hello' }, ['title']), 'Hello');
  });

  it('gets nested property', () => {
    const obj = { time: { active: '10 min' } };
    assert.strictEqual(getByPath(obj, ['time', 'active']), '10 min');
  });

  it('gets array element by index', () => {
    const obj = { items: ['a', 'b', 'c'] };
    assert.strictEqual(getByPath(obj, ['items', 1]), 'b');
  });

  it('returns undefined for missing path', () => {
    assert.strictEqual(getByPath({}, ['missing']), undefined);
  });
});

describe('setByPath', () => {
  it('sets top-level property', () => {
    const obj = { title: 'old' };
    setByPath(obj, ['title'], 'new');
    assert.strictEqual(obj.title, 'new');
  });

  it('sets nested property', () => {
    const obj = { time: { active: 'old' } };
    setByPath(obj, ['time', 'active'], 'new');
    assert.strictEqual(obj.time.active, 'new');
  });

  it('sets array element by index', () => {
    const obj = { items: ['a', 'b'] };
    setByPath(obj, ['items', 1], 'z');
    assert.strictEqual(obj.items[1], 'z');
  });

  it('creates intermediate objects if missing', () => {
    const obj: Record<string, unknown> = {};
    setByPath(obj, ['a', 'b'], 'value');
    assert.deepStrictEqual(obj, { a: { b: 'value' } });
  });
});
```

- [ ] **Step 6: Write tests for `getFieldsForTab`**

Append to the test file:

```ts
import { getFieldsForTab } from '../../../src/js/admin/schema-utils.ts';

describe('getFieldsForTab', () => {
  const schema = {
    properties: {
      title: { type: 'string' },
      published: { type: 'string', tab: ['dates', 'social'] },
      updated: { type: 'string', tab: ['dates'] },
      summary: { type: 'string', tab: ['social'] },
      categories: { type: 'array' },
    },
  };

  it('returns all property names for null tab (Metadata)', () => {
    const fields = getFieldsForTab(schema, null);
    assert.deepStrictEqual(fields, [
      'title',
      'published',
      'updated',
      'summary',
      'categories',
    ]);
  });

  it('returns only matching fields for a named tab', () => {
    const fields = getFieldsForTab(schema, 'dates');
    assert.deepStrictEqual(fields, ['published', 'updated']);
  });

  it('returns fields present in multiple tabs', () => {
    const fields = getFieldsForTab(schema, 'social');
    assert.deepStrictEqual(fields, ['published', 'summary']);
  });
});
```

- [ ] **Step 7: Implement `schema-utils.ts`**

```ts
// src/js/admin/schema-utils.ts

/** JSON Schema property node (subset of JSON Schema 2020-12 relevant to form rendering) */
export type SchemaNode = Record<string, unknown>;

/** Discriminated field type descriptor returned by resolveFieldType */
export type FieldType =
  | { kind: 'string'; nullable?: boolean }
  | { kind: 'number'; nullable?: boolean }
  | { kind: 'boolean'; nullable?: boolean }
  | { kind: 'date'; nullable?: boolean }
  | { kind: 'enum'; options: unknown[]; nullable?: boolean }
  | { kind: 'array'; nullable?: boolean }
  | { kind: 'object'; nullable?: boolean }
  | { kind: 'unknown'; nullable?: boolean };

/**
 * Resolves a JSON Schema node to a field type descriptor.
 * Handles anyOf nullable unwrapping, enum detection, and format: date-time.
 * @param schema - The JSON Schema property node
 * @returns A discriminated FieldType descriptor
 */
export function resolveFieldType(schema: SchemaNode): FieldType {
  // Handle anyOf nullable pattern: [{type: T}, {type: "null"}]
  if (Array.isArray(schema.anyOf)) {
    const nonNull = (schema.anyOf as SchemaNode[]).find(
      (s) => s.type !== 'null',
    );
    if (nonNull) {
      const inner = resolveFieldType(nonNull);
      return { ...inner, nullable: true };
    }
  }

  const type = schema.type as string | undefined;

  if (type === 'string') {
    if (Array.isArray(schema.enum)) {
      return { kind: 'enum', options: schema.enum as unknown[] };
    }
    if (schema.format === 'date-time') {
      return { kind: 'date' };
    }
    return { kind: 'string' };
  }

  if (type === 'number' || type === 'integer') {
    return { kind: 'number' };
  }

  if (type === 'boolean') {
    return { kind: 'boolean' };
  }

  if (type === 'array') {
    return { kind: 'array' };
  }

  if (type === 'object') {
    return { kind: 'object' };
  }

  return { kind: 'unknown' };
}

/**
 * Extracts unique custom tab names from a schema's properties.
 * Scans each property for a `tab` array and collects unique values.
 * @param schema - The root JSON Schema object
 * @returns Sorted array of unique tab name strings
 */
export function extractTabs(schema: SchemaNode): string[] {
  const props = schema.properties as Record<string, SchemaNode> | undefined;
  if (!props) return [];

  const tabs = new Set<string>();
  for (const prop of Object.values(props)) {
    if (Array.isArray(prop.tab)) {
      for (const t of prop.tab) {
        if (typeof t === 'string') tabs.add(t);
      }
    }
  }
  return [...tabs].sort();
}

/**
 * Creates a default value for a schema node.
 * Uses the schema's `default` if provided, otherwise returns a type-appropriate empty value.
 * @param schema - The JSON Schema property node
 * @returns The default value for the type
 */
export function createDefaultValue(schema: SchemaNode): unknown {
  if ('default' in schema) return schema.default;

  // Handle anyOf nullable — default to null
  if (Array.isArray(schema.anyOf)) return null;

  const type = schema.type as string | undefined;

  if (type === 'string') return '';
  if (type === 'number' || type === 'integer') return 0;
  if (type === 'boolean') return false;
  if (type === 'array') return [];
  if (type === 'object') {
    const props = schema.properties as Record<string, SchemaNode> | undefined;
    if (!props) return {};
    const obj: Record<string, unknown> = {};
    for (const [key, propSchema] of Object.entries(props)) {
      obj[key] = createDefaultValue(propSchema);
    }
    return obj;
  }

  return undefined;
}

/**
 * Gets a value from a nested object by path.
 * Path segments are strings (property names) or numbers (array indices).
 * @param obj - The object to read from
 * @param path - Array of path segments
 * @returns The value at the path, or undefined if not found
 */
export function getByPath(obj: unknown, path: (string | number)[]): unknown {
  let current = obj;
  for (const segment of path) {
    if (current == null || typeof current !== 'object') return undefined;
    current = (current as Record<string | number, unknown>)[segment];
  }
  return current;
}

/**
 * Sets a value in a nested object by path.
 * Creates intermediate objects if they don't exist.
 * @param obj - The object to modify
 * @param path - Array of path segments
 * @param value - The value to set
 */
export function setByPath(
  obj: Record<string, unknown>,
  path: (string | number)[],
  value: unknown,
): void {
  let current: Record<string | number, unknown> = obj;
  for (let i = 0; i < path.length - 1; i++) {
    const segment = path[i];
    if (current[segment] == null || typeof current[segment] !== 'object') {
      current[segment] = typeof path[i + 1] === 'number' ? [] : {};
    }
    current = current[segment] as Record<string | number, unknown>;
  }
  current[path[path.length - 1]] = value;
}

/**
 * Returns the list of property names to display for a given tab.
 * If tab is null (Metadata tab), returns all properties.
 * If tab is a string, returns only properties whose `tab` array includes it.
 * @param schema - The root JSON Schema object
 * @param tab - The tab name to filter by, or null for all properties
 * @returns Array of property name strings
 */
export function getFieldsForTab(
  schema: SchemaNode,
  tab: string | null,
): string[] {
  const props = schema.properties as Record<string, SchemaNode> | undefined;
  if (!props) return [];

  if (tab === null) return Object.keys(props);

  return Object.entries(props)
    .filter(([, prop]) => Array.isArray(prop.tab) && prop.tab.includes(tab))
    .map(([key]) => key);
}
```

- [ ] **Step 8: Run tests to verify they all pass**

Run: `pnpm unit:test`
Expected: All tests pass

- [ ] **Step 9: Lint and format**

Run: `pnpm lint`
Run: `pnpm fix`

- [ ] **Step 10: Commit**

```
git add src/js/admin/schema-utils.ts tests/js/admin/schema-utils.test.ts
git commit -m "Add schema utility functions for form builder"
```

---

### Task 2: Schema State Module

**Files:**
- Create: `src/js/admin/schema.svelte.ts`

This module fetches and caches JSON Schemas per collection using Svelte 5 reactive state.

- [ ] **Step 1: Create `schema.svelte.ts`**

```ts
// src/js/admin/schema.svelte.ts
import schemas from 'virtual:collections';

/** JSON Schema object type */
type JsonSchema = Record<string, unknown>;

/** Cache of fetched schemas keyed by collection name */
const cache = new Map<string, JsonSchema>();

/** Currently loaded schema */
let schema = $state<JsonSchema | null>(null);

/**
 * Returns the currently loaded JSON Schema (reactive).
 * @returns The schema object or null if not loaded
 */
export function getSchema(): JsonSchema | null {
  return schema;
}

/**
 * Fetches and caches the JSON Schema for a collection.
 * Sets the reactive `schema` state on success.
 * @param collection - The collection name to fetch the schema for
 */
export async function fetchSchema(collection: string): Promise<void> {
  const cached = cache.get(collection);
  if (cached) {
    schema = cached;
    return;
  }

  const url = schemas[collection];
  if (!url) return;

  const response = await fetch(url);
  const data = (await response.json()) as JsonSchema;
  cache.set(collection, data);
  schema = data;
}

/**
 * Clears the active schema. Called when navigating away from a file.
 */
export function clearSchema(): void {
  schema = null;
}
```

- [ ] **Step 2: Lint and format**

Run: `pnpm lint`
Run: `pnpm fix`

- [ ] **Step 3: Commit**

```
git add src/js/admin/schema.svelte.ts
git commit -m "Add schema state module for fetching/caching JSON Schemas"
```

---

### Task 3: Editor State Changes

**Files:**
- Modify: `src/js/admin/editor.svelte.ts`

Replace `rawFrontmatter` with `formData`, update `loadFile` to accept pre-parsed data, update `saveFile` to serialize via `js-yaml`, update dirty tracking.

- [ ] **Step 1: Update `editor.svelte.ts`**

Key changes:
1. Replace `rawFrontmatter` with `formData` and `lastSavedFormData` (as JSON string snapshot)
2. Change `loadFile(fileHandle)` to `loadFile(fileHandle, data)`
3. Update `saveFile()` to use `dump()` from `js-yaml`
4. Update `getEditorFile()` return type
5. Add `getFormData()` and `updateFormField(path, value)` exports
6. Update dirty tracking to include formData comparison

The full updated file (replaces existing content entirely):

```ts
// src/js/admin/editor.svelte.ts
import { dump } from 'js-yaml';
import { registerDirtyChecker } from './router.svelte';
import { splitFrontmatter } from './frontmatter';
import { getByPath, setByPath } from './schema-utils';

/** Editor file state exposed via getEditorFile() */
export type EditorFile = {
  handle: FileSystemFileHandle;
  body: string;
  formData: Record<string, unknown>;
  dirty: boolean;
  saving: boolean;
  filename: string;
};

/** Current file handle */
let handle = $state<FileSystemFileHandle | null>(null);
/** Markdown/MDX body content (without frontmatter) */
let body = $state('');
/** Parsed frontmatter data — source of truth for metadata */
let formData = $state<Record<string, unknown>>({});
/** Whether content has changed since last save */
let dirty = $state(false);
/** Whether a save is in progress */
let saving = $state(false);
/** Snapshot of body at last save, for dirty comparison */
let lastSavedBody = '';
/** JSON string snapshot of formData at last save, for dirty comparison */
let lastSavedFormData = '{}';
/** Current filename for display */
let filename = $state('');

// Register dirty checker with router for navigation guards
registerDirtyChecker(() => dirty);

/**
 * Returns the current editor file state, or null if no file is open.
 * @returns {EditorFile | null} EditorFile object or null
 */
export function getEditorFile(): EditorFile | null {
  if (!handle) return null;
  return { handle, body, formData, dirty, saving, filename };
}

/**
 * Returns the current form data (reactive).
 * @returns {Record<string, unknown>} The parsed frontmatter object
 */
export function getFormData(): Record<string, unknown> {
  return formData;
}

/**
 * Updates a field in formData by path and recomputes dirty state.
 * @param {(string | number)[]} path - Path segments to the field
 * @param {unknown} value - The new value
 */
export function updateFormField(
  path: (string | number)[],
  value: unknown,
): void {
  setByPath(formData, path, value);
  recomputeDirty();
}

/**
 * Loads a file into the editor state.
 * Accepts pre-parsed frontmatter data from the content list to avoid duplicate parsing.
 * Still reads the file to extract the body content.
 * @param {FileSystemFileHandle} fileHandle - The file handle to load
 * @param {Record<string, unknown>} data - Pre-parsed frontmatter data
 */
export async function loadFile(
  fileHandle: FileSystemFileHandle,
  data: Record<string, unknown>,
): Promise<void> {
  // Read and split the file BEFORE setting any reactive state.
  // Setting `handle` triggers EditorPane's $effect which reads `body` —
  // if we set handle first, the effect sees stale/empty body and creates
  // CodeMirror with an empty document.
  const file = await fileHandle.getFile();
  const text = await file.text();
  const split = splitFrontmatter(text);

  formData = structuredClone(data);
  lastSavedFormData = JSON.stringify(formData);
  body = split.body;
  lastSavedBody = split.body;
  dirty = false;
  saving = false;
  filename = fileHandle.name;
  handle = fileHandle;
}

/**
 * Updates the editor body content and computes dirty state.
 * Called by CodeMirror's update listener.
 * @param {string} content - The new body content
 */
export function updateBody(content: string): void {
  body = content;
  recomputeDirty();
}

/**
 * Recomputes dirty state by comparing body and formData to their saved snapshots.
 */
function recomputeDirty(): void {
  const bodyDirty = body !== lastSavedBody;
  const formDirty = JSON.stringify(formData) !== lastSavedFormData;
  dirty = bodyDirty || formDirty;
}

/**
 * Saves the current file by serializing formData to YAML and reconstituting with body.
 * Writes via FileSystemWritableFileStream.
 */
export async function saveFile(): Promise<void> {
  if (!handle) return;
  saving = true;

  try {
    const yaml = dump(formData, { lineWidth: -1 });
    const content = `---\n${yaml}---\n${body}`;

    const writable = await handle.createWritable();
    await writable.write(content);
    await writable.close();

    lastSavedBody = body;
    lastSavedFormData = JSON.stringify(formData);
    dirty = false;
  } finally {
    saving = false;
  }
}

/**
 * Clears the editor state. Called when navigating away from a file route.
 */
export function clearEditor(): void {
  handle = null;
  body = '';
  formData = {};
  dirty = false;
  saving = false;
  lastSavedBody = '';
  lastSavedFormData = '{}';
  filename = '';
}
```

- [ ] **Step 2: Lint and format**

Run: `pnpm lint`
Run: `pnpm fix`

- [ ] **Step 3: Commit**

```
git add src/js/admin/editor.svelte.ts
git commit -m "Replace rawFrontmatter with formData state, update loadFile/saveFile"
```

---

### Task 4: Update Admin.svelte to Pass Pre-parsed Data

**Files:**
- Modify: `src/components/admin/Admin.svelte:99-112`

Update the file-loading effect to look up the ContentItem by slug and pass `item.data` to `loadFile`.

- [ ] **Step 1: Update the file-loading effect in Admin.svelte**

Change the effect at lines 99-112 from:

```ts
$effect(() => {
  const items = getContentList();
  if (ready && currentRoute.view === 'file' && items.length > 0) {
    getFileHandle(currentRoute.collection, currentRoute.slug).then(
      (fileHandle) => {
        if (fileHandle) {
          loadFile(fileHandle);
        }
      },
    );
  } else if (currentRoute.view !== 'file') {
    clearEditor();
  }
});
```

To:

```ts
$effect(() => {
  const items = getContentList();
  if (ready && currentRoute.view === 'file' && items.length > 0) {
    // Look up the ContentItem by slug to get pre-parsed frontmatter
    const item = items.find(
      (i) => i.filename.replace(/\.mdx?$/, '') === currentRoute.slug,
    );
    if (!item) return;

    getFileHandle(currentRoute.collection, currentRoute.slug).then(
      (fileHandle) => {
        if (fileHandle) {
          loadFile(fileHandle, item.data);
        }
      },
    );
  } else if (currentRoute.view !== 'file') {
    clearEditor();
  }
});
```

- [ ] **Step 2: Verify the dev server still works**

Check the dev server is running. Navigate to `/admin/{collection}/{slug}` and confirm files still load without errors in the browser console.

- [ ] **Step 3: Lint and format**

Run: `pnpm lint`
Run: `pnpm fix`

- [ ] **Step 4: Commit**

```
git add src/components/admin/Admin.svelte
git commit -m "Pass pre-parsed frontmatter data to loadFile"
```

---

### Task 5: Leaf Field Components

**Files:**
- Create: `src/components/admin/fields/StringField.svelte`
- Create: `src/components/admin/fields/NumberField.svelte`
- Create: `src/components/admin/fields/BooleanField.svelte`
- Create: `src/components/admin/fields/EnumField.svelte`
- Create: `src/components/admin/fields/DateField.svelte`

All leaf components share a common pattern: label, input, description, required indicator. Each receives props for `name`, `schema`, `value`, and an `onchange` callback.

- [ ] **Step 1: Create StringField.svelte**

```svelte
<!-- src/components/admin/fields/StringField.svelte -->
<script lang="ts">
  import type { SchemaNode } from '$js/admin/schema-utils';

  /** Property name used as fallback label */
  let { name, schema, value, required = false, onchange }: {
    name: string;
    schema: SchemaNode;
    value: unknown;
    required?: boolean;
    onchange: (value: string | null) => void;
  } = $props();

  /** Display label from schema title or property name */
  const label = $derived(
    (schema.title as string) ?? name.charAt(0).toUpperCase() + name.slice(1),
  );

  /** Whether this field is nullable (from anyOf unwrapping) */
  const nullable = $derived(!!schema._nullable);

  /** Help text from schema description and constraints */
  const helpParts = $derived.by(() => {
    const parts: string[] = [];
    if (typeof schema.description === 'string') parts.push(schema.description);
    if (typeof schema.maxLength === 'number')
      parts.push(`max ${schema.maxLength}`);
    return parts;
  });

  /** Current string value for the input */
  const inputValue = $derived(typeof value === 'string' ? value : '');

  /**
   * Handles input events and dispatches the value change.
   * Empty string becomes null for nullable fields.
   * @param {Event} e - The input event
   */
  function handleInput(e: Event) {
    const target = e.target as HTMLInputElement;
    const newValue = target.value;
    onchange(nullable && newValue === '' ? null : newValue);
  }
</script>

<div class="field">
  <label class="field__label" for={name}>
    {label}
    {#if required}<span class="field__required">*</span>{/if}
  </label>
  <input
    class="field__input"
    type="text"
    id={name}
    value={inputValue}
    oninput={handleInput}
    pattern={typeof schema.pattern === 'string' ? schema.pattern : undefined}
    maxlength={typeof schema.maxLength === 'number'
      ? schema.maxLength
      : undefined}
    readonly={!!schema.readOnly}
    class:field__input--deprecated={!!schema.deprecated}
  />
  {#if helpParts.length > 0}
    <p class="field__help">{helpParts.join(' · ')}</p>
  {/if}
</div>

<style lang="scss">
  .field {
    margin-bottom: 1.25rem;
  }

  .field__label {
    display: block;
    font-size: 0.875rem;
    color: var(--white);
    margin-bottom: 0.25rem;
  }

  .field__required {
    color: var(--light-plum);
    margin-left: 0.25rem;
  }

  .field__input {
    display: block;
    width: 100%;
    background: var(--near-black, #2a2a2e);
    border: 1px solid var(--dark-grey);
    border-radius: 4px;
    padding: 0.5rem;
    font-size: 1rem;
    color: var(--white);

    &:focus {
      outline: 2px solid var(--plum);
      outline-offset: -1px;
    }

    &[readonly] {
      opacity: 0.5;
    }
  }

  .field__input--deprecated {
    opacity: 0.5;
  }

  .field__help {
    font-size: 0.75rem;
    color: var(--grey);
    margin-top: 0.25rem;
  }
</style>
```

- [ ] **Step 2: Create NumberField.svelte**

```svelte
<!-- src/components/admin/fields/NumberField.svelte -->
<script lang="ts">
  import type { SchemaNode } from '$js/admin/schema-utils';

  let { name, schema, value, required = false, onchange }: {
    name: string;
    schema: SchemaNode;
    value: unknown;
    required?: boolean;
    onchange: (value: number | null) => void;
  } = $props();

  const label = $derived(
    (schema.title as string) ?? name.charAt(0).toUpperCase() + name.slice(1),
  );

  const nullable = $derived(!!schema._nullable);

  /** Compute HTML min attribute from minimum or exclusiveMinimum */
  const min = $derived.by(() => {
    if (typeof schema.minimum === 'number') return schema.minimum;
    if (typeof schema.exclusiveMinimum === 'number')
      return (schema.exclusiveMinimum as number) + 1;
    return undefined;
  });

  /** Compute HTML max attribute from maximum or exclusiveMaximum */
  const max = $derived.by(() => {
    if (typeof schema.maximum === 'number') return schema.maximum;
    if (typeof schema.exclusiveMaximum === 'number')
      return (schema.exclusiveMaximum as number) - 1;
    return undefined;
  });

  const step = $derived(
    typeof schema.multipleOf === 'number' ? schema.multipleOf : undefined,
  );

  const inputValue = $derived(typeof value === 'number' ? value : '');

  /**
   * Handles input changes for number fields.
   * @param {Event} e - The input event
   */
  function handleInput(e: Event) {
    const target = e.target as HTMLInputElement;
    if (target.value === '') {
      onchange(nullable ? null : 0);
    } else {
      onchange(Number(target.value));
    }
  }
</script>

<div class="field">
  <label class="field__label" for={name}>
    {label}
    {#if required}<span class="field__required">*</span>{/if}
  </label>
  <input
    class="field__input"
    type="number"
    id={name}
    value={inputValue}
    oninput={handleInput}
    min={min}
    max={max}
    step={step}
    readonly={!!schema.readOnly}
  />
</div>

<style lang="scss">
  .field {
    margin-bottom: 1.25rem;
  }

  .field__label {
    display: block;
    font-size: 0.875rem;
    color: var(--white);
    margin-bottom: 0.25rem;
  }

  .field__required {
    color: var(--light-plum);
    margin-left: 0.25rem;
  }

  .field__input {
    display: block;
    width: auto;
    background: var(--near-black, #2a2a2e);
    border: 1px solid var(--dark-grey);
    border-radius: 4px;
    padding: 0.5rem;
    font-size: 1rem;
    color: var(--white);

    &:focus {
      outline: 2px solid var(--plum);
      outline-offset: -1px;
    }
  }
</style>
```

- [ ] **Step 3: Create BooleanField.svelte**

```svelte
<!-- src/components/admin/fields/BooleanField.svelte -->
<script lang="ts">
  import type { SchemaNode } from '$js/admin/schema-utils';

  let { name, schema, value, onchange }: {
    name: string;
    schema: SchemaNode;
    value: unknown;
    onchange: (value: boolean) => void;
  } = $props();

  const label = $derived(
    (schema.title as string) ?? name.charAt(0).toUpperCase() + name.slice(1),
  );

  const checked = $derived(!!value);

  /**
   * Handles checkbox toggle.
   * @param {Event} e - The change event
   */
  function handleChange(e: Event) {
    const target = e.target as HTMLInputElement;
    onchange(target.checked);
  }
</script>

<div class="field">
  <label class="field__checkbox-label">
    <input
      type="checkbox"
      id={name}
      checked={checked}
      onchange={handleChange}
      disabled={!!schema.readOnly}
    />
    {label}
  </label>
  {#if typeof schema.description === 'string'}
    <p class="field__help">{schema.description}</p>
  {/if}
</div>

<style lang="scss">
  .field {
    margin-bottom: 1.25rem;
  }

  .field__checkbox-label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.875rem;
    color: var(--white);
    cursor: pointer;
  }

  .field__help {
    font-size: 0.75rem;
    color: var(--grey);
    margin-top: 0.25rem;
  }
</style>
```

- [ ] **Step 4: Create EnumField.svelte**

```svelte
<!-- src/components/admin/fields/EnumField.svelte -->
<script lang="ts">
  import type { SchemaNode } from '$js/admin/schema-utils';

  let { name, schema, value, required = false, options, onchange }: {
    name: string;
    schema: SchemaNode;
    value: unknown;
    required?: boolean;
    options: unknown[];
    onchange: (value: string | null) => void;
  } = $props();

  const label = $derived(
    (schema.title as string) ?? name.charAt(0).toUpperCase() + name.slice(1),
  );

  const nullable = $derived(!!schema._nullable);
  const selectedValue = $derived(typeof value === 'string' ? value : '');

  /**
   * Handles select changes.
   * @param {Event} e - The change event
   */
  function handleChange(e: Event) {
    const target = e.target as HTMLSelectElement;
    const newValue = target.value;
    onchange(nullable && newValue === '' ? null : newValue);
  }
</script>

<div class="field">
  <label class="field__label" for={name}>
    {label}
    {#if required}<span class="field__required">*</span>{/if}
  </label>
  <select
    class="field__select"
    id={name}
    value={selectedValue}
    onchange={handleChange}
    disabled={!!schema.readOnly}
  >
    {#if !required || !value}
      <option value="">—</option>
    {/if}
    {#each options as opt}
      <option value={String(opt)}>{String(opt)}</option>
    {/each}
  </select>
  {#if typeof schema.description === 'string'}
    <p class="field__help">{schema.description}</p>
  {/if}
</div>

<style lang="scss">
  .field {
    margin-bottom: 1.25rem;
  }

  .field__label {
    display: block;
    font-size: 0.875rem;
    color: var(--white);
    margin-bottom: 0.25rem;
  }

  .field__required {
    color: var(--light-plum);
    margin-left: 0.25rem;
  }

  .field__select {
    display: block;
    width: auto;
    background: var(--near-black, #2a2a2e);
    border: 1px solid var(--dark-grey);
    border-radius: 4px;
    padding: 0.5rem;
    font-size: 1rem;
    color: var(--white);

    &:focus {
      outline: 2px solid var(--plum);
      outline-offset: -1px;
    }
  }

  .field__help {
    font-size: 0.75rem;
    color: var(--grey);
    margin-top: 0.25rem;
  }
</style>
```

- [ ] **Step 5: Create DateField.svelte**

```svelte
<!-- src/components/admin/fields/DateField.svelte -->
<script lang="ts">
  import type { SchemaNode } from '$js/admin/schema-utils';

  let { name, schema, value, required = false, onchange }: {
    name: string;
    schema: SchemaNode;
    value: unknown;
    required?: boolean;
    onchange: (value: string | null) => void;
  } = $props();

  const label = $derived(
    (schema.title as string) ?? name.charAt(0).toUpperCase() + name.slice(1),
  );

  const nullable = $derived(!!schema._nullable);

  /** Convert various date representations to YYYY-MM-DD string for the input */
  const inputValue = $derived.by(() => {
    if (value instanceof Date) {
      return value.toISOString().slice(0, 10);
    }
    if (typeof value === 'string') {
      // Handle ISO date-time strings by taking date part
      return value.slice(0, 10);
    }
    return '';
  });

  /**
   * Handles date input changes.
   * @param {Event} e - The input event
   */
  function handleInput(e: Event) {
    const target = e.target as HTMLInputElement;
    const newValue = target.value;
    onchange(nullable && newValue === '' ? null : newValue);
  }
</script>

<div class="field">
  <label class="field__label" for={name}>
    {label}
    {#if required}<span class="field__required">*</span>{/if}
  </label>
  <input
    class="field__input"
    type="date"
    id={name}
    value={inputValue}
    oninput={handleInput}
    readonly={!!schema.readOnly}
  />
  {#if typeof schema.description === 'string'}
    <p class="field__help">{schema.description}</p>
  {/if}
</div>

<style lang="scss">
  .field {
    margin-bottom: 1.25rem;
  }

  .field__label {
    display: block;
    font-size: 0.875rem;
    color: var(--white);
    margin-bottom: 0.25rem;
  }

  .field__required {
    color: var(--light-plum);
    margin-left: 0.25rem;
  }

  .field__input {
    display: block;
    width: auto;
    background: var(--near-black, #2a2a2e);
    border: 1px solid var(--dark-grey);
    border-radius: 4px;
    padding: 0.5rem;
    font-size: 1rem;
    color: var(--white);
    color-scheme: dark;

    &:focus {
      outline: 2px solid var(--plum);
      outline-offset: -1px;
    }
  }

  .field__help {
    font-size: 0.75rem;
    color: var(--grey);
    margin-top: 0.25rem;
  }
</style>
```

- [ ] **Step 6: Verify dev server compiles all new components**

Check dev server output for any compilation errors.

- [ ] **Step 7: Lint and format**

Run: `pnpm lint`
Run: `pnpm fix`

- [ ] **Step 8: Commit**

```
git add src/components/admin/fields/StringField.svelte src/components/admin/fields/NumberField.svelte src/components/admin/fields/BooleanField.svelte src/components/admin/fields/EnumField.svelte src/components/admin/fields/DateField.svelte
git commit -m "Add leaf field components: String, Number, Boolean, Enum, Date"
```

---

### Task 6: SchemaField Recursive Dispatcher

**Files:**
- Create: `src/components/admin/fields/SchemaField.svelte`

This component reads a JSON Schema node and dispatches to the correct leaf component. For `array` and `object` types, it defers to `ArrayField` and `ObjectField` (created in subsequent tasks), so those branches render a placeholder until those components exist.

- [ ] **Step 1: Create SchemaField.svelte**

```svelte
<!-- src/components/admin/fields/SchemaField.svelte -->
<script lang="ts">
  import { resolveFieldType } from '$js/admin/schema-utils';
  import type { SchemaNode } from '$js/admin/schema-utils';
  import StringField from './StringField.svelte';
  import NumberField from './NumberField.svelte';
  import BooleanField from './BooleanField.svelte';
  import EnumField from './EnumField.svelte';
  import DateField from './DateField.svelte';
  import ArrayField from './ArrayField.svelte';
  import ObjectField from './ObjectField.svelte';

  let { name, schema, value, required = false, onchange }: {
    name: string;
    schema: SchemaNode;
    value: unknown;
    required?: boolean;
    onchange: (value: unknown) => void;
  } = $props();

  /** Resolve the schema node to a field type descriptor */
  const fieldType = $derived(resolveFieldType(schema));

  /**
   * Build an effective schema for rendering.
   * For nullable types, spread outer annotations onto the inner schema
   * with a _nullable flag so leaf components know to treat empty as null.
   */
  const effectiveSchema = $derived.by(() => {
    if (Array.isArray(schema.anyOf)) {
      const nonNull = (schema.anyOf as SchemaNode[]).find(
        (s) => s.type !== 'null',
      );
      if (nonNull) {
        // Spread all outer properties (annotations like title, description,
        // deprecated, readOnly, tab, etc.) onto the inner type schema.
        // Exclude anyOf itself to avoid infinite recursion.
        const { anyOf: _, ...outerProps } = schema;
        return { ...nonNull, ...outerProps, _nullable: true };
      }
    }
    return schema;
  });
</script>

{#if fieldType.kind === 'string'}
  <StringField {name} schema={effectiveSchema} {value} {required} onchange={(v) => onchange(v)} />
{:else if fieldType.kind === 'number'}
  <NumberField {name} schema={effectiveSchema} {value} {required} onchange={(v) => onchange(v)} />
{:else if fieldType.kind === 'boolean'}
  <BooleanField {name} schema={effectiveSchema} {value} onchange={(v) => onchange(v)} />
{:else if fieldType.kind === 'enum'}
  <EnumField {name} schema={effectiveSchema} {value} {required} options={fieldType.options} onchange={(v) => onchange(v)} />
{:else if fieldType.kind === 'date'}
  <DateField {name} schema={effectiveSchema} {value} {required} onchange={(v) => onchange(v)} />
{:else if fieldType.kind === 'array'}
  <ArrayField {name} {schema} {value} {required} {onchange} />
{:else if fieldType.kind === 'object'}
  <ObjectField {name} {schema} {value} {required} {onchange} />
{/if}
```

- [ ] **Step 2: Lint and format**

Run: `pnpm lint`
Run: `pnpm fix`

- [ ] **Step 3: Commit**

```
git add src/components/admin/fields/SchemaField.svelte
git commit -m "Add SchemaField recursive dispatcher component"
```

---

### Task 7: ObjectField Component

**Files:**
- Create: `src/components/admin/fields/ObjectField.svelte`

Renders a fieldset-style grouping for nested objects (e.g., recipe instruction `time` with `active`/`inactive`/`rest`). Recurses into SchemaField for each property.

- [ ] **Step 1: Create ObjectField.svelte**

```svelte
<!-- src/components/admin/fields/ObjectField.svelte -->
<script lang="ts">
  import type { SchemaNode } from '$js/admin/schema-utils';
  import SchemaField from './SchemaField.svelte';

  let { name, schema, value, required = false, onchange }: {
    name: string;
    schema: SchemaNode;
    value: unknown;
    required?: boolean;
    onchange: (value: unknown) => void;
  } = $props();

  const label = $derived(
    (schema.title as string) ?? name.charAt(0).toUpperCase() + name.slice(1),
  );

  const properties = $derived(
    (schema.properties as Record<string, SchemaNode>) ?? {},
  );

  const requiredFields = $derived(
    Array.isArray(schema.required) ? (schema.required as string[]) : [],
  );

  /** Current object value, defaulting to empty object */
  const objValue = $derived(
    (typeof value === 'object' && value !== null
      ? value
      : {}) as Record<string, unknown>,
  );

  /**
   * Updates a property within this object and dispatches the full updated object.
   * @param {string} key - The property name
   * @param {unknown} newValue - The new property value
   */
  function handleFieldChange(key: string, newValue: unknown) {
    const updated = { ...objValue, [key]: newValue };
    onchange(updated);
  }
</script>

<fieldset class="object-field">
  <legend class="object-field__legend">
    {label}
    {#if required}<span class="object-field__required">*</span>{/if}
  </legend>
  {#each Object.entries(properties) as [key, propSchema]}
    <SchemaField
      name={key}
      schema={propSchema}
      value={objValue[key]}
      required={requiredFields.includes(key)}
      onchange={(v) => handleFieldChange(key, v)}
    />
  {/each}
</fieldset>

<style lang="scss">
  .object-field {
    border: 1px solid var(--dark-grey);
    border-radius: 4px;
    padding: 1rem;
    margin-bottom: 1.25rem;
  }

  .object-field__legend {
    font-size: 0.875rem;
    color: var(--white);
    padding: 0 0.5rem;
  }

  .object-field__required {
    color: var(--light-plum);
    margin-left: 0.25rem;
  }
</style>
```

- [ ] **Step 2: Lint and format**

Run: `pnpm lint`
Run: `pnpm fix`

- [ ] **Step 3: Commit**

```
git add src/components/admin/fields/ObjectField.svelte
git commit -m "Add ObjectField component for nested object schemas"
```

---

### Task 8: ArrayField and ArrayItem Components

**Files:**
- Create: `src/components/admin/fields/ArrayField.svelte`
- Create: `src/components/admin/fields/ArrayItem.svelte`

Split into two components to stay under 350 lines. ArrayField manages the list (add, state, constraints). ArrayItem renders a single item (controls, drag, collapse, SchemaField).

- [ ] **Step 1: Create ArrayItem.svelte**

```svelte
<!-- src/components/admin/fields/ArrayItem.svelte -->
<script lang="ts">
  import type { SchemaNode } from '$js/admin/schema-utils';
  import SchemaField from './SchemaField.svelte';

  let {
    name,
    index,
    item,
    itemSchema,
    isObject,
    collapsed,
    dragging,
    dropTarget,
    isFirst,
    isLast,
    canRemove,
    onupdate,
    onremove,
    onmoveup,
    onmovedown,
    ontogglecollapse,
    ondragstart,
    ondragover,
    ondragleave,
    ondrop,
    ondragend,
  }: {
    name: string;
    index: number;
    item: unknown;
    itemSchema: SchemaNode;
    isObject: boolean;
    collapsed: boolean;
    dragging: boolean;
    dropTarget: boolean;
    isFirst: boolean;
    isLast: boolean;
    canRemove: boolean;
    onupdate: (value: unknown) => void;
    onremove: () => void;
    onmoveup: () => void;
    onmovedown: () => void;
    ontogglecollapse: () => void;
    ondragstart: () => void;
    ondragover: (e: DragEvent) => void;
    ondragleave: () => void;
    ondrop: () => void;
    ondragend: () => void;
  } = $props();

  /**
   * Gets a display summary for an object item (first string property value).
   * @param {unknown} val - The item value
   * @returns {string} Display summary
   */
  function getSummary(val: unknown): string {
    if (typeof val === 'object' && val !== null) {
      for (const v of Object.values(val)) {
        if (typeof v === 'string' && v.length > 0) return v;
      }
    }
    return `Item ${index + 1}`;
  }
</script>

<div
  class="array-item"
  class:array-item--dragging={dragging}
  class:array-item--drop-target={dropTarget}
  draggable="true"
  ondragstart={ondragstart}
  ondragover={ondragover}
  ondragleave={ondragleave}
  ondrop={ondrop}
  ondragend={ondragend}
  role="listitem"
>
  <div class="array-item__controls">
    <span class="array-item__drag-handle" aria-label="Drag to reorder">⠿</span>

    {#if isObject}
      <button
        class="array-item__collapse-btn"
        type="button"
        onclick={ontogglecollapse}
        aria-label={collapsed ? 'Expand' : 'Collapse'}
      >
        {collapsed ? '▶' : '▼'}
      </button>
      <span class="array-item__summary">{getSummary(item)}</span>
    {/if}

    <div class="array-item__actions">
      <button
        type="button"
        class="array-item__btn"
        onclick={onmoveup}
        disabled={isFirst}
        aria-label="Move up"
      >▲</button>
      <button
        type="button"
        class="array-item__btn"
        onclick={onmovedown}
        disabled={isLast}
        aria-label="Move down"
      >▼</button>
      <button
        type="button"
        class="array-item__btn array-item__btn--remove"
        onclick={onremove}
        disabled={!canRemove}
        aria-label="Remove item"
      >✕</button>
    </div>
  </div>

  {#if !(isObject && collapsed)}
    <div class="array-item__content">
      <SchemaField
        name={`${name}[${index}]`}
        schema={itemSchema}
        value={item}
        onchange={onupdate}
      />
    </div>
  {/if}
</div>

<style lang="scss">
  .array-item {
    border: 1px solid var(--dark-grey);
    border-radius: 4px;
    background: var(--near-black, #1e1e22);
  }

  .array-item--dragging {
    opacity: 0.5;
  }

  .array-item--drop-target {
    border-color: var(--plum);
  }

  .array-item__controls {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem;
    border-bottom: 1px solid var(--dark-grey);
  }

  .array-item__drag-handle {
    cursor: grab;
    color: var(--grey);
    user-select: none;
  }

  .array-item__collapse-btn {
    background: none;
    border: none;
    color: var(--grey);
    cursor: pointer;
    padding: 0;
    font-size: 0.75rem;
  }

  .array-item__summary {
    flex: 1;
    font-size: 0.875rem;
    color: var(--white);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .array-item__actions {
    display: flex;
    gap: 0.25rem;
    margin-left: auto;
  }

  .array-item__btn {
    background: none;
    border: none;
    color: var(--grey);
    cursor: pointer;
    padding: 0.25rem;
    font-size: 0.75rem;

    &:hover:not(:disabled) {
      color: var(--white);
    }

    &:disabled {
      opacity: 0.3;
      cursor: default;
    }
  }

  .array-item__btn--remove {
    &:hover:not(:disabled) {
      color: var(--light-red);
    }
  }

  .array-item__content {
    padding: 0.75rem;
  }
</style>
```

- [ ] **Step 2: Create ArrayField.svelte**

```svelte
<!-- src/components/admin/fields/ArrayField.svelte -->
<script lang="ts">
  import type { SchemaNode } from '$js/admin/schema-utils';
  import { createDefaultValue, resolveFieldType } from '$js/admin/schema-utils';
  import ArrayItem from './ArrayItem.svelte';

  let { name, schema, value, required = false, onchange }: {
    name: string;
    schema: SchemaNode;
    value: unknown;
    required?: boolean;
    onchange: (value: unknown) => void;
  } = $props();

  const label = $derived(
    (schema.title as string) ?? name.charAt(0).toUpperCase() + name.slice(1),
  );

  /** Schema for each array item */
  const itemSchema = $derived((schema.items as SchemaNode) ?? {});

  /** Whether items are objects (collapsible cards) or primitives (inline) */
  const isObjectItems = $derived(resolveFieldType(itemSchema).kind === 'object');

  /** Current array value */
  const items = $derived(Array.isArray(value) ? (value as unknown[]) : []);

  /** Track which object items are collapsed */
  let collapsed: boolean[] = $state([]);

  /** Index of the item currently being dragged */
  let dragIndex = $state<number | null>(null);

  /** Index of the current drop target position */
  let dropTarget = $state<number | null>(null);

  /** Min/max items constraints */
  const minItems = $derived(
    typeof schema.minItems === 'number' ? (schema.minItems as number) : 0,
  );
  const maxItems = $derived(
    typeof schema.maxItems === 'number'
      ? (schema.maxItems as number)
      : Infinity,
  );

  /** Adds a new item to the array with default values. */
  function addItem() {
    if (items.length >= maxItems) return;
    onchange([...items, createDefaultValue(itemSchema)]);
    collapsed = [...collapsed, false];
  }

  /** Removes an item at the given index. */
  function removeItem(index: number) {
    if (items.length <= minItems) return;
    onchange(items.filter((_, i) => i !== index));
    collapsed = collapsed.filter((_, i) => i !== index);
  }

  /** Moves an item from one index to another. */
  function moveItem(from: number, to: number) {
    if (to < 0 || to >= items.length) return;
    const updated = [...items];
    const [moved] = updated.splice(from, 1);
    updated.splice(to, 0, moved);
    onchange(updated);
    const cc = [...collapsed];
    const [mc] = cc.splice(from, 1);
    cc.splice(to, 0, mc);
    collapsed = cc;
  }

  /** Updates a single item at the given index. */
  function updateItem(index: number, newValue: unknown) {
    const updated = [...items];
    updated[index] = newValue;
    onchange(updated);
  }

  function handleDragOver(e: DragEvent, index: number) {
    e.preventDefault();
    dropTarget = index;
  }

  function handleDrop(index: number) {
    if (dragIndex !== null && dragIndex !== index) {
      moveItem(dragIndex, index);
    }
    dragIndex = null;
    dropTarget = null;
  }
</script>

<div class="array-field">
  <div class="array-field__header">
    <span class="array-field__label">
      {label}
      {#if required}<span class="array-field__required">*</span>{/if}
    </span>
  </div>

  {#if items.length === 0}
    <p class="array-field__empty">No items</p>
  {/if}

  <div class="array-field__items">
    {#each items as item, index}
      <ArrayItem
        {name}
        {index}
        {item}
        {itemSchema}
        isObject={isObjectItems}
        collapsed={collapsed[index] ?? false}
        dragging={dragIndex === index}
        dropTarget={dropTarget === index}
        isFirst={index === 0}
        isLast={index === items.length - 1}
        canRemove={items.length > minItems}
        onupdate={(v) => updateItem(index, v)}
        onremove={() => removeItem(index)}
        onmoveup={() => moveItem(index, index - 1)}
        onmovedown={() => moveItem(index, index + 1)}
        ontogglecollapse={() => (collapsed[index] = !collapsed[index])}
        ondragstart={() => (dragIndex = index)}
        ondragover={(e) => handleDragOver(e, index)}
        ondragleave={() => (dropTarget = null)}
        ondrop={() => handleDrop(index)}
        ondragend={() => { dragIndex = null; dropTarget = null; }}
      />
    {/each}
  </div>

  <button
    type="button"
    class="array-field__add"
    onclick={addItem}
    disabled={items.length >= maxItems}
  >
    + Add item
  </button>
</div>

<style lang="scss">
  .array-field {
    margin-bottom: 1.25rem;
  }

  .array-field__header {
    margin-bottom: 0.5rem;
  }

  .array-field__label {
    font-size: 0.875rem;
    color: var(--white);
  }

  .array-field__required {
    color: var(--light-plum);
    margin-left: 0.25rem;
  }

  .array-field__empty {
    font-size: 0.75rem;
    color: var(--grey);
    margin-bottom: 0.5rem;
  }

  .array-field__items {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .array-field__add {
    margin-top: 0.5rem;
    background: none;
    border: 1px dashed var(--dark-grey);
    border-radius: 4px;
    padding: 0.5rem 0.75rem;
    font-size: 0.875rem;
    color: var(--grey);
    cursor: pointer;

    &:hover:not(:disabled) {
      border-color: var(--grey);
      color: var(--white);
    }

    &:disabled {
      opacity: 0.3;
      cursor: default;
    }
  }
</style>
```

- [ ] **Step 3: Verify dev server compiles without errors**

- [ ] **Step 4: Lint and format**

Run: `pnpm lint`
Run: `pnpm fix`

- [ ] **Step 5: Commit**

```
git add src/components/admin/fields/ArrayField.svelte src/components/admin/fields/ArrayItem.svelte
git commit -m "Add ArrayField and ArrayItem components with add/remove/reorder/drag-and-drop"
```

---

### Task 9: MetadataForm Component

**Files:**
- Create: `src/components/admin/MetadataForm.svelte`

Walks schema properties and renders a SchemaField for each. Accepts a `tab` filter to show only fields matching a custom tab.

- [ ] **Step 1: Create MetadataForm.svelte**

```svelte
<!-- src/components/admin/MetadataForm.svelte -->
<script lang="ts">
  import type { SchemaNode } from '$js/admin/schema-utils';
  import { getFieldsForTab } from '$js/admin/schema-utils';
  import { getFormData, updateFormField } from '$js/admin/editor.svelte';
  import SchemaField from './fields/SchemaField.svelte';

  let { schema, tab = null }: {
    schema: SchemaNode;
    tab?: string | null;
  } = $props();

  /** List of property names to render for this tab */
  const fieldNames = $derived(getFieldsForTab(schema, tab));

  /** Schema properties map */
  const properties = $derived(
    (schema.properties as Record<string, SchemaNode>) ?? {},
  );

  /** Required field names */
  const requiredFields = $derived(
    Array.isArray(schema.required) ? (schema.required as string[]) : [],
  );

  /** Current form data */
  const formData = $derived(getFormData());
</script>

<div class="metadata-form">
  {#each fieldNames as fieldName}
    {@const fieldSchema = properties[fieldName]}
    {#if fieldSchema}
      <SchemaField
        name={fieldName}
        schema={fieldSchema}
        value={formData[fieldName]}
        required={requiredFields.includes(fieldName)}
        onchange={(v) => updateFormField([fieldName], v)}
      />
    {/if}
  {/each}
</div>

<style lang="scss">
  .metadata-form {
    padding: 1.5rem;
    max-width: 80ch;
    margin: 0 auto;
    overflow-y: auto;
  }
</style>
```

- [ ] **Step 2: Lint and format**

Run: `pnpm lint`
Run: `pnpm fix`

- [ ] **Step 3: Commit**

```
git add src/components/admin/MetadataForm.svelte
git commit -m "Add MetadataForm component for rendering schema-driven fields"
```

---

### Task 10: EditorTabs Component

**Files:**
- Create: `src/components/admin/EditorTabs.svelte`

Tab bar with Metadata, Body, and custom tabs. Custom tab names derived from schema. Manages active tab state.

- [ ] **Step 1: Create EditorTabs.svelte**

```svelte
<!-- src/components/admin/EditorTabs.svelte -->
<script lang="ts">
  import type { SchemaNode } from '$js/admin/schema-utils';
  import { extractTabs } from '$js/admin/schema-utils';

  let { schema, activeTab = 'metadata', onTabChange }: {
    schema: SchemaNode | null;
    activeTab?: string;
    onTabChange: (tab: string) => void;
  } = $props();

  /** Custom tab names derived from schema, sorted alphabetically */
  const customTabs = $derived(schema ? extractTabs(schema) : []);

  /** All tabs: Metadata, Body, then custom tabs */
  const allTabs = $derived(['metadata', 'body', ...customTabs]);
</script>

<nav class="tabs" aria-label="Editor tabs">
  {#each allTabs as tab}
    <button
      class="tabs__tab"
      class:tabs__tab--active={activeTab === tab}
      type="button"
      onclick={() => onTabChange(tab)}
      aria-selected={activeTab === tab}
      role="tab"
    >
      {tab === 'metadata'
        ? 'Metadata'
        : tab === 'body'
          ? 'Body'
          : tab.charAt(0).toUpperCase() + tab.slice(1)}
    </button>
  {/each}
</nav>

<style lang="scss">
  .tabs {
    display: flex;
    border-bottom: 1px solid var(--dark-grey);
  }

  .tabs__tab {
    padding: 0.5rem 1rem;
    font-size: 0.875rem;
    color: var(--grey);
    background: none;
    border: none;
    border-bottom: 2px solid transparent;
    cursor: pointer;

    &:hover {
      color: var(--white);
    }
  }

  .tabs__tab--active {
    color: var(--white);
    border-bottom-color: var(--plum);
  }
</style>
```

- [ ] **Step 2: Lint and format**

Run: `pnpm lint`
Run: `pnpm fix`

- [ ] **Step 3: Commit**

```
git add src/components/admin/EditorTabs.svelte
git commit -m "Add EditorTabs component with custom tab support"
```

---

### Task 11: EditorPane Layout Changes

**Files:**
- Modify: `src/components/admin/EditorPane.svelte`

Constrain CodeMirror to a bounded box with full border, padding, max-height, internal scroll, and a future toolbar slot.

- [ ] **Step 1: Update EditorPane.svelte template and styles**

Change the template from:
```svelte
<div class="editor-pane" bind:this={container}></div>
```

To:
```svelte
<div class="editor-wrapper">
  <div class="editor-box">
    <div class="editor-toolbar-slot">
      <!-- Future toolbar goes here -->
    </div>
    <div class="editor-pane" bind:this={container}></div>
  </div>
</div>
```

Replace the `<style>` section entirely with:

```scss
<style lang="scss">
  .editor-wrapper {
    padding: 1.5rem;
    max-width: 80ch;
    margin: 0 auto;
    overflow-y: auto;
  }

  .editor-box {
    border: 1px solid var(--dark-grey);
    border-radius: 4px;
    overflow: hidden;
    display: grid;
    grid-template-rows: auto 1fr;
    // Constrain height so editor doesn't fill viewport — scrolls internally
    max-height: 70vh;
  }

  .editor-toolbar-slot {
    // Reserve space for future toolbar
    border-bottom: 1px dashed var(--dark-grey);
    min-height: 0;
  }

  .editor-pane {
    overflow: auto;
  }

  // CodeMirror's .cm-content is a flex item that won't shrink below its
  // longest unbroken word (a URL) due to min-width: auto. Force it to
  // shrink so overflow-wrap can break long URLs inline.
  // Uses scoped parent + :global child (allowed per :global policy for
  // library-generated DOM that scoped CSS cannot reach).
  .editor-pane :global(.cm-content) {
    min-width: 0 !important;
  }

  // The Unicode Line Break Algorithm allows breaks between ] (Close
  // Punctuation) and ( (Open Punctuation) in markdown links, causing URLs
  // to jump to the next line. A ViewPlugin wraps Link nodes in .cm-link-wrap
  // spans, and break-all here makes all positions equally valid break points
  // so the browser fills each line to capacity — URLs start on the same
  // line as link text and break mid-URL at the edge.
  .editor-pane :global(.cm-link-wrap) {
    word-break: break-all;
  }
</style>
```

Also update the CodeMirror theme in the `editorTheme` to remove `height: '100%'`:

```ts
const editorTheme = EditorView.theme({
  '&': {
    fontSize: '1rem',
  },
  // ... rest stays the same
});
```

- [ ] **Step 2: Verify CodeMirror renders correctly in the dev server**

Navigate to a file page and confirm the editor renders in a bounded box with border on all sides, padding around it, and scrolls internally when content is long.

- [ ] **Step 3: Lint and format**

Run: `pnpm lint`
Run: `pnpm fix`

- [ ] **Step 4: Commit**

```
git add src/components/admin/EditorPane.svelte
git commit -m "Constrain CodeMirror to bounded box with toolbar slot"
```

---

### Task 12: Wire Tabbed Layout into Admin.svelte

**Files:**
- Modify: `src/components/admin/Admin.svelte`

Add imports for EditorTabs, MetadataForm, and schema state. Wire the tabbed layout so that Metadata/custom tabs show MetadataForm and Body tab shows EditorPane.

- [ ] **Step 1: Update Admin.svelte**

Add new imports at the top of the script:
```ts
import { fetchSchema, getSchema, clearSchema } from '$js/admin/schema.svelte';
import EditorTabs from './EditorTabs.svelte';
import MetadataForm from './MetadataForm.svelte';
```

Add active tab state:
```ts
/** Active editor tab */
let activeTab = $state('metadata');
```

Add effect to fetch schema when collection changes (after the existing collection-loading effect):
```ts
/**
 * Fetch the JSON Schema when collection changes.
 * Uses the same reactive dependency on the route.
 */
$effect(() => {
  if (
    ready &&
    (currentRoute.view === 'collection' || currentRoute.view === 'file')
  ) {
    fetchSchema(currentRoute.collection);
  } else {
    clearSchema();
  }
});
```

Reset active tab when file changes:
```ts
/** Reset to Metadata tab when a new file is opened */
$effect(() => {
  if (currentRoute.view === 'file') {
    activeTab = 'metadata';
  }
});
```

Update the editor area template from:
```svelte
{#if fileOpen}
  <div class="editor-area">
    <EditorToolbar />
    <EditorPane />
  </div>
{/if}
```

To:
```svelte
{#if fileOpen}
  {@const currentSchema = getSchema()}
  <div class="editor-area">
    <EditorToolbar />
    <EditorTabs
      schema={currentSchema}
      {activeTab}
      onTabChange={(tab) => (activeTab = tab)}
    />
    <div class="editor-content">
      {#if activeTab === 'body'}
        <EditorPane />
      {:else if currentSchema}
        <MetadataForm
          schema={currentSchema}
          tab={activeTab === 'metadata' ? null : activeTab}
        />
      {/if}
    </div>
  </div>
{/if}
```

Update the `.editor-area` grid in styles:
```scss
.editor-area {
  display: grid;
  grid-template-rows: auto auto 1fr;
  overflow: hidden;
  border-left: 1px solid var(--dark-grey);
}
```

Add `.editor-content` style:
```scss
.editor-content {
  overflow-y: auto;
}
```

- [ ] **Step 2: Verify the full flow in the dev server**

1. Navigate to `/admin/posts/{slug}` — should see tabs: Metadata, Body, Dates, Social
2. Metadata tab shows all fields
3. Body tab shows CodeMirror in a bounded box
4. Dates tab shows only published + updated
5. Social tab shows published + summary
6. Navigate to `/admin/categories/{slug}` — should see only Metadata, Body (no custom tabs)

- [ ] **Step 3: Lint and format**

Run: `pnpm lint`
Run: `pnpm fix`

- [ ] **Step 4: Commit**

```
git add src/components/admin/Admin.svelte
git commit -m "Wire tabbed metadata/body layout into admin editor"
```

---

### Task 13: Integration Verification

**Files:** None (verification only)

- [ ] **Step 1: Run unit tests**

Run: `pnpm unit:test`
Expected: All tests pass

- [ ] **Step 2: Run lint**

Run: `pnpm lint`
Expected: No errors or warnings

- [ ] **Step 3: Run format**

Run: `pnpm fix`

- [ ] **Step 4: Manual verification in browser**

Test the following scenarios:
1. **Posts collection** — All fields render: title (text), published (date), updated (date), summary (text with maxLength help text), categories (array of strings with add/remove/reorder), archived (checkbox)
2. **Categories collection** — Simple form: title (text), description (nullable string)
3. **Recipes collection** — Complex nested form: instructions (array of objects, each with time object, equipment array, ingredients array of objects, procedure array)
4. **Tab switching** — Metadata shows all fields, Body shows CodeMirror, custom tabs show filtered fields
5. **Editing** — Change a field value, dirty indicator appears, save with Cmd+S, verify file content
6. **Array management** — Add items, remove items, reorder with arrows, drag-and-drop reorder
7. **Navigation guard** — Edit a field, try to navigate away, confirm unsaved changes prompt appears

- [ ] **Step 5: Verify file sizes**

Check that no new file exceeds 350 lines:
Run: `wc -l src/components/admin/fields/*.svelte src/components/admin/EditorTabs.svelte src/components/admin/MetadataForm.svelte src/js/admin/schema-utils.ts src/js/admin/schema.svelte.ts`

- [ ] **Step 6: Final commit if any fixes were needed**
