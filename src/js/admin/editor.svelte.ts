import { registerDirtyChecker } from './router.svelte';
import { splitFrontmatter } from './frontmatter';
import { dump } from 'js-yaml';
import { setByPath } from './schema-utils';
import type { PathSegment } from './schema-utils';

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

// Register dirty checker with router for navigation guards
registerDirtyChecker(() => dirty);

/**
 * Recomputes dirty state by comparing current body and formData
 * against their respective last-saved snapshots.
 */
function recomputeDirty(): void {
  dirty =
    body !== lastSavedBody || JSON.stringify(formData) !== lastSavedFormData;
}

/**
 * Returns the current editor file state, or null if no file is open.
 * @returns EditorFile object or null
 */
export function getEditorFile(): EditorFile | null {
  if (!handle) return null;
  return { handle, body, formData, dirty, saving, filename };
}

/**
 * Returns the current formData object reactively.
 * @returns The current parsed frontmatter data
 */
export function getFormData(): Record<string, unknown> {
  return formData;
}

/**
 * Updates a single field within formData by path and recomputes dirty state.
 * Uses setByPath to handle arbitrarily nested paths.
 * @param path - Ordered path segments addressing the field to update
 * @param value - The new value to assign at the given path
 */
export function updateFormField(path: PathSegment[], value: unknown): void {
  setByPath(formData, path, value);
  recomputeDirty();
}

/**
 * Loads a file into the editor state using pre-parsed frontmatter data.
 * Reads the file only for body extraction; frontmatter is supplied as data.
 * @param fileHandle - The FileSystemFileHandle to load
 * @param data - Pre-parsed frontmatter data object
 * @returns Promise that resolves when the file is loaded
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

  // Clone to avoid mutating the caller's object
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
 * Updates the editor body content and recomputes dirty state.
 * Called by CodeMirror's update listener.
 * @param content - The new body content
 */
export function updateBody(content: string): void {
  body = content;
  recomputeDirty();
}

/**
 * Saves the current file by serializing formData to YAML and
 * reconstituting the full frontmatter + body document.
 * Writes via FileSystemWritableFileStream.
 * @returns Promise that resolves when the file is saved
 */
export async function saveFile(): Promise<void> {
  if (!handle) return;
  saving = true;

  try {
    // dump() adds a trailing newline, so the template omits a \n before ---
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
