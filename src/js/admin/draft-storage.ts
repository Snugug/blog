import { openDB } from './db';

/**
 * A draft content entry persisted in IndexedDB.
 */
export type Draft = {
  // UUID primary key
  id: string;
  // Collection this draft belongs to
  collection: string;
  // Filename (null if not yet named)
  filename: string | null;
  // true = brand new content, false = draft of existing live file
  isNew: boolean;
  // Parsed frontmatter data
  formData: Record<string, unknown>;
  // Markdown body content
  body: string;
  // Stable-stringified snapshot of original live {formData, body} at draft creation — null for new content
  snapshot: string | null;
  // ISO date string of when the draft was first created
  createdAt: string;
};

// Object store name for drafts
const STORE = 'drafts';

/**
 * Saves or updates a draft in IndexedDB.
 * @param {Draft} draft - The draft record to persist
 * @return {Promise<void>}
 */
export async function saveDraft(draft: Draft): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).put(draft);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

/**
 * Loads all drafts for a given collection.
 * @param {string} collection - The collection name to filter by
 * @return {Promise<Draft[]>} All drafts belonging to the collection
 */
export async function loadDrafts(collection: string): Promise<Draft[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readonly');
    const request = tx.objectStore(STORE).getAll();
    request.onsuccess = () => {
      const all = request.result as Draft[];
      resolve(all.filter((d) => d.collection === collection));
    };
    request.onerror = () => reject(request.error);
  });
}

/**
 * Loads a single draft by ID.
 * @param {string} id - The draft UUID
 * @return {Promise<Draft | null>} The draft, or null if not found
 */
export async function loadDraft(id: string): Promise<Draft | null> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readonly');
    const request = tx.objectStore(STORE).get(id);
    request.onsuccess = () => resolve(request.result ?? null);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Deletes a draft from IndexedDB by ID.
 * @param {string} id - The draft UUID to delete
 * @return {Promise<void>}
 */
export async function deleteDraft(id: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

/**
 * Finds a draft linked to a specific live file.
 * @param {string} collection - The collection name
 * @param {string} filename - The live file's filename
 * @return {Promise<Draft | null>} The matching draft, or null if none exists
 */
export async function getDraftByFile(
  collection: string,
  filename: string,
): Promise<Draft | null> {
  const drafts = await loadDrafts(collection);
  return drafts.find((d) => !d.isNew && d.filename === filename) ?? null;
}
