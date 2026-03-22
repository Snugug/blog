<script lang="ts">
  import {
    type SortMode,
    SORT_MODES,
    SORT_ORDER,
    writeSortMode,
  } from '$js/admin/sort';

  /**
   * Sort control for the admin sidebar: shows the active sort mode as an icon button and a popover with the remaining options. Extracted to keep AdminSidebar under the 350-line limit.
   */
  interface Props {
    // Bindable sort mode — updated when the user selects a new option
    sortMode: SortMode;
    // Collection name for localStorage persistence (constructs key: cms-sort-{storageKey})
    storageKey?: string;
  }

  let { sortMode = $bindable(), storageKey }: Props = $props();

  // Sort options available in the popover (all modes except the active one)
  const popoverOptions = $derived(
    SORT_ORDER.filter((mode) => mode !== sortMode),
  );

  // Unique ID for the sort popover element
  const popoverId = $derived(`sort-popover-${storageKey ?? 'default'}`);

  // Bound reference to the popover element for imperative hidePopover() calls
  let popoverEl = $state<HTMLDivElement | null>(null);

  /**
   * Applies the selected sort mode and persists it to localStorage.
   * @param {SortMode} mode - The sort mode to apply
   * @return {void}
   */
  function selectSort(mode: SortMode): void {
    sortMode = mode;
    if (storageKey) {
      writeSortMode(storageKey, mode);
    }
  }
</script>

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

<div id={popoverId} class="sort-popover" popover="hint" bind:this={popoverEl}>
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

<style lang="scss">
  // Shared icon size for sort button and popover options
  .material-symbols-outlined {
    font-size: 1.25rem;
  }

  .sort-btn {
    anchor-name: --sort-btn;
    interest-delay: 0s;
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

  // display: grid is in :popover-open to avoid overriding the UA's display: none on hidden popovers
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

    // Invisible bridge between the sort button and popover so hover interest isn't broken by the gap
    &::before {
      content: '';
      position: absolute;
      bottom: 100%;
      left: 0;
      right: 0;
      height: 0.25rem;
    }

    &:popover-open {
      display: grid;
      gap: 0.25rem;
    }
  }

  .sort-option {
    display: grid;
    grid-template-columns: auto 1fr;
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
</style>
