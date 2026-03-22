/**
 * Converts a string to a URL-friendly slug.
 * Replicates the behavior of the `slugify` package with `lower: true, strict: true`:
 * lowercases, replaces non-alphanumeric characters with hyphens, collapses consecutive hyphens, and trims edge hyphens.
 * @param {string} input - The string to slugify
 * @return {string} A URL-safe slug
 */
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-{2,}/g, '-')
    .replace(/^-|-$/g, '');
}
