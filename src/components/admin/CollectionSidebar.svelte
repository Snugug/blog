<script>
  import { getCollections } from '$js/admin/state.svelte';
  import { getRoute } from '$js/admin/router.svelte';

  /** The currently selected collection name, if any */
  const activeCollection = $derived.by(() => {
    const r = getRoute();
    return r.view === 'collection' ? r.collection : null;
  });
</script>

<nav class="sidebar" aria-label="Content collections">
  <h2 class="sidebar-heading">Collections</h2>
  <ul class="sidebar-list">
    {#each getCollections() as name}
      <li>
        <a
          href="/admin/{name}"
          class="sidebar-link"
          aria-current={activeCollection === name ? 'page' : undefined}
        >
          {name}
        </a>
      </li>
    {/each}
  </ul>
</nav>

<style lang="scss">
  .sidebar {
    border-right: 1px solid var(--dark-grey);
    padding: 1rem;
    overflow-y: auto;
  }

  .sidebar-heading {
    font-size: 0.875rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--grey);
    margin-bottom: 0.75rem;
  }

  .sidebar-list {
    display: grid;
    gap: 0.25rem;
  }

  .sidebar-link {
    display: block;
    padding: 0.5rem 0.75rem;
    border-radius: 0.25rem;
    color: var(--white);
    text-decoration: none;
    font-size: 1rem;
    // Override global link box-shadow underline — sidebar items use background highlight instead
    box-shadow: none;

    &:hover {
      background: var(--dark-grey);
    }

    &[aria-current='page'] {
      background: var(--plum);
    }
  }
</style>
