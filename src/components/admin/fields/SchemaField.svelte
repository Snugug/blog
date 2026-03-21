<script lang="ts">
  import { resolveFieldType } from '$js/admin/schema-utils';
  import type { SchemaNode } from '$js/admin/schema-utils';
  import StringField from './StringField.svelte';
  import NumberField from './NumberField.svelte';
  import BooleanField from './BooleanField.svelte';
  import EnumField from './EnumField.svelte';
  import DateField from './DateField.svelte';
  import ArrayField from './ArrayField.svelte';
  import ObjectField from './ObjectField.svelte';

  interface Props {
    /** Property name for labeling and identification */
    name: string;
    /** JSON Schema node describing this field */
    schema: SchemaNode;
    /** Current field value */
    value: unknown;
    /** Whether this field is required */
    required?: boolean;
    /** Callback fired when the value changes */
    onchange: (value: unknown) => void;
    /**
     * When true, object fields render without a fieldset wrapper.
     * Used by ArrayItem to avoid redundant grouping.
     */
    inline?: boolean;
  }

  let {
    name,
    schema,
    value,
    required = false,
    onchange,
    inline = false,
  }: Props = $props();

  /** Resolve the schema node to a field type descriptor */
  const fieldType = $derived(resolveFieldType(schema));

  /**
   * Build an effective schema for rendering.
   * For nullable types (anyOf with null), spread outer annotations onto the
   * inner type schema with a _nullable flag so leaf components know to treat
   * empty as null.
   */
  const effectiveSchema = $derived.by(() => {
    if (Array.isArray(schema['anyOf'])) {
      const nonNull = (schema['anyOf'] as SchemaNode[]).find(
        (s) => s['type'] !== 'null',
      );
      if (nonNull) {
        // Spread all outer properties (title, description, deprecated,
        // readOnly, tab, etc.) onto inner type. Exclude anyOf to avoid recursion.
        const { anyOf: _, ...outerProps } = schema;
        return { ...nonNull, ...outerProps, _nullable: true };
      }
    }
    return schema;
  });
</script>

{#if fieldType.kind === 'string'}
  <StringField
    {name}
    schema={effectiveSchema}
    {value}
    {required}
    onchange={(v) => onchange(v)}
  />
{:else if fieldType.kind === 'number'}
  <NumberField
    {name}
    schema={effectiveSchema}
    {value}
    {required}
    onchange={(v) => onchange(v)}
  />
{:else if fieldType.kind === 'boolean'}
  <BooleanField
    {name}
    schema={effectiveSchema}
    {value}
    onchange={(v) => onchange(v)}
  />
{:else if fieldType.kind === 'enum'}
  <EnumField
    {name}
    schema={effectiveSchema}
    {value}
    {required}
    options={fieldType.options}
    onchange={(v) => onchange(v)}
  />
{:else if fieldType.kind === 'date'}
  <DateField
    {name}
    schema={effectiveSchema}
    {value}
    {required}
    onchange={(v) => onchange(v)}
  />
{:else if fieldType.kind === 'array'}
  <ArrayField {name} {schema} {value} {required} {onchange} />
{:else if fieldType.kind === 'object'}
  <ObjectField {name} {schema} {value} {required} {onchange} {inline} />
{/if}
