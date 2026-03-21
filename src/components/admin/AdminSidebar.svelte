<script lang="ts">
  import {
    type SidebarItem,
    type SortMode,
    SORT_MODES,
    SORT_ORDER,
    readSortMode,
    writeSortMode,
    createComparator,
  } from '$js/admin/sort';

  export type { SidebarItem };

  interface Props {
    /** Heading text displayed at the top of the sidebar */
    title: string;
    /** Items to display in the sidebar list */
    items: SidebarItem[];
    /** href of the currently active item, highlighted with aria-current */
    activeItem?: string;
    /** Collection name for localStorage sort persistence (constructs key: cms-sort-{storageKey}) */
    storageKey?: string;
    /** Whether items are currently loading */
    loading?: boolean;
    /** Error message to display instead of items */
    error?: string;
  }

  let {
    title,
    items,
    activeItem,
    storageKey,
    loading = false,
    error,
  }: Props = $props();

  /** Whether any items have dates, controlling sort button visibility */
  const hasDates = $derived(items.some((item) => item.date != null));

  /** Search query for filtering items by label */
  let searchQuery = $state('');

  /** Current sort mode, initialized from localStorage if storageKey is provided */
  let sortMode = $state<SortMode>(
    storageKey ? readSortMode(storageKey) : 'alpha',
  );

  /** Re-read sort mode when storageKey changes (switching collections) */
  $effect(() => {
    if (storageKey) {
      sortMode = readSortMode(storageKey);
    } else {
      sortMode = 'alpha';
    }
  });

  /** Sort options available in the popover (all modes except the active one) */
  const popoverOptions = $derived(
    SORT_ORDER.filter((mode) => mode !== sortMode),
  );

  /**
   * Handles sort option selection from the popover.
   * @param mode - The selected sort mode
   */
  function selectSort(mode: SortMode): void {
    sortMode = mode;
    if (storageKey) {
      writeSortMode(storageKey, mode);
    }
  }

  /** Items filtered by search query and sorted by current mode */
  const displayedItems = $derived.by(() => {
    const query = searchQuery.toLowerCase();
    const filtered = query
      ? items.filter((item) => item.label.toLowerCase().includes(query))
      : items;
    return [...filtered].sort(createComparator(sortMode));
  });

  /** Unique ID for the sort popover element, reactive to title changes */
  const popoverId = $derived(
    `sort-popover-${title.toLowerCase().replace(/\s+/g, '-')}`,
  );

  /** Bound reference to the popover element for imperative hidePopover() calls */
  let popoverEl = $state<HTMLDivElement | null>(null);
</script>

<nav class="sidebar" aria-label={title}>
  <div class="sidebar-header">
    <h2 class="sidebar-heading">{title}</h2>

    {#if !loading && !error}
      <div class="toolbar" class:toolbar--search-only={!hasDates}>
        <input
          type="text"
          class="search-input"
          placeholder="Filter..."
          bind:value={searchQuery}
        />

        {#if hasDates}
          <button
            class="sort-btn"
            title={SORT_MODES[sortMode].label}
            interestfor={popoverId}
            commandfor={popoverId}
            command="toggle-popover"
          >
            <span class="material-symbols-outlined">
              {SORT_MODES[sortMode].icon}
            </span>
          </button>

          <div
            id={popoverId}
            class="sort-popover"
            popover="hint"
            bind:this={popoverEl}
          >
            {#each popoverOptions as mode}
              <button
                class="sort-option"
                onclick={() => {
                  selectSort(mode);
                  popoverEl?.hidePopover();
                }}
              >
                <span class="material-symbols-outlined">
                  {SORT_MODES[mode].icon}
                </span>
                {SORT_MODES[mode].label}
              </button>
            {/each}
          </div>
        {/if}
      </div>
    {/if}
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
              {item.label}
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
  }

  .sidebar-header {
    padding: 1rem;
  }

  .sidebar-heading {
    font-size: 0.875rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--grey);
    margin-bottom: 0.75rem;
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

  // Shared icon size for sort button and popover options
  .material-symbols-outlined {
    font-size: 1.25rem;
  }

  .sort-btn {
    anchor-name: --sort-btn;
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

  // display: grid is in :popover-open to avoid overriding the UA's
  // display: none on hidden popovers — CSS class specificity beats
  // the [popover]:not(:popover-open) UA rule otherwise.
  .sort-popover {
    position-anchor: --sort-btn;
    position: fixed;
    inset: unset;
    top: anchor(bottom);
    right: anchor(right);
    margin-top: 0.25rem;
    background: var(--dark-grey);
    border: 1px solid var(--grey);
    border-radius: 0.25rem;
    padding: 0.25rem;
    // Prevent width from changing when popover content changes
    min-width: 10rem;

    &:popover-open {
      display: grid;
      gap: 0.25rem;
    }
  }

  .sort-option {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem;
    border-radius: 0.25rem;
    cursor: pointer;
    font-size: 0.875rem;
    color: var(--white);
    background: none;
    border: none;
    white-space: nowrap;

    &:hover {
      background: var(--grey);
    }
  }

  .sidebar-items {
    overflow-y: auto;
    padding: 0 1rem 1rem;
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

  .item-subtitle {
    display: block;
    font-size: 0.75rem;
    color: var(--grey);
    margin-top: 0.25rem;
  }
</style>
