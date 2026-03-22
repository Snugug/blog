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
const sharedWorker = new SharedWorker(
  new URL('./storage-worker.ts', import.meta.url),
  { type: 'module', name: 'cms-storage' },
);
const storageClient = new StorageClient(sharedWorker.port);
let backendType = $state<BackendType>(null);
let backendReady = $state(false);
let permissionState = $state<PermissionState>('denied');
let contentList = $state<ContentItem[]>([]);
let error = $state<string | null>(null);
let loading = $state(false);
let worker: Worker | null = null;
let loadedCollection = '';
let initPromise: Promise<void> | null = null;
const contentCache = new Map<string, ContentItem[]>();

/**
 * Exposes sorted collection names derived from virtual:collections.
 * @return {string[]} Alphabetically sorted collection names
 */
export function getCollections(): string[] {
  return collectionNames;
}
/**
 * Reactive getter for the active backend type.
 * @return {BackendType} The backend type, or null if not connected
 */
export function getBackendType(): BackendType {
  return backendType;
}
/**
 * Reactive "logged in" check used by Admin.svelte to gate the UI.
 * @return {boolean} True if a backend is initialized and ready
 */
export function isBackendReady(): boolean {
  return backendReady;
}
/**
 * Reactive FSA permission state for the re-auth flow in BackendPicker.
 * @return {PermissionState} The current permission state
 */
export function getPermissionState(): PermissionState {
  return permissionState;
}
/**
 * Exposes the main-thread StorageClient for editor and draft-merge I/O.
 * @return {StorageClient} The client connected to the storage SharedWorker
 */
export function getStorageClient(): StorageClient {
  return storageClient;
}
/**
 * Reactive content list for the active collection, rendered by the sidebar.
 * @return {ContentItem[]} Parsed content items for the selected collection
 */
export function getContentList(): ContentItem[] {
  return contentList;
}
/**
 * Reactive error message for display in the sidebar.
 * @return {string | null} The error message, or null
 */
export function getError(): string | null {
  return error;
}
/**
 * Reactive loading state for the sidebar loading indicator.
 * @return {boolean} True if the frontmatter worker is actively parsing
 */
export function isLoading(): boolean {
  return loading;
}
/**
 * Initializes the frontmatter worker and bridges a port to the SharedWorker.
 * @return {Worker}
 */
function ensureWorker(): Worker {
  if (worker) return worker;
  worker = new Worker(new URL('./frontmatter-worker.ts', import.meta.url), {
    type: 'module',
  });
  worker.addEventListener('message', (event) => {
    const data = event.data;
    if (data.type === 'result') {
      const forCollection = data.collection as string;
      // Always cache under the correct collection
      contentCache.set(forCollection, data.items);
      // Only update the visible list if this result is for the current collection
      if (forCollection === loadedCollection) {
        contentList = data.items;
        loading = false;
        error = null;
        if (backendReady) mergeDrafts(forCollection);
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
 * @return {Promise<void>}
 */
async function dispatchWorker(
  collection: string,
  refresh = false,
): Promise<void> {
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
 * Forces a background reload, keeping the sidebar visible.
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
