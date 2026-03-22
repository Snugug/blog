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

/** Permission state for the stored FSA directory handle. */
type PermissionState = 'granted' | 'prompt' | 'denied';
/** Backend type discriminator. */
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
// Resolves when the SharedWorker adapter is ready — dispatchWorker awaits this
let initPromise: Promise<void> | null = null;
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
 * Returns the active backend type, or null if not connected.
 * @return {BackendType}
 */
export function getBackendType(): BackendType {
  return backendType;
}
/**
 * Returns whether the backend is ready — the "logged in" check.
 * @return {boolean}
 */
export function isBackendReady(): boolean {
  return backendReady;
}
/**
 * Returns the FSA permission state. Only meaningful when backendType === 'fsa'.
 * @return {PermissionState}
 */
export function getPermissionState(): PermissionState {
  return permissionState;
}
/**
 * Returns the main-thread StorageClient for direct I/O.
 * @return {StorageClient}
 */
export function getStorageClient(): StorageClient {
  return storageClient;
}
/**
 * Returns the content list for the selected collection.
 * @return {ContentItem[]}
 */
export function getContentList(): ContentItem[] {
  return contentList;
}
/**
 * Returns the current error message, or null.
 * @return {string | null}
 */
export function getError(): string | null {
  return error;
}
/**
 * Returns whether the worker is currently loading.
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
  // Wait for the SharedWorker adapter to be ready before dispatching
  if (initPromise) await initPromise;
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
      // GitHub — show UI optimistically, validate in background
      backendType = 'github';
      backendReady = true;
      navigateToFirstCollectionIfHome();
      initPromise = storageClient
        .init({ type: 'init', backend: config })
        .catch(async () => {
          await clearBackend();
          backendType = null;
          backendReady = false;
          contentList = [];
          contentCache.clear();
          loadedCollection = '';
          navigate('/admin');
        })
        .finally(() => {
          initPromise = null;
        });
    }
  } catch {
    backendType = null;
    backendReady = false;
  }
}

/**
 * Re-requests FSA permission. Must be called from a user gesture.
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
 * Opens the directory picker and initializes the FSA backend. Must be called from a user gesture.
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
 * Connects to a GitHub repository via PAT and persists the config.
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
 * Disconnects the backend, clears credentials, and resets all state.
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
