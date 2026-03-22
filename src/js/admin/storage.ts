// src/js/admin/storage.ts
import { openDB } from './db';

// Fixed key for the backend config
const BACKEND_KEY = 'backend';

/**
 * Backend configuration stored in IndexedDB. Tagged union discriminated on `type`.
 */
export type BackendConfig =
  | { type: 'fsa'; handle: FileSystemDirectoryHandle }
  | { type: 'github'; token: string; repo: string };

/**
 * Stores backend configuration in IndexedDB for persistence across sessions.
 * @param {BackendConfig} config - The backend config to store
 * @return {Promise<void>}
 */
export async function saveBackend(config: BackendConfig): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('handles', 'readwrite');
    tx.objectStore('handles').put(config, BACKEND_KEY);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

/**
 * Retrieves stored backend configuration from IndexedDB. Handles migration from the old format where a bare FileSystemDirectoryHandle was stored.
 * @return {Promise<BackendConfig | null>} The stored config, or null if none exists
 */
export async function loadBackend(): Promise<BackendConfig | null> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('handles', 'readonly');
    const request = tx.objectStore('handles').get(BACKEND_KEY);
    request.onsuccess = () => {
      const result = request.result;
      if (!result) {
        // Check for old-format handle stored under the legacy key
        const legacyRequest = tx.objectStore('handles').get('projectRoot');
        legacyRequest.onsuccess = () => {
          const legacy = legacyRequest.result;
          if (legacy && legacy instanceof FileSystemDirectoryHandle) {
            resolve({ type: 'fsa', handle: legacy });
          } else {
            resolve(null);
          }
        };
        legacyRequest.onerror = () => resolve(null);
        return;
      }
      resolve(result as BackendConfig);
    };
    request.onerror = () => reject(request.error);
  });
}

/**
 * Removes the stored backend configuration from IndexedDB. Also clears the legacy key if present.
 * @return {Promise<void>}
 */
export async function clearBackend(): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('handles', 'readwrite');
    const store = tx.objectStore('handles');
    store.delete(BACKEND_KEY);
    // Clean up legacy key if present
    store.delete('projectRoot');
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}
