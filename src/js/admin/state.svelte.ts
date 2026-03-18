import schemas from 'virtual:collections';
import { loadHandle, saveHandle, clearHandle } from './storage';
import { getRoute, navigate } from './router.svelte';

/** Content list item returned by the worker */
export type ContentItem = {
  filename: string;
  title: string | null;
};

/** Permission state for the stored directory handle */
type PermissionState = 'granted' | 'prompt' | 'denied';

/** Collection names derived from virtual:collections, sorted alphabetically */
const collectionNames = Object.keys(schemas).sort();

/** The project root directory handle */
let directoryHandle = $state<FileSystemDirectoryHandle | null>(null);
/** Current permission state -- starts as 'denied' to show picker until restore completes */
let permissionState = $state<PermissionState>('denied');
/** Content items for the selected collection */
let contentList = $state<ContentItem[]>([]);
/** Error message, or null if no error */
let error = $state<string | null>(null);
/** Whether the worker is currently parsing */
let loading = $state(false);

/** Singleton web worker instance */
let worker: Worker | null = null;

/**
 * Returns the sorted list of collection names.
 * @returns Array of collection name strings
 */
export function getCollections(): string[] {
  return collectionNames;
}

/**
 * Returns the current directory handle (reactive).
 * @returns The FileSystemDirectoryHandle or null
 */
export function getDirectoryHandle(): FileSystemDirectoryHandle | null {
  return directoryHandle;
}

/**
 * Returns the current permission state (reactive).
 * @returns The current PermissionState
 */
export function getPermissionState(): PermissionState {
  return permissionState;
}

/**
 * Returns the content list for the selected collection (reactive).
 * @returns Array of ContentItem
 */
export function getContentList(): ContentItem[] {
  return contentList;
}

/**
 * Returns the current error message (reactive).
 * @returns Error string or null
 */
export function getError(): string | null {
  return error;
}

/**
 * Returns whether the worker is currently loading (reactive).
 * @returns Boolean loading state
 */
export function isLoading(): boolean {
  return loading;
}

/**
 * Initializes the worker and sets up message handling.
 * @returns The worker instance
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
 * Dispatches a parse request to the worker for the given collection.
 * @param collection - The collection name to parse
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
 * Attempts to restore a stored directory handle from IndexedDB
 * and check its permission state.
 * @returns Promise that resolves when restoration is complete
 */
export async function restoreHandle(): Promise<void> {
  try {
    const stored = await loadHandle();
    if (!stored) {
      permissionState = 'denied';
      return;
    }

    const perm = await stored.queryPermission({ mode: 'read' });
    directoryHandle = stored;
    permissionState = perm;

    if (perm === 'granted') {
      navigateToFirstCollection();
    }
  } catch {
    permissionState = 'denied';
  }
}

/**
 * Requests read permission on the stored handle.
 * MUST be called from a user gesture handler (click).
 * @returns Promise that resolves when permission check is complete
 */
export async function requestPermission(): Promise<void> {
  if (!directoryHandle) return;
  try {
    const perm = await directoryHandle.requestPermission({ mode: 'read' });
    permissionState = perm;
    if (perm === 'granted') {
      navigateToFirstCollection();
    }
  } catch {
    permissionState = 'denied';
  }
}

/**
 * Opens the directory picker, stores the handle, and navigates to admin.
 * MUST be called from a user gesture handler (click).
 * @returns Promise that resolves when pick and navigation are complete
 */
export async function pickDirectory(): Promise<void> {
  try {
    const handle = await window.showDirectoryPicker({ mode: 'read' });
    directoryHandle = handle;
    permissionState = 'granted';
    await saveHandle(handle);
    navigateToFirstCollection();
  } catch (err) {
    // AbortError = user cancelled, silently ignore
    if (err instanceof DOMException && err.name === 'AbortError') return;
    error = err instanceof Error ? err.message : String(err);
  }
}

/**
 * Clears the stored handle, terminates the worker, and resets state.
 * @returns Promise that resolves when cleanup is complete
 */
export async function disconnect(): Promise<void> {
  worker?.terminate();
  worker = null;
  await clearHandle();
  directoryHandle = null;
  permissionState = 'denied';
  contentList = [];
  error = null;
  loading = false;
  navigate('/admin');
}

/**
 * Navigates to the first collection alphabetically.
 */
function navigateToFirstCollection(): void {
  if (collectionNames.length > 0) {
    navigate(`/admin/${collectionNames[0]}`);
  }
}

/**
 * Call when the selected collection changes to trigger worker parsing.
 * @param collection - The collection name to load
 */
export function loadCollection(collection: string): void {
  dispatchWorker(collection);
}
