<script lang="ts">
  /** Placeholder — implemented in Task 8 */
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

<div>ArrayField: {name} (placeholder)</div>
