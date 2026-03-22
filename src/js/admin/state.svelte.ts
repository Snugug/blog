import schemas from 'virtual:collections';
import {
  loadBackend,
  saveBackend,
  clearBackend,
  type BackendConfig,
} from './storage';
import { StorageClient } from './storage-client';
import { getRoute, navigate } from './router.svelte';
import {
  getDrafts,
  getOutdatedMap,
  mergeDrafts,
  refreshDrafts,
  resetDraftMerge,
} from './draft-merge.svelte';

export { getDrafts, getOutdatedMap, refreshDrafts };

/**
 * Content item with full frontmatter data returned by the worker.
 */
export type ContentItem = {
  filename: string;
  data: Record<string, unknown>;
};

/**
 * Permission state for the stored FSA directory handle.
 */
type PermissionState = 'granted' | 'prompt' | 'denied';

/**
 * Backend type discriminator.
 */
type BackendType = 'fsa' | 'github' | null;

const collectionNames = Object.keys(schemas).sort();

// SharedWorker + StorageClient singleton
const sharedWorker = new SharedWorker(
  new URL('./storage-worker.ts', import.meta.url),
  { type: 'module', name: 'cms-storage' },
);
const storageClient = new StorageClient(sharedWorker.port);

// Reactive state
let backendType = $state<BackendType>(null);
let backendReady = $state(false);
let permissionState = $state<PermissionState>('denied');
let contentList = $state<ContentItem[]>([]);
let error = $state<string | null>(null);
let loading = $state(false);
let worker: Worker | null = null;
let loadedCollection = '';
// Per-collection content cache — instant sidebar on collection switch
const contentCache = new Map<string, ContentItem[]>();

/**
 * Returns the sorted list of collection names.
 * @return {string[]} Alphabetically sorted collection names
 */
export function getCollections(): string[] {
  return collectionNames;
}
/**
 * Returns the current backend type (reactive).
 * @return {BackendType} The active backend type, or null if not connected
 */
export function getBackendType(): BackendType {
  return backendType;
}
/**
 * Returns whether the backend is ready (reactive). This is the "logged in" check.
 * @return {boolean} True if a backend is initialized and ready
 */
export function isBackendReady(): boolean {
  return backendReady;
}
/**
 * Returns the current FSA permission state (reactive). Only meaningful when backendType === 'fsa'.
 * @return {PermissionState} The current permission state
 */
export function getPermissionState(): PermissionState {
  return permissionState;
}
/**
 * Returns the main-thread StorageClient for direct I/O from state/editor code.
 * @return {StorageClient} The storage client connected to the SharedWorker
 */
export function getStorageClient(): StorageClient {
  return storageClient;
}
/**
 * Returns the content list for the selected collection (reactive).
 * @return {ContentItem[]} The list of parsed content items
 */
export function getContentList(): ContentItem[] {
  return contentList;
}
/**
 * Returns the current error message (reactive).
 * @return {string | null} The error message, or null
 */
export function getError(): string | null {
  return error;
}
/**
 * Returns whether the worker is currently loading (reactive).
 * @return {boolean} True if actively parsing
 */
export function isLoading(): boolean {
  return loading;
}
/**
 * Initializes the singleton frontmatter worker and bridges a port to the SharedWorker.
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
      if (loadedCollection) contentCache.set(loadedCollection, data.items);
      loading = false;
      error = null;
      if (backendReady && loadedCollection) {
        mergeDrafts(loadedCollection);
      }
    } else if (data.type === 'error') {
      error = data.message;
      loading = false;
      contentList = [];
    }
  });

  // Bridge a port so the frontmatter worker can talk to the storage SharedWorker
  const channel = new MessageChannel();
  worker.postMessage({ type: 'port' }, [channel.port1]);
  sharedWorker.port.postMessage({ type: 'connect-port' }, [channel.port2]);

  return worker;
}

/**
 * Sends a parse request to the frontmatter worker. Refresh mode keeps current sidebar visible.
 * @param {string} collection - The collection name to parse
 * @param {boolean} refresh - If true, keep current contentList and skip loading state
 * @return {void}
 */
function dispatchWorker(collection: string, refresh = false): void {
  if (!backendReady) return;
  if (!refresh) {
    loading = true;
    contentList = [];
  }
  error = null;
  const w = ensureWorker();
  w.postMessage({ type: 'parse', collection });
}

/**
 * Restores a stored backend config from IndexedDB and initializes the SharedWorker.
 * @return {Promise<void>}
 */
