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

  // Display label — schema.title if present, otherwise title-cased name
  const label = $derived(
    (schema['title'] as string | undefined) ?? toTitleCase(name),
  );

  // Current string value for the input
  const inputValue = $derived(typeof value === 'string' ? value : '');

  // Max length constraint from schema, if any
  const maxLength = $derived(schema['maxLength'] as number | undefined);

  // Pattern constraint from schema, if any
  const pattern = $derived(schema['pattern'] as string | undefined);

  // Description from schema
  const description = $derived(schema['description'] as string | undefined);

  // Whether field is read-only
  const readOnly = $derived(!!(schema['readOnly'] as boolean | undefined));

  // Whether field is deprecated — dims the entire field
  const deprecated = $derived(!!(schema['deprecated'] as boolean | undefined));

  // Whether empty input should emit null (nullable anyOf-unwrapped types)
  const nullable = $derived(!!(schema['_nullable'] as boolean | undefined));

  // Whether to render as a textarea (widget: "textarea" in schema meta)
  const isTextarea = $derived(schema['widget'] === 'textarea');

  /**
   * Handles input change, emitting null for empty nullable fields.
   * @param {Event} e - The input or change event from the text input or textarea
   */
  function handleChange(e: Event): void {
    const raw = (e.target as HTMLInputElement | HTMLTextAreaElement).value;
    onchange(nullable && raw === '' ? null : raw);
  }
</script>

<div class="field" class:field--deprecated={deprecated}>
  <label class="field-label" for={name}>
    {label}{#if required}<span class="field-required" aria-hidden="true">*</span
      >{/if}
  </label>

  {#if isTextarea}
    <textarea
      id={name}
      class="field-input field-input--textarea"
      maxlength={maxLength}
      readonly={readOnly}
      rows={3}
      oninput={handleChange}>{inputValue}</textarea
    >
  {:else}
    <input
      type="text"
      id={name}
      class="field-input field-input--text"
      value={inputValue}
      maxlength={maxLength}
      {pattern}
      readonly={readOnly}
      oninput={handleChange}
    />
  {/if}

  {#if description || maxLength != null}
    <p class="field-help">
      {#if description}{description}{/if}
      {#if description && maxLength != null}&ensp;{/if}
      {#if maxLength != null}<span class="field-constraint"
          >max {maxLength}</span
        >{/if}
    </p>
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
    background: var(--near-black, #2a2a2e);
    border: 1px solid var(--dark-grey);
    border-radius: 4px;
    padding: 0.5rem;
    font-size: 1rem;
    color: var(--white);

    &:focus {
      outline: 2px solid var(--plum);
      outline-offset: -1px;
    }

    &[readonly] {
      opacity: 0.6;
      cursor: default;
    }
  }

  .field-input--text {
    width: 100%;
  }

  // Auto-grows with content; rows="3" sets minimum height
  .field-input--textarea {
    width: 100%;
    field-sizing: content;
    resize: none;
    font-family: inherit;
    line-height: 1.5;
  }

  .field-help {
    font-size: 0.75rem;
    color: var(--grey);
  }

  .field-constraint {
    font-style: italic;
  }
</style>
