<script lang="ts">
  import { onMount } from 'svelte';
  import { initRouter, getRoute } from '$js/admin/router.svelte';
  import {
    getCollections,
    getDirectoryHandle,
    getPermissionState,
    restoreHandle,
    loadCollection,
    getContentList,
    getFileHandle,
    isLoading,
    getError,
  } from '$js/admin/state.svelte';
  import {
    preloadFile,
    loadFileBody,
    clearEditor,
    saveFile,
  } from '$js/admin/editor.svelte';
  import {
    fetchSchema,
    getSchema,
    clearSchema,
    prefetchAllSchemas,
    collectionHasDates,
  } from '$js/admin/schema.svelte';
  import DirectoryPicker from './DirectoryPicker.svelte';
  import AdminSidebar from './AdminSidebar.svelte';
  import EditorToolbar from './EditorToolbar.svelte';
  import EditorPane from './EditorPane.svelte';
  import EditorTabs from './EditorTabs.svelte';
  import MetadataForm from './MetadataForm.svelte';

  // Whether the admin is ready (handle exists and permission granted)
  const ready = $derived(
    getDirectoryHandle() !== null && getPermissionState() === 'granted',
  );

  // The current route for tracking collection changes
  const currentRoute = $derived(getRoute());

  // Whether a collection is currently selected
  const hasCollection = $derived(
    currentRoute.view === 'collection' || currentRoute.view === 'file',
  );

  // The active collection name, if any
  const activeCollection = $derived(
    currentRoute.view === 'collection' || currentRoute.view === 'file'
      ? currentRoute.collection
      : null,
  );

  // Whether a file is currently open in the editor
  const fileOpen = $derived(currentRoute.view === 'file');

  // Active editor tab — local state, not URL-routed
  let activeTab = $state('metadata');

  // The active file href for highlighting in the content sidebar
  const activeFileHref = $derived(
    currentRoute.view === 'file'
      ? `/admin/${currentRoute.collection}/${currentRoute.slug}`
      : undefined,
  );

  // Collection names mapped to SidebarItems, title-cased for display
  const collectionItems = $derived(
    getCollections().map((name) => ({
      label: name.charAt(0).toUpperCase() + name.slice(1),
      href: `/admin/${name}`,
    })),
  );

  // Content items mapped to SidebarItems for the active collection
  const contentItems = $derived(
    getContentList().map((item) => {
      const title =
        typeof item.data.title === 'string' ? item.data.title : item.filename;
      const published = item.data.published;
      const slug = item.filename.replace(/\.mdx?$/, '');
      return {
        label: title,
        href: `/admin/${activeCollection}/${slug}`,
        subtitle: item.filename,
        // js-yaml parses unquoted dates as Date objects, quoted dates as strings
        ...(published instanceof Date
          ? { date: published }
          : typeof published === 'string'
            ? { date: new Date(published) }
            : {}),
      };
    }),
  );

  // Trigger collection loading when route changes to a collection or file view.
  $effect(() => {
    if (
      ready &&
      (currentRoute.view === 'collection' || currentRoute.view === 'file')
    ) {
      loadCollection(currentRoute.collection);
    }
  });

  // Loads the file when the route has a slug.
  // Phase 1 (synchronous): preloadFile sets metadata immediately so the toolbar, tabs, and form render instantly.
  // Phase 2 (async): loadFileBody reads the file for the body content.
  $effect(() => {
    const items = getContentList();
    if (ready && currentRoute.view === 'file' && items.length > 0) {
      const item = items.find(
        (i) => i.filename.replace(/\.mdx?$/, '') === currentRoute.slug,
      );
      if (!item) return;

      // Phase 1: instant metadata render
      preloadFile(item.filename, item.data);

      // Phase 2: async body load
      getFileHandle(currentRoute.collection, currentRoute.slug).then(
        (fileHandle) => {
          if (fileHandle) {
            loadFileBody(fileHandle);
          }
        },
      );
    } else if (currentRoute.view !== 'file') {
      clearEditor();
    }
  });

  // Fetch the JSON Schema when the active collection changes, or clear it when no collection is active.
  $effect(() => {
    if (
      ready &&
      (currentRoute.view === 'collection' || currentRoute.view === 'file')
    ) {
      fetchSchema(currentRoute.collection);
    } else {
      clearSchema();
    }
  });

  // Reset to Metadata tab when a new file is opened
  $effect(() => {
    if (currentRoute.view === 'file') {
      activeTab = 'metadata';
    }
  });

  // Whether the active collection has date fields for sort controls
  const contentHasDates = $derived(
    activeCollection ? collectionHasDates(activeCollection) : false,
  );

  onMount(() => {
    initRouter();
    restoreHandle();
    prefetchAllSchemas();
  });
</script>

<div
  class="admin"
  class:admin--connected={ready}
  class:admin--collection={ready && hasCollection}
  class:admin--file-open={ready && fileOpen}
>
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
        activeItem={activeFileHref}
        storageKey={activeCollection}
        loading={isLoading()}
        error={getError() ?? undefined}
        hasDates={contentHasDates}
      />
    {/if}
    {#if fileOpen}
      {@const currentSchema = getSchema()}
      <form
        class="editor-area"
        onsubmit={(e) => {
          e.preventDefault();
          saveFile();
        }}
      >
        <EditorToolbar />
        <EditorTabs
          schema={currentSchema}
          {activeTab}
          onTabChange={(tab) => (activeTab = tab)}
        />
        <div class="editor-content">
          {#if activeTab === 'body'}
            <EditorPane />
          {:else if currentSchema}
            <MetadataForm
              schema={currentSchema}
              tab={activeTab === 'metadata' ? null : activeTab}
            />
          {/if}
        </div>
      </form>
    {/if}
  {/if}
</div>

<style lang="scss">
  .admin {
    // Lock to viewport height so the page never scrolls —
    // all scrolling happens inside editor-content or sidebars
    height: 100dvh;
  }

  .admin--connected {
    display: grid;
    grid-template-columns: 15rem 1fr;
  }

  .admin--collection {
    grid-template-columns: 15rem 15rem 1fr;
  }

  .admin--file-open {
    grid-template-columns: 15rem 15rem 1fr;
  }

  .editor-area {
    display: grid;
    grid-template-rows: auto auto 1fr;
    overflow: hidden;
    border-left: 1px solid var(--dark-grey);
  }

  // Scrollable content area; min-height: 0 allows the 1fr grid row to shrink
  .editor-content {
    overflow-y: auto;
    overflow-x: hidden;
    min-height: 0;
  }
</style>