export async function restoreBackend(): Promise<void> {
  try {
    const config = await loadBackend();
    if (!config) {
      backendType = null;
      backendReady = false;
      return;
    }

    if (config.type === 'fsa') {
      // Check FSA permission state
      const perm = await config.handle.queryPermission({ mode: 'readwrite' });
      permissionState = perm;
      backendType = 'fsa';

      if (perm === 'granted') {
        await storageClient.init({ type: 'init', backend: config });
        backendReady = true;
        navigateToFirstCollectionIfHome();
      }
      // If perm is 'prompt', BackendPicker shows re-auth button
    } else {
      // GitHub -- validate by initializing the adapter (which calls validate())
      try {
        await storageClient.init({ type: 'init', backend: config });
        backendType = 'github';
        backendReady = true;
        navigateToFirstCollectionIfHome();
      } catch {
        // Token expired or repo gone -- clear and show picker
        await clearBackend();
        backendType = null;
        backendReady = false;
      }
    }
  } catch {
    backendType = null;
    backendReady = false;
  }
}

/**
 * Requests readwrite permission on the stored FSA handle. Must be called from a user gesture.
 * @return {Promise<void>}
 */
export async function requestPermission(): Promise<void> {
  const config = await loadBackend();
  if (!config || config.type !== 'fsa') return;
  try {
    const perm = await config.handle.requestPermission({ mode: 'readwrite' });
    permissionState = perm;
    if (perm === 'granted') {
      await storageClient.init({ type: 'init', backend: config });
      backendReady = true;
      navigateToFirstCollectionIfHome();
    }
  } catch {
    permissionState = 'denied';
  }
}

/**
 * Opens the directory picker, initializes the FSA backend, and persists the config. Must be called from a user gesture.
 * @return {Promise<void>}
 */
export async function pickDirectory(): Promise<void> {
  try {
    const handle = await window.showDirectoryPicker({ mode: 'readwrite' });
    const config: BackendConfig = { type: 'fsa', handle };
    await storageClient.init({ type: 'init', backend: config });
    await saveBackend(config);
    backendType = 'fsa';
    permissionState = 'granted';
    backendReady = true;
    navigateToFirstCollectionIfHome();
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') return;
    error = err instanceof Error ? err.message : String(err);
  }
}

/**
 * Connects to a GitHub repository via PAT, initializes the GitHub backend, and persists the config.
 * @param {string} token - GitHub Personal Access Token
 * @param {string} repo - Repository in "owner/repo" format
 * @return {Promise<void>}
 */
export async function connectGitHub(
  token: string,
  repo: string,
): Promise<void> {
  const config: BackendConfig = { type: 'github', token, repo };
  await storageClient.init({ type: 'init', backend: config });
  await saveBackend(config);
  backendType = 'github';
  backendReady = true;
  navigateToFirstCollectionIfHome();
}

/**
 * Tears down the backend, clears persisted config, and resets all state.
 * @return {Promise<void>}
 */
export async function disconnect(): Promise<void> {
  worker?.terminate();
  worker = null;
  resetDraftMerge();
  await storageClient.teardown();
  await clearBackend();
  backendType = null;
  backendReady = false;
  permissionState = 'denied';
  contentList = [];
  contentCache.clear();
  loadedCollection = '';
  error = null;
  loading = false;
  navigate('/admin');
}

/**
 * Navigates to the first collection if currently on the /admin home view.
 * @return {void}
 */
function navigateToFirstCollectionIfHome(): void {
  const current = getRoute();
  if (current.view === 'home' && collectionNames.length > 0) {
    navigate(`/admin/${collectionNames[0]}`);
  }
}

/**
 * Loads a collection. Serves from cache instantly if available, then background refreshes.
 * @param {string} collection - The collection name to load
 * @return {void}
 */
export function loadCollection(collection: string): void {
  if (collection === loadedCollection) return;
  loadedCollection = collection;
  const cached = contentCache.get(collection);
  if (cached) {
    // Serve cached items instantly, then refresh in background
    contentList = cached;
    refreshDrafts(collection);
    dispatchWorker(collection, true);
  } else {
    dispatchWorker(collection);
  }
}

/**
 * Forces a background reload of the current collection, keeping the sidebar visible.
 * @param {string} collection - The collection to reload
 * @return {void}
 */
export function reloadCollection(collection: string): void {
  loadedCollection = collection;
  dispatchWorker(collection, true);
}

/**
 * Optimistically updates a single item's frontmatter in the content list and cache.
 * @param {string} filename - The filename to update
 * @param {Record<string, unknown>} data - The new frontmatter data
 * @return {void}
 */
export function updateContentItem(
  filename: string,
  data: Record<string, unknown>,
): void {
  const updated = contentList.map((item) =>
    item.filename === filename ? { ...item, data } : item,
  );
  contentList = updated;
  if (loadedCollection) contentCache.set(loadedCollection, updated);
}
