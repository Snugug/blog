<script>
  import { getContentList, isLoading, getError } from '$js/admin/state.svelte';
  import { getRoute } from '$js/admin/router.svelte';

  /** The currently selected collection name */
  const collection = $derived.by(() => {
    const r = getRoute();
    if (r.view === 'collection' || r.view === 'file') return r.collection;
    return null;
  });

  /** The currently active file slug, if any */
  const activeSlug = $derived.by(() => {
    const r = getRoute();
    return r.view === 'file' ? r.slug : null;
  });
</script>

{#if collection}
  <section class="content-list" aria-label="Content files for {collection}">
    <h2 class="list-heading">{collection}</h2>

    {#if isLoading()}
      <p class="status">Loading...</p>
    {:else if getError()}
      <p class="status error">{getError()}</p>
    {:else if getContentList().length === 0}
      <p class="status">No content files found.</p>
    {:else}
      <ul class="file-list">
        {#each getContentList() as item}
          {@const slug = item.filename.replace(/\.mdx?$/, '')}
          <li>
            <a
              href="/admin/{collection}/{slug}"
              class="file-link"
              aria-current={activeSlug === slug ? 'page' : undefined}
            >
              <span class="file-title">{item.title ?? item.filename}</span>
              {#if item.title}
                <span class="file-name">{item.filename}</span>
              {/if}
            </a>
          </li>
        {/each}
      </ul>
    {/if}
  </section>
{/if}

<style lang="scss">
  .content-list {
    padding: 1rem;
    overflow-y: auto;
  }

  .list-heading {
    font-size: 1.25rem;
    margin-bottom: 0.75rem;
    text-transform: capitalize;
  }

  .status {
    color: var(--grey);
    font-size: 0.875rem;
  }

  .error {
    color: var(--light-red);
  }

  .file-list {
    display: grid;
    gap: 0.25rem;
  }

  .file-link {
    display: grid;
    gap: 0.25rem;
    padding: 0.5rem 0.75rem;
    border-radius: 0.25rem;
    text-decoration: none;
    color: inherit;
    // Override global link box-shadow underline — list items use background highlight instead
    box-shadow: none;

    &:hover {
      background: var(--dark-grey);
    }

    &[aria-current='page'] {
      background: var(--plum);
    }
  }

  .file-title {
    font-size: 1rem;
    color: var(--white);
  }

  // Caption-level text: filename is secondary info shown below the title
  .file-name {
    font-size: 0.75rem;
    color: var(--grey);
  }
</style>
