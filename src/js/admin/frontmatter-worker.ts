import { load } from 'js-yaml';

/**
 * Extracts YAML frontmatter from a markdown string.
 * Handles edge cases informed by gray-matter: BOM stripping, horizontal rule
 * rejection (----), \r\n line endings, and empty/missing frontmatter.
 * @param content - Raw markdown file content
 * @returns Parsed frontmatter object, or null if no valid frontmatter found
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
 * Traverses from the project root handle to src/content/{collection}/.
 * @param root - The project root directory handle
 * @param collection - The collection name
 * @returns The directory handle for the collection's content folder
 */
async function getCollectionDir(
  root: FileSystemDirectoryHandle,
  collection: string,
): Promise<FileSystemDirectoryHandle> {
  const src = await root.getDirectoryHandle('src');
  const content = await src.getDirectoryHandle('content');
  return content.getDirectoryHandle(collection);
}

/**
 * Worker message handler. Receives parse requests with a directory handle
 * and collection name, reads .md files, extracts frontmatter titles.
 */
self.addEventListener('message', async (event) => {
  const { type, handle, collection } = event.data;
  if (type !== 'parse') return;

  try {
    const dir = await getCollectionDir(handle, collection);
    const items: Array<{ filename: string; title: string | null }> = [];

    for await (const [name, entry] of dir.entries()) {
      if (entry.kind !== 'file' || !name.endsWith('.md')) continue;

      const file = await entry.getFile();
      const text = await file.text();
      const frontmatter = extractFrontmatter(text);
      const title =
        frontmatter && typeof frontmatter.title === 'string'
          ? frontmatter.title
          : null;

      items.push({ filename: name, title });
    }

    // Sort alphabetically by title, falling back to filename
    items.sort((a, b) => {
      const aKey = (a.title ?? a.filename).toLowerCase();
      const bKey = (b.title ?? b.filename).toLowerCase();
      return aKey.localeCompare(bKey);
    });

    self.postMessage({ type: 'result', items });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    self.postMessage({ type: 'error', message });
  }
});
