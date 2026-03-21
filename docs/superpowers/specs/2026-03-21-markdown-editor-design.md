# Markdown Editor Design Spec

## Overview

A styled source Markdown/MDX editor for the CMS admin, built on CodeMirror 6. Raw syntax is always visible — `**bold**` shows the asterisks — but text is visually styled: bold text looks bold, headings are larger, syntax markers are dimmed, and fenced code blocks get nested language highlighting.

The editor is designed as a reusable component for an Astro CMS, not just this blog. It supports consumer extensibility via CodeMirror's extension API, enabling users to add custom syntax highlighting (including MDX support) through plugins.

## Editor Library: CodeMirror 6

**Why CodeMirror 6:**

- **Text buffer architecture** — The document is a flat string of characters. The Lezer parser layers a syntax tree on top. Decorations apply visual styles to character ranges without modifying the text. This is exactly the model needed for styled source editing.
- **Styled source support** — Custom `HighlightStyle` maps Lezer markdown tags to CSS properties: `t.heading1` → large + bold, `t.strong` → bold, `t.emphasis` → italic, `t.monospace` → background + monospace. Syntax markers stay visible but get dimmed styling.
- **Nested code block highlighting** — `@codemirror/lang-markdown` with `codeLanguages` from `@codemirror/language-data` delegates fenced code block contents to language-specific parsers. Languages load dynamically on demand.
- **Extension system** — Facets, state fields, view plugins, decorations, compartments, and keymaps compose declaratively. Consumers pass additional CM6 extensions to add keybindings, decorations, or custom syntax highlighting for their remark/rehype plugins or MDX.
- **Bundle size** — ~124 KB gzipped for a full Markdown setup. Fully tree-shakeable and modular.
- **Maintenance** — 20-year track record, actively maintained by Marijn Haverbeke. 18 releases in 2026 alone.
- **Framework-agnostic** — No React dependency. Mounts to any DOM element.

**Alternatives considered and rejected:**

- **Monaco Editor** — 2+ MB gzipped, cannot style markdown inline (uniform monospace rendering), not tree-shakeable. Overkill for a CMS markdown editor.
- **Lexical** — Document model architecture converts syntax into semantic nodes (`**bold**` becomes a bold `TextNode` with asterisks removed). Cannot do styled source editing without fighting the framework.
- **Lightweight editors (CodeJar, Ace, Shiki, Prism)** — Can only apply syntax token coloring. None can make bold text visually bold or headings visually larger while showing raw syntax.

## Integration Approach

### No Wrapper Library

Direct CodeMirror integration via `bind:this` + `$effect`. The `svelte-codemirror-editor` wrapper is thin and adds a dependency that could lag behind CM6 updates. Manual integration is idiomatic in Svelte 5 and gives full control over the EditorView lifecycle.

### Dependencies

- `codemirror` — Meta-package (core, view, state, commands, search, autocomplete, lint)
- `@codemirror/lang-markdown` — Markdown language support with GFM
- `@codemirror/language-data` — Language descriptions for nested code block highlighting

### Base Extensions

- `@codemirror/lang-markdown` with `codeLanguages` for nested code block highlighting
- Custom `HighlightStyle` mapping Lezer markdown tags to visual CSS
- `keymap` with standard markdown keybindings (list continuation on Enter, etc.)
- `Cmd+S` / `Ctrl+S` keymap to trigger save
- Line wrapping enabled (prose, not code)
- No line numbers
- No minimap, no autocomplete, no lint
- `EditorView.theme()` matching the admin's existing color scheme
- `updateListener` facet to sync changes back to editor state

### Consumer Extensibility

CM6 extensions are values in an array. The CMS exposes a way to pass additional extensions. Consumers can provide their own keybindings, decorations, or custom syntax highlighting. This is the mechanism for MDX support — the CMS doesn't build it in, but a consumer can add `@codemirror/lang-javascript` nesting for JSX blocks.

## Architecture

### Route-Driven Loading

The existing router handles `/admin/{collection}/{slug}` paths where slug = filename without extension (e.g., `foo-bar.md` becomes `foo-bar`). Clicking a content item in the sidebar navigates to that path, which triggers state to load the file. The editor component reacts to state changes — no prop drilling, no callback drilling.

### Editor State Module

New file: `src/js/admin/editor.svelte.ts`

Follows the existing pattern of `state.svelte.ts` and `router.svelte.ts` — reactive state via Svelte 5 runes, exported getter functions.

**State shape:**

- `handle: FileSystemFileHandle | null` — Current file's handle
- `body: string` — Markdown/MDX body content (without frontmatter)
- `rawFrontmatter: string` — Raw YAML frontmatter string (between `---` delimiters)
- `dirty: boolean` — Whether body has changed since last save
- `saving: boolean` — Whether a save is in progress
- `lastSavedBody: string` — Snapshot for dirty comparison

**Exported functions:**

- `getEditorFile()` — Returns current file state or `null` if no file selected
- `loadFile(handle: FileSystemFileHandle)` — Reads file content, splits frontmatter from body using the existing frontmatter worker, populates state
- `updateBody(content: string)` — Called by CM6's update listener. Sets body content, computes dirty state by comparing against `lastSavedBody`
- `saveFile()` — Serializes full file: `---\n` + raw frontmatter YAML + `---\n\n` + body. Writes via `FileSystemWritableFileStream`. Updates `lastSavedBody`, clears dirty flag.

### Data Flow

1. User clicks content item in sidebar → router navigates to `/admin/{collection}/{slug}`
2. Route change triggers file handle lookup in state (slug matched against filenames without extension)
3. `loadFile()` reads file via File System Access API, sends to frontmatter worker
4. Worker splits frontmatter from body, returns both
5. Editor state populated → CodeMirror renders body content
6. User edits → CM6 `updateListener` calls `updateBody()` → dirty flag set
7. User saves (`Cmd+S` or save button) → `saveFile()` reconstitutes full file (frontmatter + body), writes via writable stream

### File System Access API

Currently opens in `'read'` mode. The editor needs `'readwrite'` mode — a single parameter change when requesting permission in `state.svelte.ts`.

### Dirty State & Save

- **Dirty tracking** — Compare current body against `lastSavedBody` snapshot
- **Save** — Reconstitutes full file: `---\n` + raw frontmatter YAML + `---\n\n` + body. Writes via `handle.createWritable()` → `write()` → `close()`.
- **`beforeunload`** — Warn if navigating away with unsaved changes
- **Keyboard shortcut** — `Cmd+S` / `Ctrl+S` intercepted by a CM6 keymap extension

## File Organization

### New Files

| File | Purpose |
|------|---------|
| `src/js/admin/editor.svelte.ts` | Editor reactive state module |
| `src/components/admin/EditorPane.svelte` | Mounts CodeMirror, manages EditorView lifecycle |
| `src/components/admin/EditorToolbar.svelte` | Filename display, dirty indicator, save button |

### Modified Files

| File | Change |
|------|--------|
| `src/js/admin/state.svelte.ts` | Expose file handle lookup by slug, upgrade permission to `'readwrite'` |
| `src/js/admin/router.svelte.ts` | Route state gains `slug` field: `{ view: 'file'; collection: string; slug: string }` |
| `src/components/admin/Admin.svelte` | Render EditorToolbar + EditorPane in `1fr` column when file route is active |

## Out of Scope

- Frontmatter form UI (future feature — will be schema-driven via Zod from `virtual:collections`)
- MDX language support built into the editor (consumers add via extension API)
- Content file creation or deletion
- Preview/live rendering
- Collaborative editing
