import schemas from 'virtual:collections';
import { loadHandle, saveHandle, clearHandle } from './storage';
import { getRoute, navigate } from './router.svelte';

// Content item with full frontmatter data returned by the worker
export type ContentItem = {
  filename: string;
  data: Record<string, unknown>;
};

// Permission state for the stored directory handle
type PermissionState = 'granted' | 'prompt' | 'denied';

// Collection names derived from virtual:collections, sorted alphabetically
const collectionNames = Object.keys(schemas).sort();

// The project root directory handle
let directoryHandle = $state<FileSystemDirectoryHandle | null>(null);
// Current permission state -- starts as 'denied' to show picker until restore completes
let permissionState = $state<PermissionState>('denied');
// Content items for the selected collection
let contentList = $state<ContentItem[]>([]);
// Error message, or null if no error
let error = $state<string | null>(null);
// Whether the worker is currently parsing
let loading = $state(false);

// Singleton web worker instance
let worker: Worker | null = null;
// The collection currently loaded (or being loaded) to avoid redundant dispatches
let loadedCollection = '';

/**
 * Returns the sorted list of collection names.
 * @return {string[]} Alphabetically sorted collection names
 */
export function getCollections(): string[] {
  return collectionNames;
}

/**
 * Returns the current directory handle (reactive).
 * @return {FileSystemDirectoryHandle | null} The project root directory handle, or null if not set
 */
export function getDirectoryHandle(): FileSystemDirectoryHandle | null {
  return directoryHandle;
}

/**
 * Returns the current permission state (reactive).
 * @return {PermissionState} The current readwrite permission state for the stored directory handle
 */
export function getPermissionState(): PermissionState {
  return permissionState;
}

/**
 * Returns the content list for the selected collection (reactive).
 * @return {ContentItem[]} The list of parsed content items for the active collection
 */
export function getContentList(): ContentItem[] {
  return contentList;
}

/**
 * Retrieves a FileSystemFileHandle for a content file by slug, traversing root → src → content → {collection}.
 * Matches the slug against the content list to resolve the full filename with extension.
 * @param {string} collection - The collection name
 * @param {string} slug - The filename without extension
 * @return {Promise<FileSystemFileHandle | null>} The file handle, or null if not found or no directory is open
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

/**
 * Returns the current error message (reactive).
 * @return {string | null} The error message, or null if there is no error
 */
export function getError(): string | null {
  return error;
}

/**
 * Returns whether the worker is currently loading (reactive).
 * @return {boolean} True if the worker is actively parsing files
 */
export function isLoading(): boolean {
  return loading;
}

/**
 * Initializes the singleton worker and sets up its message handler.
 * @return {Worker} The existing or newly created worker instance
 */
function ensureWorker(): Worker {
  if (worker) return worker;
  worker = new Worker(new URL('./frontmatter-worker.ts', import.meta.url), {
    type: 'module',
  });
  worker.addEventListener('message', (event) => {
    const data = event.data;
    if (data.type === 'result') {
      contentList = data.items;
      loading = false;
      error = null;
    } else if (data.type === 'error') {
      error = data.message;
      loading = false;
      contentList = [];
    }
  });
  return worker;
}

/**
 * Sends a parse request to the worker for the given collection.
 * @param {string} collection - The collection name to parse
 * @return {void}
 */
function dispatchWorker(collection: string): void {
  if (!directoryHandle) return;
  loading = true;
  error = null;
  contentList = [];
  const w = ensureWorker();
  w.postMessage({ type: 'parse', handle: directoryHandle, collection });
}

/**
 * Restores a stored directory handle from IndexedDB and checks its permission state.
 * @return {Promise<void>}
 */
export async function restoreHandle(): Promise<void> {
  try {
    const stored = await loadHandle();
    if (!stored) {
      permissionState = 'denied';
      return;
    }

    const perm = await stored.queryPermission({ mode: 'readwrite' });
    directoryHandle = stored;
    permissionState = perm;

    if (perm === 'granted') {
      navigateToFirstCollectionIfHome();
    }
  } catch {
    permissionState = 'denied';
  }
}

/**
 * Requests readwrite permission on the stored handle.
 * Must be called from a user gesture (click handler).
 * @return {Promise<void>}
 */
export async function requestPermission(): Promise<void> {
  if (!directoryHandle) return;
  try {
    const perm = await directoryHandle.requestPermission({ mode: 'readwrite' });
    permissionState = perm;
    if (perm === 'granted') {
      navigateToFirstCollectionIfHome();
    }
  } catch {
    permissionState = 'denied';
  }
}

/**
 * Opens the directory picker, persists the handle, and navigates into the admin.
 * Must be called from a user gesture (click handler).
 * @return {Promise<void>}
 */
export async function pickDirectory(): Promise<void> {
  try {
    const handle = await window.showDirectoryPicker({ mode: 'readwrite' });
    directoryHandle = handle;
    permissionState = 'granted';
    await saveHandle(handle);
    navigateToFirstCollectionIfHome();
  } catch (err) {
    // AbortError = user cancelled, silently ignore
    if (err instanceof DOMException && err.name === 'AbortError') return;
    error = err instanceof Error ? err.message : String(err);
  }
}

/**
 * Clears the stored handle, terminates the worker, and resets all state.
 * @return {Promise<void>}
 */
export async function disconnect(): Promise<void> {
  worker?.terminate();
  worker = null;
  await clearHandle();
  directoryHandle = null;
  permissionState = 'denied';
  contentList = [];
  loadedCollection = '';
  error = null;
  loading = false;
  navigate('/admin');
}

/**
 * Navigates to the first collection alphabetically, but only if currently on the /admin home view.
 * @return {void}
 */
function navigateToFirstCollectionIfHome(): void {
  const current = getRoute();
  if (current.view === 'home' && collectionNames.length > 0) {
    navigate(`/admin/${collectionNames[0]}`);
  }
}

/**
 * Triggers worker parsing for the given collection. Skips the dispatch if already loaded to avoid rebuilding the sidebar on file-level navigation.
 * @param {string} collection - The collection name to load
 * @return {void}
 */
export function loadCollection(collection: string): void {
  if (collection === loadedCollection) return;
  loadedCollection = collection;
  dispatchWorker(collection);
}
