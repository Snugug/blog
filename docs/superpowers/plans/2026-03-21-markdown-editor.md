# Markdown Editor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a styled source Markdown editor to the CMS admin using CodeMirror 6, enabling content editing via the File System Access API.

**Architecture:** CodeMirror 6 integrated directly into Svelte 5 (no wrapper library). Editor state managed via a reactive `.svelte.ts` module following existing patterns. Route-driven file loading — clicking a content item navigates to `/admin/{collection}/{slug}`, which triggers file loading and editor rendering.

**Tech Stack:** CodeMirror 6, Svelte 5 runes, File System Access API, Lezer markdown parser

**Spec:** `docs/superpowers/specs/2026-03-21-markdown-editor-design.md`

---

## File Map

### New Files

| File | Responsibility |
|------|---------------|
| `src/js/admin/frontmatter.ts` | Pure function: splits markdown file into raw frontmatter YAML and body content |
| `src/js/admin/editor.svelte.ts` | Editor reactive state: file handle, body, raw frontmatter, dirty tracking, save |
| `src/components/admin/EditorPane.svelte` | Mounts CodeMirror EditorView, configures extensions, syncs content with editor state |
| `src/components/admin/EditorToolbar.svelte` | Filename display, dirty indicator, save button |
| `tests/js/admin/frontmatter.test.ts` | Unit tests for frontmatter/body splitting logic |

### Modified Files

| File | Change |
|------|--------|
| `src/js/admin/frontmatter-worker.ts:67` | Accept `.mdx` files in addition to `.md` |
| `src/js/admin/router.svelte.ts:2-4,14-23,50-71` | Add `file` route variant, parse slug from path, add navigation guard for dirty state |
| `src/js/admin/state.svelte.ts:129,149,166` | Change `mode: 'read'` to `mode: 'readwrite'` in three locations. Add `getFileHandle()` for slug-based file lookup. |
| `src/components/admin/ContentList.svelte:24-29` | Convert content items from `<span>` to `<a>` elements with `/admin/{collection}/{slug}` hrefs |
| `src/components/admin/Admin.svelte:1-56` | Import editor components, add file route handling, update grid to accommodate editor |

---

### Task 1: Install CodeMirror Dependencies

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install dependencies**

Run: `pnpm add codemirror @codemirror/lang-markdown @codemirror/language-data @lezer/highlight`

- [ ] **Step 2: Verify installation**

Run: `pnpm build`
Expected: Build succeeds (no import errors)

- [ ] **Step 3: Commit**

```
git add package.json pnpm-lock.yaml
git commit -m "Add CodeMirror 6 dependencies"
```

---

### Task 2: Update Frontmatter Worker to Accept .mdx Files

**Files:**
- Modify: `src/js/admin/frontmatter-worker.ts:67`

- [ ] **Step 1: Update file extension filter**

In `src/js/admin/frontmatter-worker.ts`, change line 67 from:

```typescript
if (entry.kind !== 'file' || !name.endsWith('.md')) continue;
```

to:

```typescript
if (entry.kind !== 'file' || (!name.endsWith('.md') && !name.endsWith('.mdx'))) continue;
```

- [ ] **Step 2: Run lint and format**

Run: `pnpm lint`
Run: `pnpm format`

- [ ] **Step 3: Commit**

```
git add src/js/admin/frontmatter-worker.ts
git commit -m "Support .mdx files in frontmatter worker"
```

---

### Task 3: Update Router With File Route and Navigation Guard

**Files:**
- Modify: `src/js/admin/router.svelte.ts`

The router needs three changes: a new `file` route variant, slug parsing in `parsePathname`, and a dirty-state navigation guard.

- [ ] **Step 1: Add the `file` route variant to `AdminRoute` and update `parsePathname`**

Replace the `AdminRoute` type and `parsePathname` function:

