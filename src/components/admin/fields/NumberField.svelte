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
    onchange: (value: number | null) => void;
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

  // Numeric value for the input, coerced from the value prop
  const inputValue = $derived(typeof value === 'number' ? value : '');

  // Min attribute: minimum takes precedence, exclusiveMinimum adds 1
  const min = $derived.by(() => {
    const minimum = schema['minimum'] as number | undefined;
    const exclusiveMin = schema['exclusiveMinimum'] as number | undefined;
    if (minimum != null) return minimum;
    if (exclusiveMin != null) return exclusiveMin + 1;
    return undefined;
  });

  // Max attribute: maximum takes precedence, exclusiveMaximum subtracts 1
  const max = $derived.by(() => {
    const maximum = schema['maximum'] as number | undefined;
    const exclusiveMax = schema['exclusiveMaximum'] as number | undefined;
    if (maximum != null) return maximum;
    if (exclusiveMax != null) return exclusiveMax - 1;
    return undefined;
  });

  // Step attribute from multipleOf
  const step = $derived(schema['multipleOf'] as number | undefined);

  // Description from schema
  const description = $derived(schema['description'] as string | undefined);

  // Whether field is read-only
  const readOnly = $derived(!!(schema['readOnly'] as boolean | undefined));

  // Whether field is deprecated — dims the entire field
  const deprecated = $derived(!!(schema['deprecated'] as boolean | undefined));

  // Whether empty input should emit null (nullable anyOf-unwrapped types)
  const nullable = $derived(!!(schema['_nullable'] as boolean | undefined));

  // Human-readable constraint summary (e.g. "min 0, max 100, step 5"), or empty string.
  const constraintText = $derived.by(() => {
    const parts: string[] = [];
    const minVal = min;
    const maxVal = max;
    if (minVal != null) parts.push(`min ${minVal}`);
    if (maxVal != null) parts.push(`max ${maxVal}`);
    if (step != null) parts.push(`step ${step}`);
    return parts.join(', ');
  });

  /**
   * Handles input change, emitting null for empty nullable fields or 0 for non-nullable.
   * @param {Event} e - The input event from the number input element
   */
  function handleChange(e: Event): void {
    const raw = (e.target as HTMLInputElement).value;
    if (raw === '') {
      onchange(nullable ? null : 0);
    } else {
      onchange(parseFloat(raw));
    }
  }
</script>

<div class="field" class:field--deprecated={deprecated}>
  <label class="field-label" for={name}>
    {label}{#if required}<span class="field-required" aria-hidden="true">*</span
      >{/if}
  </label>

  <input
    type="number"
    id={name}
    class="field-input"
    value={inputValue}
    {min}
    {max}
    {step}
    readonly={readOnly}
    oninput={handleChange}
  />

  {#if description || constraintText}
    <p class="field-help">
      {#if description}{description}{/if}
      {#if description && constraintText}&ensp;{/if}
      {#if constraintText}<span class="field-constraint">{constraintText}</span
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
    width: auto;
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

  .field-help {
    font-size: 0.75rem;
    color: var(--grey);
  }

  .field-constraint {
    font-style: italic;
  }
</style>
