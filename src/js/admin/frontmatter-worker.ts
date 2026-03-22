import { load } from 'js-yaml';
import { StorageClient } from './storage-client';
import type { FileEntry } from './storage-adapter';

/**
 * Extracts and parses YAML frontmatter from a markdown string. Handles BOM stripping, CRLF normalization, horizontal rule rejection, and empty/missing frontmatter.
 * @param {string} content - Raw markdown file content
 * @return {Record<string, unknown> | null} Parsed frontmatter data, or null if none is found
 */
function extractFrontmatter(content: string): Record<string, unknown> | null {
  // Strip BOM if present
  let str = content.startsWith('\uFEFF') ? content.slice(1) : content;

  // Normalize line endings
  str = str.replace(/\r\n/g, '\n');

  // Reject ---- (horizontal rule) before checking for valid frontmatter opener
  if (str.startsWith('----')) return null;
  if (!str.startsWith('---\n')) return null;

  // Find closing delimiter
  const closeIndex = str.indexOf('\n---\n', 3);
  if (closeIndex === -1) {
    // Check for --- at end of file with no trailing newline
    if (str.endsWith('\n---')) {
      const yaml = str.slice(4, str.length - 4);
      if (!yaml.trim()) return null;
      return (load(yaml) as Record<string, unknown>) ?? null;
    }
    return null;
  }

  const yaml = str.slice(4, closeIndex);
  if (!yaml.trim()) return null;

  return (load(yaml) as Record<string, unknown>) ?? null;
}

// Storage client, initialized when the main thread transfers a port
let storageClient: StorageClient | null = null;

// Handle messages from main thread
self.addEventListener('message', async (event) => {
  const { type } = event.data;

  if (type === 'port') {
    // Main thread is transferring a MessagePort connected to the storage SharedWorker
    const port = event.ports[0];
    storageClient = new StorageClient(port);
    return;
  }

  if (type === 'parse') {
    const { collection } = event.data;
    if (!storageClient) {
      self.postMessage({
        type: 'error',
        message: 'Storage port not initialized',
      });
      return;
    }

    try {
      const files: FileEntry[] = await storageClient.listFiles(collection);
      const items: Array<{ filename: string; data: Record<string, unknown> }> =
        [];

      for (const file of files) {
        const frontmatter = extractFrontmatter(file.content);
        // Preserve full frontmatter so callers can access any field (e.g. `published` for date sorting)
        const data = frontmatter ?? {};
        items.push({ filename: file.filename, data });
      }

      // Sort alphabetically by title, falling back to filename
      items.sort((a, b) => {
        const aTitle =
          typeof a.data.title === 'string' ? a.data.title : a.filename;
        const bTitle =
          typeof b.data.title === 'string' ? b.data.title : b.filename;
        return aTitle.toLowerCase().localeCompare(bTitle.toLowerCase());
      });

      self.postMessage({ type: 'result', collection, items });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      self.postMessage({ type: 'error', message });
    }
  }
});
