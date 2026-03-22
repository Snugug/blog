<script lang="ts">
  import type { SchemaNode } from '$js/admin/schema-utils';

  /**
   * Props for the DateField component, which renders a labeled date input
   * for a JSON Schema string property with format "date".
   */
  interface Props {
    // Field name used as the input id and label fallback
    name: string;
    // JSON Schema node describing this field
    schema: SchemaNode;
    // Current field value — Date object or ISO string
    value: unknown;
    // Whether this field is required
    required?: boolean;
    // Callback fired when the value changes
    onchange: (value: string | null) => void;
  }

  let { name, schema, value, required = false, onchange }: Props = $props();

  /**
   * Converts a name string to Title Case, splitting on camelCase, hyphens, and underscores.
   * @param {string} str - The raw property name to convert
   * @return {string} The title-cased display string
   */
  function toTitleCase(str: string): string {
    return str
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .replace(/[-_]/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase());
  }

  /**
   * Converts a Date or ISO string to YYYY-MM-DD for the date input, or empty string if unset.
   * @param {unknown} val - The field value, which may be a Date object, ISO string, or unset
   * @return {string} A YYYY-MM-DD formatted string for the date input, or empty string
   */
  function toDateInputValue(val: unknown): string {
    if (val instanceof Date) {
      // Use UTC components to avoid timezone shifts converting to local date
      const y = val.getUTCFullYear();
      const m = String(val.getUTCMonth() + 1).padStart(2, '0');
      const d = String(val.getUTCDate()).padStart(2, '0');
      return `${y}-${m}-${d}`;
    }
    if (typeof val === 'string' && val.length >= 10) {
      // Slice the YYYY-MM-DD portion from an ISO string (e.g. "2024-01-15T00:00:00Z")
      return val.slice(0, 10);
    }
    return '';
  }

  // Display label — schema.title if present, otherwise title-cased name
  const label = $derived(
    (schema['title'] as string | undefined) ?? toTitleCase(name),
  );

  // YYYY-MM-DD string for the date input element
  const inputValue = $derived(toDateInputValue(value));

  // Description from schema
  const description = $derived(schema['description'] as string | undefined);

  // Whether field is read-only
  const readOnly = $derived(!!(schema['readOnly'] as boolean | undefined));

  // Whether field is deprecated — dims the entire field
  const deprecated = $derived(!!(schema['deprecated'] as boolean | undefined));

  // Whether empty input should emit null (nullable anyOf-unwrapped types)
  const nullable = $derived(!!(schema['_nullable'] as boolean | undefined));

  /**
   * Handles date input change, emitting null for empty nullable fields.
   * @param {Event} e - The input event from the date input element
   */
  function handleChange(e: Event): void {
    const raw = (e.target as HTMLInputElement).value;
    onchange(nullable && raw === '' ? null : raw);
  }
</script>

<div class="field" class:field--deprecated={deprecated}>
  <label class="field-label" for={name}>
    {label}{#if required}<span class="field-required" aria-hidden="true">*</span
      >{/if}
  </label>

  <input
    type="date"
    id={name}
    class="field-input"
    value={inputValue}
    readonly={readOnly}
    oninput={handleChange}
  />

  {#if description}
    <p class="field-help">{description}</p>
  {/if}
</div>

<style lang="scss">
  .field {
    display: grid;
    gap: 0.25rem;
  }

  // Dimmed appearance for deprecated fields
  .field--deprecated {
    opacity: 0.5;
  }

  .field-label {
    font-size: 0.875rem;
    color: var(--white);
  }

  .field-required {
    color: var(--light-red);
    margin-left: 0.25rem;
  }

  .field-input {
    width: auto;
    background: var(--near-black, #2a2a2e);
    border: 1px solid var(--dark-grey);
    border-radius: 4px;
    padding: 0.5rem;
    font-size: 1rem;
    color: var(--white);
    // Ensures the date picker UI respects the dark background theme
    color-scheme: dark;

    &:focus {
      outline: 2px solid var(--plum);
      outline-offset: -1px;
    }

    &[readonly] {
      opacity: 0.6;
      cursor: default;
    }
  }

  .field-help {
    font-size: 0.75rem;
    color: var(--grey);
  }
</style>
