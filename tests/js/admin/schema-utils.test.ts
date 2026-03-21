import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  resolveFieldType,
  extractTabs,
  createDefaultValue,
  getByPath,
  setByPath,
  getFieldsForTab,
} from '../../../src/js/admin/schema-utils.ts';

// ---------------------------------------------------------------------------
// resolveFieldType
// ---------------------------------------------------------------------------

describe('resolveFieldType', () => {
  it('returns string for type: "string"', () => {
    const result = resolveFieldType({ type: 'string' });
    assert.strictEqual(result.kind, 'string');
  });

  it('returns enum for string with enum (kind and options)', () => {
    const result = resolveFieldType({ type: 'string', enum: ['a', 'b'] });
    assert.strictEqual(result.kind, 'enum');
    assert.deepStrictEqual(
      (result as { kind: 'enum'; options: string[] }).options,
      ['a', 'b'],
    );
  });

  it('returns date for format: "date-time"', () => {
    const result = resolveFieldType({ type: 'string', format: 'date-time' });
    assert.strictEqual(result.kind, 'date');
  });

  it('returns number for type: "number"', () => {
    const result = resolveFieldType({ type: 'number' });
    assert.strictEqual(result.kind, 'number');
  });

  it('returns number for type: "integer"', () => {
    const result = resolveFieldType({ type: 'integer' });
    assert.strictEqual(result.kind, 'number');
  });

  it('returns boolean for type: "boolean"', () => {
    const result = resolveFieldType({ type: 'boolean' });
    assert.strictEqual(result.kind, 'boolean');
  });

  it('returns array for type: "array"', () => {
    const result = resolveFieldType({ type: 'array' });
    assert.strictEqual(result.kind, 'array');
  });

  it('returns object for type: "object"', () => {
    const result = resolveFieldType({ type: 'object' });
    assert.strictEqual(result.kind, 'object');
  });

  it('unwraps anyOf nullable to inner type (string)', () => {
    const result = resolveFieldType({
      anyOf: [{ type: 'string' }, { type: 'null' }],
    });
    assert.strictEqual(result.kind, 'string');
    assert.strictEqual(result.nullable, true);
  });

  it('unwraps anyOf nullable for non-string types (number)', () => {
    const result = resolveFieldType({
      anyOf: [{ type: 'number' }, { type: 'null' }],
    });
    assert.strictEqual(result.kind, 'number');
    assert.strictEqual(result.nullable, true);
  });
});

// ---------------------------------------------------------------------------
// extractTabs
// ---------------------------------------------------------------------------

describe('extractTabs', () => {
  it('returns empty array when no tabs defined', () => {
    const schema = {
      type: 'object',
      properties: {
        title: { type: 'string' },
        date: { type: 'string', format: 'date-time' },
      },
    };
    const result = extractTabs(schema);
    assert.deepStrictEqual(result, []);
  });

  it('extracts unique tab names sorted alphabetically', () => {
    const schema = {
      type: 'object',
      properties: {
        title: { type: 'string', tab: ['SEO'] },
        slug: { type: 'string', tab: ['SEO'] },
        date: { type: 'string', tab: ['Meta'] },
      },
    };
    const result = extractTabs(schema);
    assert.deepStrictEqual(result, ['Meta', 'SEO']);
  });

  it('sorts tabs alphabetically regardless of discovery order', () => {
    const schema = {
      type: 'object',
      properties: {
        z: { type: 'string', tab: ['Zebra'] },
        a: { type: 'string', tab: ['Apple'] },
        m: { type: 'string', tab: ['Mango'] },
      },
    };
    const result = extractTabs(schema);
    assert.deepStrictEqual(result, ['Apple', 'Mango', 'Zebra']);
  });
});

// ---------------------------------------------------------------------------
// createDefaultValue
// ---------------------------------------------------------------------------

