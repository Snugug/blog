import { registerDirtyChecker } from './router.svelte';
import { splitFrontmatter } from './frontmatter';
import { dump } from 'js-yaml';
import { setByPath } from './schema-utils';
import type { PathSegment } from './schema-utils';

/** Editor file state exposed via getEditorFile() */
export type EditorFile = {
  handle: FileSystemFileHandle | null;
  body: string;
  formData: Record<string, unknown>;
  dirty: boolean;
  saving: boolean;
  filename: string;
  /** Whether the body content has been loaded from disk */
  bodyLoaded: boolean;
};

/** Current file handle — set once the async file read completes */
let handle = $state<FileSystemFileHandle | null>(null);
/** Markdown/MDX body content (without frontmatter) */
let body = $state('');
/** Parsed frontmatter data object, bound by the form editor */
let formData = $state<Record<string, unknown>>({});
/** Whether body or formData has changed since last save */
let dirty = $state(false);
/** Whether a save is in progress */
let saving = $state(false);
/** Snapshot of body at last save, for dirty comparison */
let lastSavedBody = '';
/** JSON snapshot of formData at last save, for dirty comparison */
let lastSavedFormData = '{}';
/** Current filename for display */
let filename = $state('');
/** Whether the file is open (metadata available, body may still be loading) */
let fileOpen = $state(false);
/** Whether the body content has finished loading from disk */
let bodyLoaded = $state(false);

// Register dirty checker with router for navigation guards
registerDirtyChecker(() => dirty);

/**
 * Recomputes dirty state by comparing body and formData against their saved snapshots.
 * @return {void}
 */
function recomputeDirty(): void {
  dirty =
    body !== lastSavedBody || JSON.stringify(formData) !== lastSavedFormData;
}

/**
 * Returns the current editor file state, or null if no file is open.
 * Returns immediately once preloadFile is called, before the body finishes loading.
 * @return {EditorFile | null} The current editor file state, or null if no file is open
 */
export function getEditorFile(): EditorFile | null {
  if (!fileOpen) return null;
  return { handle, body, formData, dirty, saving, filename, bodyLoaded };
}

/**
 * Returns the current formData object (reactive).
 * @return {Record<string, unknown>} The current form data
 */
export function getFormData(): Record<string, unknown> {
  return formData;
}

/**
 * Updates a single field within formData by path and recomputes dirty state.
 * @param {PathSegment[]} path - Ordered path segments addressing the field to update
 * @param {unknown} value - The new value to assign at the given path
 * @return {void}
 */
export function updateFormField(path: PathSegment[], value: unknown): void {
  setByPath(formData, path, value);
  recomputeDirty();
}

/**
 * Immediately populates the editor with metadata from the content list so the UI renders without waiting for the async file read. Call before loadFileBody.
 * @param {string} itemFilename - The content file's name
 * @param {Record<string, unknown>} data - Pre-parsed frontmatter data
 * @return {void}
 */
export function preloadFile(
  itemFilename: string,
  data: Record<string, unknown>,
): void {
  // Skip if this file is already loaded or preloaded
  if (filename === itemFilename && fileOpen) return;

  // Deep-clone to avoid mutating the caller's object
  // $state.snapshot strips Svelte reactive proxies to get a plain object
  formData = $state.snapshot(data) as Record<string, unknown>;
  lastSavedFormData = JSON.stringify(formData);
  body = '';
  lastSavedBody = '';
  dirty = false;
  saving = false;
  filename = itemFilename;
  handle = null;
  bodyLoaded = false;
  fileOpen = true;
}

/**
 * Loads the body content from disk for an already-preloaded file, completing the two-phase load.
 * @param {FileSystemFileHandle} fileHandle - The file handle to read
 * @return {Promise<void>}
 */
export async function loadFileBody(
  fileHandle: FileSystemFileHandle,
): Promise<void> {
  const file = await fileHandle.getFile();
  const text = await file.text();
  const split = splitFrontmatter(text);

  // Strip leading/trailing newlines from body for cleaner editing —
  // they get added back on save when reconstituting the file
  const trimmedBody = split.body.replace(/^\n+/, '').replace(/\n+$/, '');
  body = trimmedBody;
  lastSavedBody = trimmedBody;
  handle = fileHandle;
  bodyLoaded = true;
}

/**
 * Updates the editor body content and recomputes dirty state.
 * @param {string} content - The new body content
 * @return {void}
 */
export function updateBody(content: string): void {
  body = content;
  recomputeDirty();
}

/**
 * Serializes formData to YAML, reconstitutes the full frontmatter + body document, and writes it to disk.
 * @return {Promise<void>}
 */
export async function saveFile(): Promise<void> {
  if (!handle) return;
  saving = true;

  try {
    // dump() adds a trailing newline, so the template omits a \n before ---
    // Add leading newline before body and trailing newline after for clean file format
    const yaml = dump(formData, { lineWidth: -1 });
    const content = `---\n${yaml}---\n\n${body}\n`;

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
 * Resets all editor state.
 * @return {void}
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
  fileOpen = false;
  bodyLoaded = false;
}
