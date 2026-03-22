<script lang="ts">
  import type { SchemaNode } from '$js/admin/schema-utils';
  import { extractTabs } from '$js/admin/schema-utils';

  interface Props {
    /** The JSON Schema for the current collection (null if not loaded yet) */
    schema: SchemaNode | null;
    /** The currently active tab identifier */
    activeTab?: string;
    /** Callback fired when a tab is clicked */
    onTabChange: (tab: string) => void;
  }

  let { schema, activeTab = 'metadata', onTabChange }: Props = $props();

  // Custom tab names derived from schema, sorted alphabetically
  const customTabs = $derived(schema ? extractTabs(schema) : []);

  // All tabs: Metadata, Body, then custom tabs
  const allTabs = $derived(['metadata', 'body', ...customTabs]);
</script>

<nav class="tabs" aria-label="Editor tabs">
  {#each allTabs as tab}
    <button
      class="tabs__tab"
      class:tabs__tab--active={activeTab === tab}
      type="button"
      onclick={() => onTabChange(tab)}
      aria-selected={activeTab === tab}
      role="tab"
    >
      {tab === 'metadata'
        ? 'Metadata'
        : tab === 'body'
          ? 'Body'
          : tab.charAt(0).toUpperCase() + tab.slice(1)}
    </button>
  {/each}
</nav>

<style lang="scss">
  // Tab bar sits below the editor toolbar, separated by a border
  .tabs {
    display: flex;
    border-bottom: 1px solid var(--dark-grey);
  }

  .tabs__tab {
    padding: 0.5rem 1rem;
    font-size: 0.875rem;
    color: var(--grey);
    background: none;
    border: none;
    // Bottom border reserve space to avoid layout shift on active state
    border-bottom: 2px solid transparent;
    cursor: pointer;

    &:hover {
      color: var(--white);
    }
  }

  .tabs__tab--active {
    color: var(--white);
    border-bottom-color: var(--plum);
  }
</style>