```typescript
/** Parsed route state for the admin SPA */
export type AdminRoute =
  | { view: 'home' }
  | { view: 'collection'; collection: string }
  | { view: 'file'; collection: string; slug: string };

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
  if (segments.length >= 2) {
    return { view: 'file', collection: segments[0], slug: segments[1] };
  }
  if (segments.length === 1) {
    return { view: 'collection', collection: segments[0] };
  }
  return { view: 'home' };
}
```

- [ ] **Step 2: Add dirty state callback and navigation guard**

Add a dirty-state checker that the editor state module will register, and wire it into the navigate event handler. Add this after the `navigate` function:

```typescript
/** Callback to check if the editor has unsaved changes */
let dirtyChecker: (() => boolean) | null = null;

/**
 * Registers a function that returns whether the editor has unsaved changes.
 * Called by the editor state module during initialization.
 * @param checker - Function returning true if there are unsaved changes
 */
export function registerDirtyChecker(checker: () => boolean): void {
  dirtyChecker = checker;
}
```

Then update the `initRouter` function's navigate event handler to check dirty state *before* intercepting. The dirty check must happen before `event.intercept()` — if it happens inside the handler, the URL will update even when the user cancels (because `intercept()` has already claimed the navigation). Replace the `event.intercept` block and the lines immediately before it:

```typescript
    // Block navigation if editor has unsaved changes and user cancels
    if (
      dirtyChecker?.() &&
      !confirm('You have unsaved changes. Leave without saving?')
    ) {
      event.preventDefault();
      return;
    }

    event.intercept({
      handler() {
        route = parsePathname(url.pathname);
      },
    });
```

- [ ] **Step 3: Add beforeunload listener in initRouter**

Add a `beforeunload` listener inside `initRouter`, after the `navigate` listener:

```typescript
  window.addEventListener('beforeunload', (event) => {
    if (dirtyChecker?.()) {
      event.preventDefault();
    }
  });
```

- [ ] **Step 4: Run lint and format**

Run: `pnpm lint`
Run: `pnpm format`

- [ ] **Step 5: Commit**

```
git add src/js/admin/router.svelte.ts
git commit -m "Add file route variant and dirty-state navigation guard"
```

---

### Task 4: Update State for readwrite Permission and File Handle Lookup

**Files:**
- Modify: `src/js/admin/state.svelte.ts`

- [ ] **Step 1: Change permission mode from `'read'` to `'readwrite'`**

Three locations need updating:

Line 129 in `restoreHandle()`:
```typescript
    const perm = await stored.queryPermission({ mode: 'readwrite' });
```

Line 149 in `requestPermission()`:
```typescript
    const perm = await directoryHandle.requestPermission({ mode: 'readwrite' });
```

Line 166 in `pickDirectory()`:
```typescript
    const handle = await window.showDirectoryPicker({ mode: 'readwrite' });
```

- [ ] **Step 2: Add `getFileHandle` function**

Add this function after `getContentList()`:

```typescript
/**
 * Retrieves a FileSystemFileHandle for a content file by slug.
 * Traverses root → src → content → {collection} and matches the slug
 * against the content list to determine the full filename with extension.
 * @param collection - The collection name
 * @param slug - The filename without extension
 * @returns The file handle, or null if not found
 */
export async function getFileHandle(
  collection: string,
  slug: string,
): Promise<FileSystemFileHandle | null> {
  if (!directoryHandle) return null;

  // Find the full filename from the content list
  const item = contentList.find((i) => {
    const name = i.filename.replace(/\.mdx?$/, '');
    return name === slug;
  });
  if (!item) return null;

  try {
    const src = await directoryHandle.getDirectoryHandle('src');
    const content = await src.getDirectoryHandle('content');
    const collectionDir = await content.getDirectoryHandle(collection);
    return collectionDir.getFileHandle(item.filename);
  } catch {
    return null;
  }
}
```

- [ ] **Step 3: Run lint and format**

Run: `pnpm lint`
Run: `pnpm format`

- [ ] **Step 4: Commit**

```
git add src/js/admin/state.svelte.ts
git commit -m "Upgrade to readwrite permission, add file handle lookup"
```

---

### Task 5: Create Frontmatter Splitter and Editor State Module

