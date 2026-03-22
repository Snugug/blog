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
 * @return {JsonSchema | null} The active schema, or null if none is loaded
 */
export function getSchema(): JsonSchema | null {
  return schema;
}

/**
 * Returns whether all schemas have been prefetched (reactive).
 * @return {boolean} True if all collection schemas have been fetched and cached
 */
export function areSchemasReady(): boolean {
  return allFetched;
}

/**
 * Fetches all collection schemas in parallel and caches them.
 * Call once on app startup so schema-derived state is available before the first collection renders.
 * @return {Promise<void>}
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
 * Fetches and caches the JSON Schema for a collection, then sets the reactive schema state.
 * @param {string} collection - The collection name to fetch the schema for
 * @return {Promise<void>}
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
 * Returns true if the collection's schema has a date-time property, indicating it supports date-based sorting.
 * Requires prefetchAllSchemas to have been called; returns false if the schema isn't cached yet.
 * @param {string} collection - The collection name to check
 * @return {boolean} True if any property in the schema uses the date-time format
 */
export function collectionHasDates(collection: string): boolean {
  const s = cache.get(collection);
  if (!s) return false;
  const props = s['properties'] as Record<string, JsonSchema> | undefined;
  if (!props) return false;
  return Object.values(props).some((p) => p['format'] === 'date-time');
}

/**
 * Clears the active schema.
 * @return {void}
 */
export function clearSchema(): void {
  schema = null;
}
