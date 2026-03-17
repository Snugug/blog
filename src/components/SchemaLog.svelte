<script>
  import { onMount } from 'svelte';
  import schemas from 'virtual:collections';

  /**
   * Fetches all content collection JSON schemas and logs them to the console.
   * Intended as a developer tool for inspecting schema structure.
   */
  onMount(async () => {
    for (const [name, url] of Object.entries(schemas)) {
      const res = await fetch(url);
      const schema = await res.json();
      console.log(name, schema);
    }
  });
</script>

<p>Check the console for schema output.</p>
