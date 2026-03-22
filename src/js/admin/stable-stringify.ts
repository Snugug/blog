/**
 * Recursively sorts object keys and serializes to JSON.
 * Produces deterministic output regardless of key insertion order,
 * preventing false-positive outdated detection when comparing snapshots.
 * @param {unknown} value - The value to serialize
 * @return {string} A JSON string with sorted keys at every nesting level
 */
export function stableStringify(value: unknown): string {
  return JSON.stringify(value, (_key, val) => {
    if (val !== null && typeof val === 'object' && !Array.isArray(val)) {
      return Object.keys(val as Record<string, unknown>)
        .sort()
        .reduce(
          (sorted, k) => {
            sorted[k] = (val as Record<string, unknown>)[k];
            return sorted;
          },
          {} as Record<string, unknown>,
        );
    }
    return val;
  });
}
