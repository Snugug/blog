import { loadDrafts, type Draft } from './draft-storage';
import { splitFrontmatter } from './frontmatter';
import { getStorageClient } from './state.svelte';

// Drafts for the current collection
let drafts = $state<Draft[]>([]);
// Map of draftId → whether the live content has diverged from the draft's snapshot
let outdatedMap = $state<Record<string, boolean>>({});
// Worker for off-thread snapshot comparison
let diffWorker: Worker | null = null;

/**
 * Returns the current list of drafts for the active collection (reactive).
 * @return {Draft[]} The loaded drafts
 */
export function getDrafts(): Draft[] {
  return drafts;
}

/**
 * Returns the current outdated map indicating which drafts have diverged from live content (reactive).
 * @return {Record<string, boolean>} Map of draft ID to outdated status
 */
export function getOutdatedMap(): Record<string, boolean> {
  return outdatedMap;
}

/**
 * Initializes the diff worker singleton and wires up the result handler.
 * @return {Worker} The existing or newly created diff worker
 */
function ensureDiffWorker(): Worker {
  if (diffWorker) return diffWorker;
  diffWorker = new Worker(new URL('./draft-diff-worker.ts', import.meta.url), {
    type: 'module',
  });
  diffWorker.addEventListener('message', (event) => {
    const data = event.data;
    if (data.type === 'diff-result') {
      outdatedMap = data.results;
    }
  });
  return diffWorker;
}

/**
 * Loads drafts for a collection from IndexedDB and dispatches snapshot comparisons to the diff worker for any drafts linked to live files. Reads live file contents via the StorageClient.
 * @param {string} collection - The collection to load drafts for
 * @return {Promise<void>}
 */
export async function mergeDrafts(collection: string): Promise<void> {
  drafts = await loadDrafts(collection);

  // Filter to drafts that need outdated checking:
  // must be linked to a live file (not new), have a snapshot, and have a filename
  const candidates = drafts.filter((d) => !d.isNew && d.snapshot && d.filename);
  if (candidates.length === 0) {
    outdatedMap = {};
    return;
  }

  const client = getStorageClient();
  if (!client) {
    outdatedMap = {};
    return;
  }

  // Build diff entries by reading each candidate's live file via StorageClient
  const entries: {
    draftId: string;
    snapshot: string;
    liveFormData: Record<string, unknown>;
    liveBody: string;
  }[] = [];

  for (const d of candidates) {
    try {
      const text = await client.readFile(collection, d.filename!);
      const { rawFrontmatter, body } = splitFrontmatter(text);
      // Parse frontmatter to get live form data
      const { load } = await import('js-yaml');
      const liveFormData = (load(rawFrontmatter) ?? {}) as Record<
        string,
        unknown
      >;
      const liveBody = body.replace(/^\n+/, '').replace(/\n+$/, '');
      entries.push({
        draftId: d.id,
        snapshot: d.snapshot!,
        liveFormData,
        liveBody,
      });
    } catch {
      // File not found or unreadable — skip
    }
  }

  if (entries.length === 0) {
    outdatedMap = {};
    return;
  }

  // Dispatch to the diff worker for off-thread comparison
  const worker = ensureDiffWorker();
  worker.postMessage({ type: 'diff', entries });
}

/**
 * Re-reads drafts from IndexedDB for the given collection and updates the reactive drafts list.
 * Used after saving/deleting a draft so the sidebar reflects changes immediately without a full collection reload.
 * @param {string} collection - The collection to refresh drafts for
 * @return {Promise<void>}
 */
export async function refreshDrafts(collection: string): Promise<void> {
  drafts = await loadDrafts(collection);
}

/**
 * Resets draft-related state and terminates the diff worker. Called during disconnect.
 * @return {void}
 */
export function resetDraftMerge(): void {
  diffWorker?.terminate();
  diffWorker = null;
  drafts = [];
  outdatedMap = {};
}
