<script>
  import { onMount } from 'svelte';
  import { initRouter, getRoute } from '$js/admin/router.svelte';
  import {
    getDirectoryHandle,
    getPermissionState,
    restoreHandle,
    loadCollection,
    getFileHandle,
    getContentList,
  } from '$js/admin/state.svelte';
  import {
    loadFile,
    clearEditor,
    getEditorFile,
  } from '$js/admin/editor.svelte';
  import DirectoryPicker from './DirectoryPicker.svelte';
  import CollectionSidebar from './CollectionSidebar.svelte';
  import ContentList from './ContentList.svelte';
  import EditorToolbar from './EditorToolbar.svelte';
  import EditorPane from './EditorPane.svelte';

  /** Whether the admin is ready (handle exists and permission granted) */
  const ready = $derived(
    getDirectoryHandle() !== null && getPermissionState() === 'granted',
  );

  /** The current route for tracking collection changes */
  const currentRoute = $derived(getRoute());

  /** Whether a file is currently open in the editor */
  const fileOpen = $derived(currentRoute.view === 'file');

  /**
   * Dispatch worker when collection changes.
   * State module owns the worker, this effect just triggers it.
   */
  $effect(() => {
    if (
      ready &&
      (currentRoute.view === 'collection' || currentRoute.view === 'file')
    ) {
      loadCollection(currentRoute.collection);
    }
  });

  /**
   * Load file when route has a slug.
   * Reading getContentList() creates a reactive dependency so this effect
   * re-runs when the worker finishes loading the collection — fixing the
   * race condition where a deep-link arrives before content is loaded.
   */
  $effect(() => {
    const items = getContentList();
    if (ready && currentRoute.view === 'file' && items.length > 0) {
      getFileHandle(currentRoute.collection, currentRoute.slug).then(
        (fileHandle) => {
          if (fileHandle) {
            loadFile(fileHandle);
          }
        },
      );
    } else if (currentRoute.view !== 'file') {
      clearEditor();
    }
  });

  onMount(() => {
    initRouter();
    restoreHandle();
  });
</script>

<div
  class="admin"
  class:admin--connected={ready}
  class:admin--file-open={ready && fileOpen}
>
  {#if !ready}
    <DirectoryPicker />
  {:else}
    <CollectionSidebar />
    <ContentList />
    {#if fileOpen}
      <div class="editor-area">
        <EditorToolbar />
        <EditorPane />
      </div>
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

  .admin--file-open {
    grid-template-columns: 15rem 15rem 1fr;
  }

  .editor-area {
    display: grid;
    grid-template-rows: auto 1fr;
    overflow: hidden;
    border-left: 1px solid var(--dark-grey);
  }
</style>
