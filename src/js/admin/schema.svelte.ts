import schemas from 'virtual:collections';

/** JSON Schema object type */
type JsonSchema = Record<string, unknown>;

/** Cache of fetched schemas keyed by collection name */
const cache = new Map<string, JsonSchema>();

/** Currently loaded schema */
let schema = $state<JsonSchema | null>(null);

/**
 * Returns the currently loaded JSON Schema (reactive).
 * @returns The schema object or null if not loaded
 */
export function getSchema(): JsonSchema | null {
  return schema;
}

/**
 * Fetches and caches the JSON Schema for a collection.
 * Sets the reactive `schema` state on success.
 * @param collection - The collection name to fetch the schema for
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
 * Clears the active schema. Called when navigating away from a file.
 */
export function clearSchema(): void {
  schema = null;
}
