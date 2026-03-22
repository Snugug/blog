/** A generic JSON Schema node represented as a plain object */
export type SchemaNode = Record<string, unknown>;

/**
 * Discriminated union describing the resolved type of a schema field.
 * All variants carry an optional `nullable` flag set when the field
 * was expressed as `anyOf: [<type>, { type: 'null' }]`.
 */
export type FieldType =
  | { kind: 'string'; nullable?: boolean }
  | { kind: 'number'; nullable?: boolean }
  | { kind: 'boolean'; nullable?: boolean }
  | { kind: 'date'; nullable?: boolean }
  | { kind: 'enum'; options: string[]; nullable?: boolean }
  | { kind: 'array'; nullable?: boolean }
  | { kind: 'object'; nullable?: boolean }
  | { kind: 'unknown'; nullable?: boolean };

/**
 * A path segment used to address nested values.
 * Strings address object keys; numbers address array indices.
 */
export type PathSegment = string | number;

// ---------------------------------------------------------------------------
// resolveFieldType
// ---------------------------------------------------------------------------

/**
 * Resolves a JSON Schema node to a `FieldType` discriminated union.
 * Handles anyOf nullable unwrapping, enum detection, and date-time format.
 * @param schema - The JSON Schema node to resolve
 */
export function resolveFieldType(schema: SchemaNode): FieldType {
  // Unwrap nullable anyOf: [<innerType>, { type: 'null' }]
  const anyOf = schema['anyOf'];
  if (Array.isArray(anyOf)) {
    const nonNull = (anyOf as SchemaNode[]).find((s) => s['type'] !== 'null');
    if (nonNull) {
      const inner = resolveFieldType(nonNull);
      return { ...inner, nullable: true } as FieldType;
    }
  }

  const type = schema['type'] as string | undefined;
  const format = schema['format'] as string | undefined;
  const enumValues = schema['enum'];

  // date-time format takes precedence over plain string
  if (type === 'string' && format === 'date-time') {
    return { kind: 'date' };
  }

  // enum values present — treat as enum regardless of string subtype
  if (type === 'string' && Array.isArray(enumValues)) {
    return { kind: 'enum', options: enumValues as string[] };
  }

  if (type === 'string') return { kind: 'string' };
  if (type === 'number' || type === 'integer') return { kind: 'number' };
  if (type === 'boolean') return { kind: 'boolean' };
  if (type === 'array') return { kind: 'array' };
  if (type === 'object') return { kind: 'object' };

  return { kind: 'unknown' };
}

// ---------------------------------------------------------------------------
// extractTabs
// ---------------------------------------------------------------------------

/**
 * Scans an object schema's properties for `tab` arrays and returns a sorted, deduplicated list of all tab names found.
 * @param schema - A JSON Schema node with an optional `properties` map
 */
export function extractTabs(schema: SchemaNode): string[] {
  const properties = schema['properties'] as
    | Record<string, SchemaNode>
    | undefined;
  if (!properties) return [];

  const tabs = new Set<string>();

  for (const field of Object.values(properties)) {
    const tab = field['tab'];
    if (Array.isArray(tab)) {
      for (const name of tab as string[]) {
        tabs.add(name);
      }
    }
  }

  return Array.from(tabs).sort();
}

// ---------------------------------------------------------------------------
// createDefaultValue
// ---------------------------------------------------------------------------

/**
 * Returns a type-appropriate default value for a given JSON Schema node.
 * Honors `schema.default` when present, returns null for nullable types, and recurses into object properties.
 * @param schema - The JSON Schema node to generate a default value for
 */
export function createDefaultValue(schema: SchemaNode): unknown {
  // Honour an explicit schema default first
  if ('default' in schema) {
    return schema['default'];
  }

  // Nullable anyOf — default to null
  const anyOf = schema['anyOf'];
  if (Array.isArray(anyOf)) {
    const hasNull = (anyOf as SchemaNode[]).some((s) => s['type'] === 'null');
    if (hasNull) return null;
  }

  const type = schema['type'] as string | undefined;

  if (type === 'string') return '';
  if (type === 'number' || type === 'integer') return 0;
  if (type === 'boolean') return false;
  if (type === 'array') return [];

  if (type === 'object') {
    const properties = schema['properties'] as
      | Record<string, SchemaNode>
      | undefined;
    if (!properties) return {};
    const result: Record<string, unknown> = {};
    for (const [key, fieldSchema] of Object.entries(properties)) {
      result[key] = createDefaultValue(fieldSchema);
    }
    return result;
  }

  return null;
}

// ---------------------------------------------------------------------------
// getByPath
// ---------------------------------------------------------------------------

/**
 * Reads a deeply nested value from an object by following path segments.
 * Returns `undefined` if any segment along the path is missing.
 * @param obj - The root object to traverse
 * @param path - Ordered path segments (string keys or numeric indices)
 */
export function getByPath(obj: unknown, path: PathSegment[]): unknown {
  let current: unknown = obj;
  for (const segment of path) {
    if (current === null || current === undefined) return undefined;
    current = (current as Record<string | number, unknown>)[segment];
  }
  return current;
}

// ---------------------------------------------------------------------------
// setByPath
// ---------------------------------------------------------------------------

/**
 * Sets a deeply nested value in an object by following path segments, creating intermediate objects as needed.
 * @param obj - The root object to mutate
 * @param path - Ordered path segments (string keys or numeric indices)
 * @param value - The value to assign at the resolved path
 */
export function setByPath(
  obj: unknown,
  path: PathSegment[],
  value: unknown,
): void {
  if (path.length === 0) return;

  let current = obj as Record<string | number, unknown>;

  // Walk down to the parent of the final segment, creating objects as needed
  for (let i = 0; i < path.length - 1; i++) {
    const segment = path[i];
    if (current[segment] === null || current[segment] === undefined) {
      current[segment] = {};
    }
    current = current[segment] as Record<string | number, unknown>;
  }

  current[path[path.length - 1]] = value;
}

// ---------------------------------------------------------------------------
// getFieldsForTab
// ---------------------------------------------------------------------------

/**
 * Returns property names from a schema that belong to the given tab.
 * When `tab` is `null`, all property names are returned (no filtering — every field appears in the catch-all Metadata view).
 * @param schema - A JSON Schema node with an optional `properties` map
 * @param tab - Tab name to filter by, or `null` to return all fields
 */
export function getFieldsForTab(
  schema: SchemaNode,
  tab: string | null,
): string[] {
  const properties = schema['properties'] as
    | Record<string, SchemaNode>
    | undefined;
  if (!properties) return [];

  // Filter out $schema — it's a JSON Schema meta-property that Astro adds
  // to every generated schema, not a user-editable frontmatter field
  const keys = Object.keys(properties).filter((k) => k !== '$schema');

  // null means "all fields" — no tab filtering applied
  if (tab === null) {
    return keys;
  }

  return keys.filter((key) => {
    const fieldTab = properties[key]['tab'];
    return Array.isArray(fieldTab) && (fieldTab as string[]).includes(tab);
  });
}
