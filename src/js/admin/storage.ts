// Database name for admin CMS persistence
const DB_NAME = 'cms-admin';
// Database version
const DB_VERSION = 1;
// Object store for directory handles
const STORE_NAME = 'handles';
// Fixed key for the project root handle
const HANDLE_KEY = 'projectRoot';

/**
 * Opens the IndexedDB database, creating the object store if needed.
 * @return {Promise<IDBDatabase>} Promise resolving to the database instance
 */
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

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
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).put(handle, HANDLE_KEY);
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
    const tx = db.transaction(STORE_NAME, 'readonly');
    const request = tx.objectStore(STORE_NAME).get(HANDLE_KEY);
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
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).delete(HANDLE_KEY);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}
