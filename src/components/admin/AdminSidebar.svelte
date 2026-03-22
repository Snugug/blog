<script lang="ts">
  import {
    type SidebarItem,
    type SortMode,
    readSortMode,
    createComparator,
  } from '$js/admin/sort';
  import DraftChip from './DraftChip.svelte';
  import AdminSidebarSort from './AdminSidebarSort.svelte';
  import { navigate } from '$js/admin/router.svelte';
  import { saveDraft } from '$js/admin/draft-storage';
  import { reloadCollection } from '$js/admin/state.svelte';

  export type { SidebarItem };

  /**
   * Props for the AdminSidebar component, which renders a filterable, sortable navigation list of collection items with a search input and optional sort popover.
   */
  interface Props {
    // Heading text displayed at the top of the sidebar
    title: string;
    // Items to display in the sidebar list
    items: SidebarItem[];
    // href of the currently active item, highlighted with aria-current
    activeItem?: string;
    // Collection name for localStorage sort persistence (constructs key: cms-sort-{storageKey})
    storageKey?: string;
    // Whether items are currently loading
    loading?: boolean;
    // Error message to display instead of items
    error?: string;
    // Whether this collection has date fields, enabling sort controls
    hasDates?: boolean;
    // Collection name — used for the add button's navigation target
    collection?: string;
    // Whether to show the add button
    showAdd?: boolean;
  }

  let {
    title,
    items,
    activeItem,
    storageKey,
    loading = false,
    error,
    hasDates = false,
    collection,
    showAdd = false,
  }: Props = $props();

  // Search query for filtering items by label
  let searchQuery = $state('');

  // Current sort mode, initialized from localStorage if storageKey is provided
  let sortMode = $state<SortMode>(
    storageKey ? readSortMode(storageKey) : 'alpha',
  );

  // Re-read sort mode when storageKey changes (switching collections)
  $effect(() => {
    if (storageKey) {
      sortMode = readSortMode(storageKey);
    } else {
      sortMode = 'alpha';
    }
  });

  /**
   * Creates a new empty draft in IndexedDB and navigates to it.
   * @return {Promise<void>}
   */
  async function handleAdd(): Promise<void> {
    if (!collection) return;
    const id = crypto.randomUUID();
    await saveDraft({
      id,
      collection,
      filename: null,
      isNew: true,
      formData: {},
      body: '',
      snapshot: null,
      createdAt: new Date().toISOString(),
    });
    reloadCollection(collection);
    navigate(`/admin/${collection}/draft-${id}`);
  }

  // Items filtered by search query and sorted by current mode
  const displayedItems = $derived.by(() => {
    const query = searchQuery.toLowerCase();
    const filtered = query
      ? items.filter((item) => item.label.toLowerCase().includes(query))
      : items;
    return [...filtered].sort(createComparator(sortMode));
  });
</script>

<nav class="sidebar" aria-label={title}>
  <div class="sidebar-header">
    <div class="sidebar-heading-row">
      <h2 class="sidebar-heading">{title}</h2>
      {#if showAdd}
        <button
          class="add-btn"
          title="New {title.toLowerCase()}"
          onclick={handleAdd}
        >
          <span class="material-symbols-outlined">add</span>
        </button>
      {/if}
    </div>

    <div class="toolbar" class:toolbar--search-only={!hasDates}>
      <input
        type="text"
        class="search-input"
        placeholder="Filter..."
        bind:value={searchQuery}
      />

      {#if hasDates}
        <AdminSidebarSort bind:sortMode {storageKey} />
      {/if}
    </div>
  </div>

  <div class="sidebar-items">
    {#if loading}
      <p class="status">Loading...</p>
    {:else if error}
      <p class="status status--error">{error}</p>
    {:else if displayedItems.length === 0}
      <p class="status">No items found.</p>
    {:else}
      <ul class="sidebar-list">
        {#each displayedItems as item}
          <li>
            <a
              href={item.href}
              class="sidebar-link"
              aria-current={activeItem === item.href ? 'page' : undefined}
            >
              <span class="item-label-row">
                <span class="item-label-text">{item.label}</span>
                {#if item.isDraft}
                  <DraftChip variant="draft" />
                {/if}
                {#if item.isOutdated}
                  <DraftChip variant="outdated" />
                {/if}
              </span>
              {#if item.subtitle}
                <span class="item-subtitle">{item.subtitle}</span>
              {/if}
            </a>
          </li>
        {/each}
      </ul>
    {/if}
  </div>
</nav>

<style lang="scss">
  .sidebar {
    display: grid;
    grid-template-rows: auto 1fr;
    height: 100dvh;
    border-right: 1px solid var(--dark-grey);
    position: sticky;
    top: 0;
  }

  .sidebar-header {
    padding: 1rem;
  }

  .sidebar-heading {
    font-size: 0.875rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--grey);
    margin-bottom: 0;
  }

  .toolbar {
    display: grid;
    grid-template-columns: 1fr auto;
    gap: 0.5rem;
    align-items: center;
  }

  .toolbar--search-only {
    grid-template-columns: 1fr;
  }

  .search-input {
    width: 100%;
    padding: 0.25rem 0.5rem;
    background: var(--black);
    border: 1px solid var(--dark-grey);
    border-radius: 0.25rem;
    color: var(--white);
    font-size: 0.875rem;

    &::placeholder {
      color: var(--grey);
    }
  }

  .sidebar-items {
    overflow-y: auto;
    padding: 0 0 1rem;
  }

  .status {
    color: var(--grey);
    font-size: 0.875rem;
    padding: 0.5rem 0.75rem;
  }

  .status--error {
    color: var(--light-red);
  }

  .sidebar-list {
    display: grid;
  }

  .sidebar-link {
    display: block;
    padding: 0.5rem 1rem;
    color: var(--white);
    text-decoration: none;
    font-size: 1rem;
    // Override global link box-shadow underline — sidebar items use background highlight instead
    box-shadow: none;

    &:hover {
      background: var(--dark-grey);
    }

    // Active highlight extends to sidebar edges with no border-radius
    &[aria-current='page'] {
      background: var(--plum);
    }
  }

  .item-subtitle {
    display: block;
    font-size: 0.75rem;
    color: var(--grey);
    margin-top: 0.25rem;
  }

  .sidebar-heading-row {
    display: grid;
    grid-template-columns: 1fr auto;
    align-items: center;
    margin-bottom: 0.75rem;
  }

  .add-btn {
    background: none;
    border: none;
    color: var(--grey);
    padding: 0;
    cursor: pointer;
    display: grid;
    place-items: center;

    &:hover {
      color: var(--white);
    }
  }

  // Flex is appropriate here because chips need inline flow with wrapping
  .item-label-row {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    flex-wrap: wrap;
  }

  .item-label-text {
    // Prevent long titles from pushing chips to a new line unnecessarily
    min-width: 0;
  }
</style>
