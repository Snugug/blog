import schemas from 'virtual:collections';

/** JSON Schema object type */
type JsonSchema = Record<string, unknown>;

/** Cache of fetched schemas keyed by collection name */
const cache = new Map<string, JsonSchema>();

/** Currently active schema for the selected collection */
let schema = $state<JsonSchema | null>(null);

/** Whether all schemas have been prefetched */
let allFetched = $state(false);

/**
 * Returns the currently loaded JSON Schema (reactive).
 * @returns {JsonSchema | null} The schema object or null if not loaded
 */
export function getSchema(): JsonSchema | null {
  return schema;
}

/**
 * Returns whether all schemas have been prefetched (reactive).
 * @returns {boolean} True once prefetchAllSchemas completes
 */
export function areSchemasReady(): boolean {
  return allFetched;
}

/**
 * Fetches all collection schemas in parallel and caches them.
 * Call once on app startup so schema-derived state (like whether a
 * collection has dates for sorting) is available immediately.
 */
export async function prefetchAllSchemas(): Promise<void> {
  const entries = Object.entries(schemas);
  const results = await Promise.all(
    entries.map(async ([name, url]) => {
      const response = await fetch(url);
      const data = (await response.json()) as JsonSchema;
      return [name, data] as const;
    }),
  );
  for (const [name, data] of results) {
    cache.set(name, data);
  }
  allFetched = true;
}

/**
 * Fetches and caches the JSON Schema for a collection.
 * Sets the reactive `schema` state on success.
 * @param {string} collection - The collection name to fetch the schema for
 */
export async function fetchSchema(collection: string): Promise<void> {
  const cached = cache.get(collection);
  if (cached) {
    schema = cached;
    return;
  }

  const url = schemas[collection];
  if (!url) return;

  const response = await fetch(url);
  const data = (await response.json()) as JsonSchema;
  cache.set(collection, data);
  schema = data;
}

/**
 * Checks whether a collection's schema has a date-typed property
 * (format: "date-time"), indicating it supports date-based sorting.
 * Returns false if the schema hasn't been fetched yet.
 * @param {string} collection - The collection name to check
 * @returns {boolean} True if the schema has a date-time property
 */
export function collectionHasDates(collection: string): boolean {
  const s = cache.get(collection);
  if (!s) return false;
  const props = s['properties'] as Record<string, JsonSchema> | undefined;
  if (!props) return false;
  return Object.values(props).some((p) => p['format'] === 'date-time');
}

/**
 * Clears the active schema. Called when navigating away from a file.
 */
export function clearSchema(): void {
  schema = null;
}