**Files:**
- Create: `src/js/admin/frontmatter.ts`
- Create: `src/js/admin/editor.svelte.ts`
- Create: `tests/js/admin/frontmatter.test.ts`

The `splitFrontmatter` function lives in a plain `.ts` file (not `.svelte.ts`) so that node:test can import it without hitting Svelte rune syntax.

- [ ] **Step 1: Write the test for `splitFrontmatter`**

Create `tests/js/admin/frontmatter.test.ts`:

```typescript
import { describe, it } from 'node:test';
import assert from 'node:assert';
import { splitFrontmatter } from '../../src/js/admin/frontmatter.ts';

describe('splitFrontmatter', () => {
  it('splits standard frontmatter from body', () => {
    const content = '---\ntitle: Hello\n---\n\nBody text here.';
    const result = splitFrontmatter(content);
    assert.strictEqual(result.rawFrontmatter, 'title: Hello');
    assert.strictEqual(result.body, '\nBody text here.');
  });

  it('handles frontmatter with no trailing body newline', () => {
    const content = '---\ntitle: Test\n---\nBody';
    const result = splitFrontmatter(content);
    assert.strictEqual(result.rawFrontmatter, 'title: Test');
    assert.strictEqual(result.body, 'Body');
  });

  it('returns empty frontmatter and full content when no frontmatter', () => {
    const content = 'Just a body with no frontmatter.';
    const result = splitFrontmatter(content);
    assert.strictEqual(result.rawFrontmatter, '');
    assert.strictEqual(result.body, 'Just a body with no frontmatter.');
  });

  it('handles empty body after frontmatter', () => {
    const content = '---\ntitle: Empty\n---\n';
    const result = splitFrontmatter(content);
    assert.strictEqual(result.rawFrontmatter, 'title: Empty');
    assert.strictEqual(result.body, '');
  });

  it('strips BOM before splitting', () => {
    const content = '\uFEFF---\ntitle: BOM\n---\n\nBody.';
    const result = splitFrontmatter(content);
    assert.strictEqual(result.rawFrontmatter, 'title: BOM');
    assert.strictEqual(result.body, '\nBody.');
  });

  it('normalizes CRLF line endings', () => {
    const content = '---\r\ntitle: CRLF\r\n---\r\n\r\nBody.';
    const result = splitFrontmatter(content);
    assert.strictEqual(result.rawFrontmatter, 'title: CRLF');
    assert.strictEqual(result.body, '\nBody.');
  });

  it('rejects horizontal rule (----) as frontmatter', () => {
    const content = '----\nnot frontmatter\n---\n\nBody.';
    const result = splitFrontmatter(content);
    assert.strictEqual(result.rawFrontmatter, '');
    assert.strictEqual(result.body, '----\nnot frontmatter\n---\n\nBody.');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test --experimental-strip-types tests/js/admin/frontmatter.test.ts`
Expected: FAIL — module not found

- [ ] **Step 3: Create the frontmatter splitter**

Create `src/js/admin/frontmatter.ts`:

```typescript
/** Result of splitting a file into frontmatter and body */
export type SplitResult = {
  rawFrontmatter: string;
  body: string;
};

/**
 * Splits a markdown/MDX file into raw YAML frontmatter and body content.
 * Handles BOM stripping, CRLF normalization, and horizontal rule rejection.
 * @param content - Raw file content
 * @returns Object with rawFrontmatter (YAML between --- delimiters) and body
 */
export function splitFrontmatter(content: string): SplitResult {
  let str = content.startsWith('\uFEFF') ? content.slice(1) : content;
  str = str.replace(/\r\n/g, '\n');

  if (str.startsWith('----') || !str.startsWith('---\n')) {
    return { rawFrontmatter: '', body: str };
  }

  const closeIndex = str.indexOf('\n---\n', 3);
  if (closeIndex === -1) {
    // Check for --- at end of file with no trailing newline
    if (str.endsWith('\n---')) {
      return {
        rawFrontmatter: str.slice(4, str.length - 4),
        body: '',
      };
    }
    return { rawFrontmatter: '', body: str };
  }

  return {
    rawFrontmatter: str.slice(4, closeIndex),
    body: str.slice(closeIndex + 5),
  };
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `node --test --experimental-strip-types tests/js/admin/frontmatter.test.ts`
Expected: All 7 tests pass

- [ ] **Step 5: Create the editor state module**

Create `src/js/admin/editor.svelte.ts`:

```typescript
import { registerDirtyChecker } from './router.svelte';
import { splitFrontmatter } from './frontmatter';

