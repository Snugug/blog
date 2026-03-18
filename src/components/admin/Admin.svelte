<script>
  import { onMount } from 'svelte';
  import { initRouter, getRoute } from '$js/admin/router.svelte';
  import {
    getDirectoryHandle,
    getPermissionState,
    restoreHandle,
    loadCollection,
  } from '$js/admin/state.svelte';
  import DirectoryPicker from './DirectoryPicker.svelte';
  import CollectionSidebar from './CollectionSidebar.svelte';
  import ContentList from './ContentList.svelte';

  /** Whether the admin is ready (handle exists and permission granted) */
  const ready = $derived(
    getDirectoryHandle() !== null && getPermissionState() === 'granted',
  );

  /** The current route for tracking collection changes */
  const currentRoute = $derived(getRoute());

  /**
   * Dispatch worker when collection changes.
   * State module owns the worker, this effect just triggers it.
   */
  $effect(() => {
    if (ready && currentRoute.view === 'collection') {
      loadCollection(currentRoute.collection);
    }
  });

  onMount(() => {
    initRouter();
    restoreHandle();
  });
</script>

<div class="admin" class:admin--connected={ready}>
  {#if !ready}
    <DirectoryPicker />
  {:else}
    <CollectionSidebar />
    <ContentList />
  {/if}
</div>

<style lang="scss">
  .admin {
    min-height: 80vh;
  }

  .admin--connected {
    display: grid;
    grid-template-columns: 15rem 1fr;
  }
</style>
