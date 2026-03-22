<script lang="ts">
  import type { SchemaNode } from '$js/admin/schema-utils';

  interface Props {
    /** Field name used as the input id and label fallback */
    name: string;
    /** JSON Schema node describing this field */
    schema: SchemaNode;
    /** Current field value */
    value: unknown;
    /** Whether this field is required */
    required?: boolean;
    /** Callback fired when the value changes */
    onchange: (value: boolean | null) => void;
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

  // Display label — schema.title if present, otherwise title-cased name
  const label = $derived(
    (schema['title'] as string | undefined) ?? toTitleCase(name),
  );

  // Checked state for the checkbox
  const checked = $derived(typeof value === 'boolean' ? value : false);

  // Description from schema
  const description = $derived(schema['description'] as string | undefined);

  // Whether field is read-only
  const readOnly = $derived(!!(schema['readOnly'] as boolean | undefined));

  // Whether field is deprecated — dims the entire field
  const deprecated = $derived(!!(schema['deprecated'] as boolean | undefined));

  // Whether empty input should emit null (nullable anyOf-unwrapped types)
  const nullable = $derived(!!(schema['_nullable'] as boolean | undefined));

  /**
   * Handles checkbox change. Preserves null for nullable fields only while the value is already null and unchecked.
   * @param {Event} e - The change event from the checkbox input element
   */
  function handleChange(e: Event): void {
    const isChecked = (e.target as HTMLInputElement).checked;
    onchange(nullable && value === null && !isChecked ? null : isChecked);
  }
</script>

<div class="field" class:field--deprecated={deprecated}>
  <label class="field-label-wrap" for={name}>
    <input
      type="checkbox"
      id={name}
      class="field-checkbox"
      {checked}
      disabled={readOnly}
      onchange={handleChange}
    />
    <span class="field-label-text">
      {label}{#if required}<span class="field-required" aria-hidden="true"
          >*</span
        >{/if}
    </span>
  </label>

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

  // Label wraps checkbox + text in a flex row — no separate label above
  .field-label-wrap {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;
    width: fit-content;
  }

  .field-checkbox {
    width: 1rem;
    height: 1rem;
    accent-color: var(--plum);
    cursor: pointer;

    &:focus {
      outline: 2px solid var(--plum);
      outline-offset: -1px;
    }

    &:disabled {
      opacity: 0.6;
      cursor: default;
    }
  }

  .field-label-text {
    font-size: 0.875rem;
    color: var(--white);
  }

  .field-required {
    color: var(--light-red);
    margin-left: 0.25rem;
  }

  .field-help {
    font-size: 0.75rem;
    color: var(--grey);
    // Indent to align under the label text, past the checkbox
    padding-left: 1.5rem;
  }
</style>
