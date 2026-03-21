<script lang="ts">
  /** Placeholder — implemented in Task 7 */
  let {
    name,
  }: {
    name: string;
    schema: any;
    value: unknown;
    required?: boolean;
    onchange: (v: unknown) => void;
  } = $props();
</script>

<div>ObjectField: {name} (placeholder)</div>
