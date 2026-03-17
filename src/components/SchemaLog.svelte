<script>
  import { onMount } from 'svelte';
  import schemas from 'virtual:collections';

  /**
   * Fetches all content collection JSON schemas and logs them to the console.
   * Intended as a developer tool for inspecting schema structure.
   */
  onMount(async () => {
    for (const [name, url] of Object.entries(schemas)) {
      try {
        const res = await fetch(url);
        if (!res.ok) {
          console.error(`Failed to fetch schema "${name}": ${res.status}`);
          continue;
        }
        const schema = await res.json();
        console.log(name, schema);
      } catch (err) {
        console.error(`Error loading schema "${name}":`, err);
      }
    }
  });
</script>

<p>Check the console for schema output.</p>
