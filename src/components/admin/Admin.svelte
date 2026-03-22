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
    getDrafts,
    getOutdatedMap,
  } from '$js/admin/state.svelte';
  import {
    preloadFile,
    loadFileBody,
    clearEditor,
    getActiveTab,
    getEditorFile,
    loadDraftById,
  } from '$js/admin/editor.svelte';
  import {
    fetchSchema,
    getSchema,
    clearSchema,
    prefetchAllSchemas,
    collectionHasDates,
  } from '$js/admin/schema.svelte';
  import {
    handleSave,
    handlePublish,
    handleDeleteDraft,
    handleFilenameConfirm,
    computePublishDisabled,
  } from '$js/admin/admin-handlers';
  import DirectoryPicker from './DirectoryPicker.svelte';
  import AdminSidebar from './AdminSidebar.svelte';
  import EditorToolbar from './EditorToolbar.svelte';
  import EditorPane from './EditorPane.svelte';
  import EditorTabs from './EditorTabs.svelte';
  import MetadataForm from './MetadataForm.svelte';
  import FilenameDialog from './FilenameDialog.svelte';
  import DeleteDraftDialog from './DeleteDraftDialog.svelte';

  // Whether the admin is ready (handle exists and permission granted)
  const ready = $derived(
    getDirectoryHandle() !== null && getPermissionState() === 'granted',
  );

  // The current route for tracking collection changes
  const currentRoute = $derived(getRoute());

  // Whether a collection is currently selected (including draft view)
  const hasCollection = $derived(currentRoute.view !== 'home');

  // The active collection name, if any
  const activeCollection = $derived(
    currentRoute.view !== 'home' ? currentRoute.collection : null,
  );

  // Whether a file or draft is currently open in the editor
  const fileOpen = $derived(
    currentRoute.view === 'file' || currentRoute.view === 'draft',
  );

  // Active editor tab from shared editor state
  const activeTab = $derived(getActiveTab());

  // The active file/draft href for highlighting in the content sidebar
  const activeFileHref = $derived.by(() => {
    if (currentRoute.view === 'file')
      return `/admin/${currentRoute.collection}/${currentRoute.slug}`;
    if (currentRoute.view === 'draft')
      return `/admin/${currentRoute.collection}/draft/${currentRoute.draftId}`;
    return undefined;
  });

  // Collection names mapped to SidebarItems, title-cased for display
  const collectionItems = $derived(
    getCollections().map((name) => ({
      label: name.charAt(0).toUpperCase() + name.slice(1),
      href: `/admin/${name}`,
    })),
  );

  // Content items merged with draft data (DRAFT/OUTDATED chips) plus new draft items
  const contentItems = $derived.by(() => {
    const liveItems = getContentList().map((item) => {
      const title =
        typeof item.data.title === 'string' ? item.data.title : item.filename;
      const published = item.data.published;
      const slug = item.filename.replace(/\.mdx?$/, '');
      const draft = getDrafts().find(
        (d) => !d.isNew && d.filename === item.filename,
      );
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
        ...(draft
          ? {
              draftId: draft.id,
              isDraft: true,
              isOutdated: getOutdatedMap()[draft.id] ?? false,
            }
          : {}),
      };
    });
    const newDraftItems = getDrafts()
      .filter((d) => d.isNew)
      .map((d) => ({
        label:
          typeof d.formData.title === 'string'
            ? d.formData.title
            : 'Untitled Draft',
        href: `/admin/${activeCollection}/draft/${d.id}`,
        draftId: d.id,
        isDraft: true as const,
        isOutdated: false,
        date: new Date(d.createdAt),
      }));
    return [...liveItems, ...newDraftItems];
  });

  // Whether the active collection has date fields for sort controls
  const contentHasDates = $derived(
    activeCollection ? collectionHasDates(activeCollection) : false,
  );

  // Whether the publish button should be disabled (missing required fields)
  const publishDisabled = $derived(
    computePublishDisabled(getSchema(), getEditorFile()?.formData ?? {}),
  );

  // Existing filenames for uniqueness validation in the filename dialog
  const existingFilenames = $derived(
    getContentList().map((item) => item.filename),
  );

  // Dialog visibility state
  let showFilenameDialog = $state(false);
  let showDeleteDialog = $state(false);

  // Trigger collection loading when route changes to a collection, file, or draft view
  $effect(() => {
    if (ready && currentRoute.view !== 'home') {
      loadCollection(currentRoute.collection);
    }
  });

  // Loads the file when the route has a slug (file view).
  // Phase 1: preloadFile checks IDB for a draft, otherwise sets metadata immediately.
  // Phase 2 (async): loadFileBody reads the body from disk if no draft was found.
  $effect(() => {
    const items = getContentList();
    if (ready && currentRoute.view === 'file' && items.length > 0) {
      const item = items.find(
        (i) => i.filename.replace(/\.mdx?$/, '') === currentRoute.slug,
      );
      if (!item) return;

      // preloadFile is async — it checks IDB for a draft first
      preloadFile(currentRoute.collection, item.filename, item.data).then(
        () => {
          // If preloadFile loaded a draft (body already present), skip disk read
          const editorFile = getEditorFile();
          if (editorFile?.draftId) return;

          getFileHandle(currentRoute.collection, currentRoute.slug).then(
            (fileHandle) => {
              if (fileHandle) loadFileBody(fileHandle);
            },
          );
        },
      );
    } else if (currentRoute.view === 'draft') {
      // Draft route — load draft directly from IndexedDB
      if (ready) {
        loadDraftById(currentRoute.draftId, currentRoute.collection);
      }
    } else if (currentRoute.view !== 'file') {
      clearEditor();
    }
  });

  // Fetch the JSON Schema when the active collection changes
  $effect(() => {
    if (ready && currentRoute.view !== 'home') {
      fetchSchema(currentRoute.collection);
    } else {
      clearSchema();
    }
  });

  /**
   * Handles the publish button click, showing the filename dialog if needed.
   * @return {Promise<void>}
   */
  async function onPublish(): Promise<void> {
    const result = await handlePublish(activeCollection);
    if (result.status === 'needs-filename') {
      showFilenameDialog = true;
    }
  }

  /**
   * Handles filename dialog confirmation.
   * @param {string} filename - The chosen filename
   * @return {Promise<void>}
   */
  async function onFilenameConfirm(filename: string): Promise<void> {
    showFilenameDialog = false;
    await handleFilenameConfirm(filename, activeCollection);
  }

  /**
   * Handles delete draft confirmation.
   * @return {Promise<void>}
   */
  async function onDeleteConfirm(): Promise<void> {
    showDeleteDialog = false;
    await handleDeleteDraft(activeCollection);
  }

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
        collection={activeCollection}
        showAdd={true}
      />
    {/if}
    {#if fileOpen}
      {@const currentSchema = getSchema()}
      <div class="editor-area">
        <EditorToolbar
          onSave={handleSave}
          {onPublish}
          onDelete={() => {
            showDeleteDialog = true;
          }}
          {publishDisabled}
        />
        <EditorTabs schema={currentSchema} />
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
      </div>
    {/if}
  {/if}
</div>

{#if showFilenameDialog}
  {@const file = getEditorFile()}
  <FilenameDialog
    title={typeof file?.formData.title === 'string' ? file.formData.title : ''}
    {existingFilenames}
    onConfirm={onFilenameConfirm}
    onCancel={() => {
      showFilenameDialog = false;
    }}
  />
{/if}

{#if showDeleteDialog}
  <DeleteDraftDialog
    onConfirm={onDeleteConfirm}
    onCancel={() => {
      showDeleteDialog = false;
    }}
  />
{/if}

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
