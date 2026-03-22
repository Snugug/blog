import { openDB } from './db';

// Fixed key for the project root handle
const HANDLE_KEY = 'projectRoot';

/**
 * Stores a FileSystemDirectoryHandle in IndexedDB for persistence across sessions.
 * @param {FileSystemDirectoryHandle} handle - The directory handle to store
 * @return {Promise<void>}
 */
export async function saveHandle(
  handle: FileSystemDirectoryHandle,
): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('handles', 'readwrite');
    tx.objectStore('handles').put(handle, HANDLE_KEY);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

/**
 * Retrieves a previously stored FileSystemDirectoryHandle from IndexedDB.
 * @return {Promise<FileSystemDirectoryHandle | null>} The stored handle, or null if none exists
 */
export async function loadHandle(): Promise<FileSystemDirectoryHandle | null> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('handles', 'readonly');
    const request = tx.objectStore('handles').get(HANDLE_KEY);
    request.onsuccess = () => resolve(request.result ?? null);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Removes the stored directory handle from IndexedDB.
 * @return {Promise<void>}
 */
export async function clearHandle(): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('handles', 'readwrite');
    tx.objectStore('handles').delete(HANDLE_KEY);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}
