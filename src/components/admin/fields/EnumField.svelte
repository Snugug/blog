<script lang="ts">
  import type { SchemaNode } from '$js/admin/schema-utils';

  interface Props {
    /** Field name used as the select id and label fallback */
    name: string;
    /** JSON Schema node describing this field */
    schema: SchemaNode;
    /** Current field value */
    value: unknown;
    /** The enum values to render as options */
    options: unknown[];
    /** Whether this field is required */
    required?: boolean;
    /** Callback fired when the value changes */
    onchange: (value: string | null) => void;
  }

  let {
    name,
    schema,
    value,
    options,
    required = false,
    onchange,
  }: Props = $props();

  /**
   * Converts a name string to Title Case for use as a fallback label.
   * Splits on camelCase, hyphens, and underscores.
   * @param str - The raw field name
   * @returns Title-cased display label
   */
  function toTitleCase(str: string): string {
    return str
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .replace(/[-_]/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase());
  }

  /** Display label — schema.title if present, otherwise title-cased name */
  const label = $derived(
    (schema['title'] as string | undefined) ?? toTitleCase(name),
  );

  /** String representation of the current value for select binding */
  const selectedValue = $derived(value != null ? String(value) : '');

  /** Description from schema */
  const description = $derived(schema['description'] as string | undefined);

  /** Whether field is read-only */
  const readOnly = $derived(!!(schema['readOnly'] as boolean | undefined));

  /** Whether field is deprecated — dims the entire field */
  const deprecated = $derived(!!(schema['deprecated'] as boolean | undefined));

  /** Whether empty selection should emit null (nullable anyOf-unwrapped types) */
  const nullable = $derived(!!(schema['_nullable'] as boolean | undefined));

  /** Whether to show the empty placeholder option — when not required or no value is set */
  const showEmptyOption = $derived(!required || value == null);

  /**
   * Handles select change, emitting null when empty option is selected on nullable fields.
   * @param e - The DOM change event
   */
  function handleChange(e: Event): void {
    const raw = (e.target as HTMLSelectElement).value;
    onchange(raw === '' ? (nullable ? null : '') : raw);
  }
</script>

<div class="field" class:field--deprecated={deprecated}>
  <label class="field-label" for={name}>
    {label}{#if required}<span class="field-required" aria-hidden="true">*</span
      >{/if}
  </label>

  <select
    id={name}
    class="field-select"
    value={selectedValue}
    disabled={readOnly}
    onchange={handleChange}
  >
    {#if showEmptyOption}
      <option value="">—</option>
    {/if}
    {#each options as option}
      <option value={String(option)}>{String(option)}</option>
    {/each}
  </select>

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

  .field-select {
    // Restore native dropdown arrow stripped by CSS reset
    appearance: auto;
    width: auto;
    background: var(--near-black, #2a2a2e);
    border: 1px solid var(--dark-grey);
    border-radius: 4px;
    padding: 0.5rem;
    font-size: 1rem;
    color: var(--white);
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

  .field-help {
    font-size: 0.75rem;
    color: var(--grey);
  }
</style>