/** Editor file state exposed via getEditorFile() */
export type EditorFile = {
  handle: FileSystemFileHandle;
  body: string;
  rawFrontmatter: string;
  dirty: boolean;
  saving: boolean;
  filename: string;
};

/** Current file handle */
let handle = $state<FileSystemFileHandle | null>(null);
/** Markdown/MDX body content (without frontmatter) */
let body = $state('');
/** Raw YAML frontmatter string (between --- delimiters) */
let rawFrontmatter = $state('');
/** Whether body has changed since last save */
let dirty = $state(false);
/** Whether a save is in progress */
let saving = $state(false);
/** Snapshot of body at last save, for dirty comparison */
let lastSavedBody = '';
/** Current filename for display */
let filename = $state('');

// Register dirty checker with router for navigation guards
registerDirtyChecker(() => dirty);

/**
 * Returns the current editor file state, or null if no file is open.
 * @returns EditorFile object or null
 */
export function getEditorFile(): EditorFile | null {
  if (!handle) return null;
  return { handle, body, rawFrontmatter, dirty, saving, filename };
}

/**
 * Loads a file into the editor state.
 * Reads the file content, splits frontmatter from body, resets dirty state.
 * @param fileHandle - The FileSystemFileHandle to load
 */
export async function loadFile(
  fileHandle: FileSystemFileHandle,
): Promise<void> {
  handle = fileHandle;
  filename = fileHandle.name;
  saving = false;

  const file = await fileHandle.getFile();
  const text = await file.text();
  const split = splitFrontmatter(text);

  rawFrontmatter = split.rawFrontmatter;
  body = split.body;
  lastSavedBody = split.body;
  dirty = false;
}

/**
 * Updates the editor body content and computes dirty state.
 * Called by CodeMirror's update listener.
 * @param content - The new body content
 */
export function updateBody(content: string): void {
  body = content;
  dirty = content !== lastSavedBody;
}

/**
 * Saves the current file by reconstituting frontmatter + body.
 * Writes via FileSystemWritableFileStream.
 */
