import { load } from 'js-yaml';

/**
 * Extracts and parses YAML frontmatter from a markdown string.
 * Handles BOM stripping, CRLF normalization, horizontal rule rejection, and empty/missing frontmatter.
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

/**
 * Traverses from the project root to src/content/{collection}/.
 * @param {FileSystemDirectoryHandle} root - The project root directory handle
 * @param {string} collection - The collection name
 * @return {Promise<FileSystemDirectoryHandle>} The directory handle for the collection
 */
async function getCollectionDir(
  root: FileSystemDirectoryHandle,
  collection: string,
): Promise<FileSystemDirectoryHandle> {
  const src = await root.getDirectoryHandle('src');
  const content = await src.getDirectoryHandle('content');
  return content.getDirectoryHandle(collection);
}

// Worker message handler. Receives parse requests, reads .md/.mdx files from the collection directory,
// extracts frontmatter, and returns items sorted alphabetically by title (falling back to filename).
self.addEventListener('message', async (event) => {
  const { type, handle, collection } = event.data;
  if (type !== 'parse') return;

  try {
    const dir = await getCollectionDir(handle, collection);
    const items: Array<{ filename: string; data: Record<string, unknown> }> =
      [];

    for await (const [name, entry] of dir.entries()) {
      if (
        entry.kind !== 'file' ||
        (!name.endsWith('.md') && !name.endsWith('.mdx'))
      )
        continue;

      const file = await entry.getFile();
      const text = await file.text();
      const frontmatter = extractFrontmatter(text);
      // Preserve full frontmatter so callers can access any field (e.g. `published` for date sorting)
      const data = frontmatter ?? {};

      items.push({ filename: name, data });
    }

    // Sort alphabetically by title, falling back to filename
    items.sort((a, b) => {
      const aTitle =
        typeof a.data.title === 'string' ? a.data.title : a.filename;
      const bTitle =
        typeof b.data.title === 'string' ? b.data.title : b.filename;
      return aTitle.toLowerCase().localeCompare(bTitle.toLowerCase());
    });

    self.postMessage({ type: 'result', items });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    self.postMessage({ type: 'error', message });
  }
});
