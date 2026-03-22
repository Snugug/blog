// Database name for admin CMS persistence
const DB_NAME = 'cms-admin';
// Current database version — bumped from 1 to add the drafts store
const DB_VERSION = 2;

/**
 * Opens the shared IndexedDB database, creating or upgrading stores as needed.
 * Version 1: handles store only. Version 2: adds drafts store.
 * @return {Promise<IDBDatabase>} Promise resolving to the database instance
 */
export function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains('handles')) {
        db.createObjectStore('handles');
      }
      if (!db.objectStoreNames.contains('drafts')) {
        db.createObjectStore('drafts', { keyPath: 'id' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}
