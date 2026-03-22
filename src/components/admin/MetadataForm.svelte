<script lang="ts">
  import type { SchemaNode } from '$js/admin/schema-utils';
  import { getFieldsForTab } from '$js/admin/schema-utils';
  import { getFormData, updateFormField } from '$js/admin/editor.svelte';
  import SchemaField from './fields/SchemaField.svelte';

  interface Props {
    // The JSON Schema for the collection
    schema: SchemaNode;
    // Tab name to filter by, or null for Metadata (all fields)
    tab?: string | null;
  }

  let { schema, tab = null }: Props = $props();

  // List of property names to render for this tab
  const fieldNames = $derived(getFieldsForTab(schema, tab));

  // Schema properties map
  const properties = $derived(
    (schema['properties'] as Record<string, SchemaNode>) ?? {},
  );

  // Required field names
  const requiredFields = $derived(
    Array.isArray(schema['required']) ? (schema['required'] as string[]) : [],
  );

  // Current form data
  const formData = $derived(getFormData());
</script>

<div class="metadata-form">
  {#each fieldNames as fieldName}
    {@const fieldSchema = properties[fieldName]}
    {#if fieldSchema}
      <SchemaField
        name={fieldName}
        schema={fieldSchema}
        value={formData[fieldName]}
        required={requiredFields.includes(fieldName)}
        onchange={(v) => updateFormField([fieldName], v)}
      />
    {/if}
  {/each}
</div>

<style lang="scss">
  .metadata-form {
    display: grid;
    gap: 1.25rem;
    padding: 1.5rem;
    max-width: 80ch;
    margin: 0 auto;
  }
</style>