export async function saveFile(): Promise<void> {
  if (!handle) return;
  saving = true;

  try {
    let content = '';
    if (rawFrontmatter) {
      content = `---\n${rawFrontmatter}\n---\n`;
    }
    content += body;

    const writable = await handle.createWritable();
    await writable.write(content);
    await writable.close();

    lastSavedBody = body;
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
  rawFrontmatter = '';
  dirty = false;
  saving = false;
  lastSavedBody = '';
  filename = '';
}
```

- [ ] **Step 6: Run lint and format**

Run: `pnpm lint`
Run: `pnpm format`

- [ ] **Step 7: Commit**

```
git add src/js/admin/frontmatter.ts src/js/admin/editor.svelte.ts tests/js/admin/frontmatter.test.ts
git commit -m "Add frontmatter splitter and editor state module"
```

---

### Task 6: Create EditorPane Component

**Files:**
- Create: `src/components/admin/EditorPane.svelte`

This component mounts CodeMirror 6, configures all extensions, and syncs content with editor state.

- [ ] **Step 1: Create the component**

Create `src/components/admin/EditorPane.svelte`:

```svelte
<script>
  import { EditorView, keymap, lineWrapping } from '@codemirror/view';
  import { EditorState, Compartment } from '@codemirror/state';
  import { defaultKeymap, history, historyKeymap } from '@codemirror/commands';
  import { markdown, markdownLanguage } from '@codemirror/lang-markdown';
  import { languages } from '@codemirror/language-data';
  import {
    syntaxHighlighting,
    HighlightStyle,
  } from '@codemirror/language';
  import { tags as t } from '@lezer/highlight';
  import { getEditorFile, updateBody, saveFile } from '$js/admin/editor.svelte';

  /** Container element for CodeMirror */
  let container: HTMLDivElement;
  /** The CodeMirror EditorView instance */
  let view: EditorView | undefined;
  /** Compartment for swapping document content on file change */
  const docCompartment = new Compartment();

  /**
   * Highlight style that makes markdown visually styled while showing raw syntax.
   * Headings are larger and bold, bold text is bold, italic is italic,
   * syntax markers (**, *, #, `) are dimmed.
   */
  const markdownHighlight = HighlightStyle.define([
    // Headings — larger, bold
    { tag: t.heading1, fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--white)' },
    { tag: t.heading2, fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--white)' },
    { tag: t.heading3, fontSize: '1rem', fontWeight: 'bold', color: 'var(--white)' },
    // Emphasis
    { tag: t.strong, fontWeight: 'bold', color: 'var(--white)' },
    { tag: t.emphasis, fontStyle: 'italic', color: 'var(--white)' },
    // Inline code
    { tag: t.monospace, color: 'var(--light-orange)' },
    // Links
    { tag: t.link, color: 'var(--light-teal)', textDecoration: 'underline' },
    { tag: t.url, color: 'var(--light-green)' },
    // Syntax markers — dimmed
    { tag: t.processingInstruction, color: 'var(--grey)' },
    { tag: t.labelName, color: 'var(--light-teal)' },
    // Code block language tag
    { tag: t.tagName, color: 'var(--light-purple)' },
    // Lists
    { tag: t.list, color: 'var(--light-teal)' },
    // Blockquotes
    { tag: t.quote, color: 'var(--grey)', fontStyle: 'italic' },
    // Code block contents — language-specific highlighting
    { tag: t.keyword, color: 'var(--light-plum)' },
    { tag: t.string, color: 'var(--light-orange)' },
    { tag: t.variableName, color: 'var(--light-teal)' },
    { tag: t.function(t.variableName), color: 'var(--gold)' },
    { tag: t.typeName, color: 'var(--light-green)' },
    { tag: t.number, color: 'var(--light-purple)' },
    { tag: t.bool, color: 'var(--light-purple)' },
    { tag: t.comment, color: 'var(--grey)', fontStyle: 'italic' },
    { tag: t.operator, color: 'var(--light-red)' },
    { tag: t.punctuation, color: 'var(--grey)' },
    { tag: t.meta, color: 'var(--grey)' },
  ]);

  /** Keymap for saving with Cmd+S / Ctrl+S */
  const saveKeymap = keymap.of([
    {
      key: 'Mod-s',
      run() {
        saveFile();
        return true;
      },
    },
  ]);

  /** Base editor theme matching the admin color scheme */
  const editorTheme = EditorView.theme({
    '&': {
      fontSize: '1rem',
      height: '100%',
    },
    '.cm-content': {
      fontFamily: "'SF Mono', 'Fira Code', 'Cascadia Code', monospace",
      padding: '1rem',
    },
    '.cm-scroller': {
      overflow: 'auto',
    },
    '&.cm-focused': {
      outline: 'none',
    },
    '.cm-line': {
      padding: '0 0.25rem',
    },
    '.cm-cursor': {
      borderLeftColor: 'var(--white)',
    },
    '.cm-selectionBackground': {
      background: 'var(--plum) !important',
    },
    '&.cm-focused .cm-selectionBackground': {
      background: 'var(--plum) !important',
    },
    '.cm-activeLine': {
      backgroundColor: 'hsla(225, 6%, 13%, 0.5)',
    },
    '.cm-gutters': {
      display: 'none',
    },
  });

  /**
   * Creates the full set of CodeMirror extensions.
   * @param doc - Initial document content
   * @returns Array of extensions
   */
  function createExtensions(doc: string) {
    return [
      editorTheme,
      history(),
      saveKeymap,
      keymap.of([...defaultKeymap, ...historyKeymap]),
      markdown({
        base: markdownLanguage,
        codeLanguages: languages,
      }),
      syntaxHighlighting(markdownHighlight),
      lineWrapping,
      EditorView.updateListener.of((update) => {
        if (update.docChanged) {
          updateBody(update.state.doc.toString());
        }
      }),
      EditorView.contentAttributes.of({ 'aria-label': 'Markdown editor' }),
    ];
  }

  /** Track the last loaded filename to detect file changes */
  let lastFilename = '';

  $effect(() => {
    const file = getEditorFile();

    if (!file) {
      // No file open — destroy editor if it exists
      if (view) {
        view.destroy();
        view = undefined;
        lastFilename = '';
      }
      return;
    }

    if (!view && container) {
      // First mount — create the editor
      lastFilename = file.filename;
      view = new EditorView({
        state: EditorState.create({
          doc: file.body,
          extensions: createExtensions(file.body),
        }),
        parent: container,
      });
    } else if (view && file.filename !== lastFilename) {
      // Different file selected — replace document
      lastFilename = file.filename;
      view.setState(
        EditorState.create({
          doc: file.body,
          extensions: createExtensions(file.body),
        }),
      );
    }
  });

  // Cleanup on component destroy
  $effect(() => {
    return () => {
      view?.destroy();
      view = undefined;
    };
  });
</script>

<div class="editor-pane" bind:this={container}></div>

<style lang="scss">
  .editor-pane {
    height: 100%;
    overflow: hidden;
  }
</style>
```

- [ ] **Step 2: Run lint and format**

Run: `pnpm lint`
Run: `pnpm format`

- [ ] **Step 3: Commit**

```
git add src/components/admin/EditorPane.svelte
git commit -m "Add EditorPane component with CodeMirror 6 integration"
```

---

### Task 7: Create EditorToolbar Component

**Files:**
- Create: `src/components/admin/EditorToolbar.svelte`

- [ ] **Step 1: Create the component**

Create `src/components/admin/EditorToolbar.svelte`:

```svelte
<script>
  import { getEditorFile, saveFile } from '$js/admin/editor.svelte';

  /** Current editor file state */
  const file = $derived(getEditorFile());
</script>

{#if file}
  <header class="toolbar">
    <span class="filename">
      {file.filename}
      {#if file.dirty}
        <span class="dirty-indicator" title="Unsaved changes">&bull;</span>
      {/if}
    </span>
    <button
      class="save-button"
      onclick={saveFile}
      disabled={!file.dirty || file.saving}
    >
      {file.saving ? 'Saving...' : 'Save'}
    </button>
  </header>
{/if}

<style lang="scss">
  .toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.5rem 1rem;
    border-bottom: 1px solid var(--dark-grey);
  }

  .filename {
    font-size: 0.875rem;
    color: var(--white);
  }

  .dirty-indicator {
    color: var(--gold);
    font-size: 1.25rem;
    vertical-align: middle;
    margin-left: 0.25rem;
  }

  .save-button {
    background: var(--plum);
    border: none;
    border-radius: 0.25rem;
    color: var(--white);
    cursor: pointer;
    font-size: 0.875rem;
    padding: 0.25rem 0.75rem;

    &:hover:not(:disabled) {
      background: var(--light-plum);
    }

    &:disabled {
      opacity: 0.5;
      cursor: default;
    }
  }
</style>
```

- [ ] **Step 2: Run lint and format**

Run: `pnpm lint`
Run: `pnpm format`

- [ ] **Step 3: Commit**

```
git add src/components/admin/EditorToolbar.svelte
git commit -m "Add EditorToolbar component"
```

---

### Task 8: Convert Content List Items to Links

**Files:**
- Modify: `src/components/admin/ContentList.svelte`

Content items must be `<a>` elements (per project semantic HTML rules) linking to `/admin/{collection}/{slug}` where slug = filename without extension.

- [ ] **Step 1: Update the template**

In `src/components/admin/ContentList.svelte`, the `collection` derived value currently only handles the `'collection'` view. Update it to also handle the `'file'` view, and add an `activeSlug` derived. Replace lines 6-9:

```svelte
  /** The currently selected collection name */
  const collection = $derived.by(() => {
    const r = getRoute();
    if (r.view === 'collection' || r.view === 'file') return r.collection;
    return null;
  });

  /** The currently active file slug, if any */
  const activeSlug = $derived.by(() => {
    const r = getRoute();
    return r.view === 'file' ? r.slug : null;
  });
```

Then replace the `<li>` items (lines 24-29) with `<a>` elements. Replace the `{#each}` block:

```svelte
        {#each getContentList() as item}
          {@const slug = item.filename.replace(/\.mdx?$/, '')}
          <li>
            <a
              href="/admin/{collection}/{slug}"
              class="file-link"
              aria-current={activeSlug === slug ? 'page' : undefined}
            >
              <span class="file-title">{item.title ?? item.filename}</span>
              {#if item.title}
                <span class="file-name">{item.filename}</span>
              {/if}
            </a>
          </li>
        {/each}
```

- [ ] **Step 2: Update styles**

Replace the `.file-item` styles with `.file-link` styles. Remove the `.file-item` block and add:

```scss
  .file-link {
    display: grid;
    gap: 0.25rem;
    padding: 0.5rem 0.75rem;
    border-radius: 0.25rem;
    text-decoration: none;
    color: inherit;
    // Override global link box-shadow underline — list items use background highlight instead
    box-shadow: none;

    &:hover {
      background: var(--dark-grey);
    }

    &[aria-current='page'] {
      background: var(--plum);
    }
  }
```

- [ ] **Step 3: Run lint and format**

Run: `pnpm lint`
Run: `pnpm format`

- [ ] **Step 4: Commit**

```
git add src/components/admin/ContentList.svelte
git commit -m "Convert content list items to navigable links"
```

---

### Task 9: Wire Up Admin.svelte

**Files:**
- Modify: `src/components/admin/Admin.svelte`

This connects all the pieces: editor components render in the `1fr` column when a file route is active, and the grid adjusts.

- [ ] **Step 1: Update the script block**

Replace the entire `<script>` block:

```svelte
<script>
  import { onMount } from 'svelte';
  import { initRouter, getRoute } from '$js/admin/router.svelte';
  import {
    getDirectoryHandle,
    getPermissionState,
    restoreHandle,
    loadCollection,
    getFileHandle,
    getContentList,
  } from '$js/admin/state.svelte';
  import {
    loadFile,
    clearEditor,
    getEditorFile,
  } from '$js/admin/editor.svelte';
  import DirectoryPicker from './DirectoryPicker.svelte';
  import CollectionSidebar from './CollectionSidebar.svelte';
  import ContentList from './ContentList.svelte';
  import EditorToolbar from './EditorToolbar.svelte';
  import EditorPane from './EditorPane.svelte';

  /** Whether the admin is ready (handle exists and permission granted) */
  const ready = $derived(
    getDirectoryHandle() !== null && getPermissionState() === 'granted',
  );

  /** The current route for tracking collection changes */
  const currentRoute = $derived(getRoute());

  /** Whether a file is currently open in the editor */
  const fileOpen = $derived(currentRoute.view === 'file');

  /**
   * Dispatch worker when collection changes.
   * State module owns the worker, this effect just triggers it.
   */
  $effect(() => {
    if (ready && (currentRoute.view === 'collection' || currentRoute.view === 'file')) {
      loadCollection(currentRoute.collection);
    }
  });

  /**
   * Load file when route has a slug.
   * Reading getContentList() creates a reactive dependency so this effect
   * re-runs when the worker finishes loading the collection — fixing the
   * race condition where a deep-link arrives before content is loaded.
   */
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

  onMount(() => {
    initRouter();
    restoreHandle();
  });
</script>
```

- [ ] **Step 2: Update the template**

Replace the template (everything between `</script>` and `<style>`):

```svelte
<div
  class="admin"
  class:admin--connected={ready}
  class:admin--file-open={ready && fileOpen}
>
  {#if !ready}
    <DirectoryPicker />
  {:else}
    <CollectionSidebar />
    <ContentList />
    {#if fileOpen}
      <div class="editor-area">
        <EditorToolbar />
        <EditorPane />
      </div>
    {/if}
  {/if}
</div>
```

- [ ] **Step 3: Update the styles**

Replace the entire `<style>` block:

```svelte
<style lang="scss">
  .admin {
    min-height: 80vh;
  }

  .admin--connected {
    display: grid;
    grid-template-columns: 15rem 1fr;
  }

  .admin--file-open {
    grid-template-columns: 15rem 15rem 1fr;
  }

  .editor-area {
    display: grid;
    grid-template-rows: auto 1fr;
    overflow: hidden;
    border-left: 1px solid var(--dark-grey);
  }
</style>
```

- [ ] **Step 4: Run lint and format**

Run: `pnpm lint`
Run: `pnpm format`

- [ ] **Step 5: Commit**

```
git add src/components/admin/Admin.svelte
git commit -m "Wire editor components into admin shell"
```

---

### Task 10: Fix Static Paths and Manual Verification

**Files:**
- Modify: `src/pages/admin/[...path].astro`

The admin route's `getStaticPaths` only generates `/admin` and `/admin/{collection}`. File routes (`/admin/{collection}/{slug}`) will 404 in a static build because no page is generated for them. Since the admin is a client-only SPA (same HTML shell for all routes), add a wildcard catch-all path that covers any depth of URL segments.

- [ ] **Step 1: Add a fallback static path for file routes**

In `src/pages/admin/[...path].astro`, the `getStaticPaths` function currently generates paths for `/admin` and `/admin/{collection}`. Add paths for `/admin/{collection}/{slug}` by reading content files at build time. Add this after the existing collection paths:

```typescript
export function getStaticPaths() {
  const collections = Object.keys(schemas);
  return [
    { params: { path: undefined } },
    ...collections.map((name) => ({ params: { path: name } })),
    ...collections.flatMap((name) => {
      // Read content directory for this collection to generate file-level paths
      const contentDir = `src/content/${name}`;
      try {
        const files = import.meta.glob('/src/content/**/*.{md,mdx}', { eager: false });
        const prefix = `/src/content/${name}/`;
        return Object.keys(files)
          .filter((path) => path.startsWith(prefix))
          .map((path) => {
            const filename = path.slice(prefix.length);
            const slug = filename.replace(/\.mdx?$/, '');
            return { params: { path: `${name}/${slug}` } };
          });
      } catch {
        return [];
      }
    }),
  ];
}
```

Note: `import.meta.glob` is available in Astro/Vite at build time and will enumerate all matching files without importing them.

- [ ] **Step 2: Run the build**

Run: `pnpm build`
Expected: Build succeeds

- [ ] **Step 3: Start the dev server and verify in browser**

Run: `pnpm dev`

Open the admin at `http://localhost:PORT/admin/` and verify:

1. Directory picker works (now requests readwrite permission)
2. Collection sidebar shows collections
3. Content list shows files (including any `.mdx` files if present)
4. Content items are clickable links
5. Clicking a content item navigates to `/admin/{collection}/{slug}`
6. Editor loads with file content (frontmatter stripped, body in CodeMirror)
7. Markdown syntax is visually styled (headings larger, bold text bold, etc.)
8. Fenced code blocks get nested language highlighting
9. Editing triggers dirty indicator in toolbar
10. `Cmd+S` saves the file
11. Save button works
12. Navigating away from dirty editor shows confirmation dialog
13. Closing the browser tab with unsaved changes shows native browser warning

- [ ] **Step 4: Final commit if any adjustments needed**

If any adjustments were made during verification, lint, format, and commit.
