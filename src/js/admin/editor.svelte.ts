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
 * @returns Promise that resolves when the file is loaded
 */
export async function loadFile(
  fileHandle: FileSystemFileHandle,
): Promise<void> {
  // Read and split the file BEFORE setting any reactive state.
  // Setting `handle` triggers EditorPane's $effect which reads `body` —
  // if we set handle first, the effect sees stale/empty body and creates
  // CodeMirror with an empty document.
  const file = await fileHandle.getFile();
  const text = await file.text();
  const split = splitFrontmatter(text);

  rawFrontmatter = split.rawFrontmatter;
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
 * @param content - The new body content
 */
export function updateBody(content: string): void {
  body = content;
  dirty = content !== lastSavedBody;
}

/**
 * Saves the current file by reconstituting frontmatter + body.
 * Writes via FileSystemWritableFileStream.
 * @returns Promise that resolves when the file is saved
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