describe('createDefaultValue', () => {
  it('returns empty string for string, 0 for number, false for boolean, [] for array', () => {
    assert.strictEqual(createDefaultValue({ type: 'string' }), '');
    assert.strictEqual(createDefaultValue({ type: 'number' }), 0);
    assert.strictEqual(createDefaultValue({ type: 'boolean' }), false);
    assert.deepStrictEqual(createDefaultValue({ type: 'array' }), []);
  });

  it('returns object with default values for object type with properties', () => {
    const schema = {
      type: 'object',
      properties: {
        name: { type: 'string' },
        count: { type: 'number' },
      },
    };
    const result = createDefaultValue(schema);
    assert.deepStrictEqual(result, { name: '', count: 0 });
  });

  it('uses schema default when provided', () => {
    assert.strictEqual(
      createDefaultValue({ type: 'string', default: 'hello' }),
      'hello',
    );
    assert.strictEqual(createDefaultValue({ type: 'number', default: 42 }), 42);
  });

  it('returns null for nullable types (anyOf)', () => {
    const schema = { anyOf: [{ type: 'string' }, { type: 'null' }] };
    const result = createDefaultValue(schema);
    assert.strictEqual(result, null);
  });
});

// ---------------------------------------------------------------------------
// getByPath
// ---------------------------------------------------------------------------

describe('getByPath', () => {
  it('gets top-level property', () => {
    const obj = { title: 'Hello' };
    assert.strictEqual(getByPath(obj, ['title']), 'Hello');
  });

  it('gets nested property', () => {
    const obj = { meta: { author: 'Sam' } };
    assert.strictEqual(getByPath(obj, ['meta', 'author']), 'Sam');
  });

  it('gets array element by index', () => {
    const obj = { tags: ['a', 'b', 'c'] };
    assert.strictEqual(getByPath(obj, ['tags', 1]), 'b');
  });

  it('returns undefined for missing path', () => {
    const obj = { title: 'Hello' };
    assert.strictEqual(getByPath(obj, ['missing', 'nested']), undefined);
  });
});

// ---------------------------------------------------------------------------
// setByPath
// ---------------------------------------------------------------------------

describe('setByPath', () => {
  it('sets top-level property', () => {
    const obj: Record<string, unknown> = { title: 'Old' };
    setByPath(obj, ['title'], 'New');
    assert.strictEqual(obj['title'], 'New');
  });

  it('sets nested property', () => {
    const obj: Record<string, unknown> = { meta: { author: 'Old' } };
    setByPath(obj, ['meta', 'author'], 'New');
    assert.deepStrictEqual(obj['meta'], { author: 'New' });
  });

  it('sets array element by index', () => {
    const obj: Record<string, unknown> = { tags: ['a', 'b', 'c'] };
    setByPath(obj, ['tags', 1], 'z');
    assert.deepStrictEqual(obj['tags'], ['a', 'z', 'c']);
  });

  it('creates intermediate objects if missing', () => {
    const obj: Record<string, unknown> = {};
    setByPath(obj, ['meta', 'author'], 'Sam');
    assert.deepStrictEqual(obj, { meta: { author: 'Sam' } });
  });
});

// ---------------------------------------------------------------------------
// getFieldsForTab
// ---------------------------------------------------------------------------

describe('getFieldsForTab', () => {
  const schema = {
    type: 'object',
    properties: {
      title: { type: 'string' },
      slug: { type: 'string', tab: ['SEO'] },
      description: { type: 'string', tab: ['SEO', 'Meta'] },
      date: { type: 'string', tab: ['Meta'] },
    },
  };

  it('returns all property names for null tab (Metadata)', () => {
    const result = getFieldsForTab(schema, null);
    assert.deepStrictEqual(result, ['title', 'slug', 'description', 'date']);
  });

  it('returns only matching fields for a named tab', () => {
    const result = getFieldsForTab(schema, 'SEO');
    assert.deepStrictEqual(result, ['slug', 'description']);
  });

  it('returns fields present in multiple tabs', () => {
    const result = getFieldsForTab(schema, 'Meta');
    assert.deepStrictEqual(result, ['description', 'date']);
  });
});
