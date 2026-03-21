<script>
  import { onMount } from 'svelte';
  import { initRouter, getRoute } from '$js/admin/router.svelte';
  import {
    getCollections,
    getDirectoryHandle,
    getPermissionState,
    restoreHandle,
    loadCollection,
    getContentList,
    isLoading,
    getError,
  } from '$js/admin/state.svelte';
  import DirectoryPicker from './DirectoryPicker.svelte';
  import AdminSidebar from './AdminSidebar.svelte';

  /** Whether the admin is ready (handle exists and permission granted) */
  const ready = $derived(
    getDirectoryHandle() !== null && getPermissionState() === 'granted',
  );

  /** The current route for tracking collection changes */
  const currentRoute = $derived(getRoute());

  /** Whether a collection is currently selected */
  const hasCollection = $derived(currentRoute.view === 'collection');

  /** The active collection name, if any */
  const activeCollection = $derived(
    currentRoute.view === 'collection' ? currentRoute.collection : null,
  );

  /** Collection names mapped to SidebarItems */
  const collectionItems = $derived(
    getCollections().map((name) => ({
      label: name,
      href: `/admin/${name}`,
    })),
  );

  /** Content items mapped to SidebarItems for the active collection */
  const contentItems = $derived(
    getContentList().map((item) => {
      const title =
        typeof item.data.title === 'string' ? item.data.title : item.filename;
      const published = item.data.published;
      const slug = item.filename.replace(/\.md$/, '');
      return {
        label: title,
        href: `/admin/${activeCollection}/${slug}`,
        subtitle: item.filename,
        ...(typeof published === 'string'
          ? { date: new Date(published) }
          : {}),
      };
    }),
  );

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

<div class="admin" class:admin--connected={ready} class:admin--collection={ready && hasCollection}>
  {#if !ready}
    <DirectoryPicker />
  {:else}
    <AdminSidebar
      title="Collections"
      items={collectionItems}
      activeItem={activeCollection ? `/admin/${activeCollection}` : undefined}
    />
    {#if hasCollection && activeCollection}
      <AdminSidebar
        title={activeCollection}
        items={contentItems}
        storageKey={activeCollection}
        loading={isLoading()}
        error={getError() ?? undefined}
      />
    {/if}
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

  .admin--collection {
    grid-template-columns: 15rem 15rem 1fr;
  }
</style>
