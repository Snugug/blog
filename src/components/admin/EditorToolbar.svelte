<script lang="ts">
  import { getEditorFile } from '$js/admin/editor.svelte';

  /**
   * Props for the editor toolbar.
   */
  interface Props {
    // Handler for saving a draft to IndexedDB
    onSave: () => void;
    // Handler for publishing to the filesystem
    onPublish: () => void;
    // Handler for deleting the current draft
    onDelete: () => void;
    // Whether the publish button should be disabled (missing required fields or filename)
    publishDisabled: boolean;
  }

  let { onSave, onPublish, onDelete, publishDisabled }: Props = $props();

  // Current editor file state
  const file = $derived(getEditorFile());

  // Display title from formData, falling back to filename or "Untitled Draft"
  const title = $derived(
    file && typeof file.formData.title === 'string'
      ? file.formData.title
      : file?.filename || 'Untitled Draft',
  );
</script>

{#if file}
  <header class="toolbar">
    <div class="toolbar__info">
      <h1 class="toolbar__title">
        {title}
        <span
          class="dirty-indicator"
          class:dirty-indicator--visible={file.dirty}
          title={file.dirty ? 'Unsaved changes' : ''}>&bull;</span
        >
      </h1>
      {#if file.filename}
        <p class="toolbar__filename">{file.filename}</p>
      {/if}
    </div>
    <div class="toolbar__actions">
      {#if file.draftId}
        <button class="btn btn--delete" type="button" onclick={onDelete}>
          Delete Draft
        </button>
      {/if}
      <button
        class="btn btn--save"
        type="button"
        disabled={!file.dirty || file.saving}
        onclick={onSave}
      >
        {file.saving ? 'Saving...' : 'Save'}
      </button>
      <button
        class="btn btn--publish"
        type="button"
        disabled={publishDisabled || file.saving}
        onclick={onPublish}
      >
        Publish
      </button>
    </div>
  </header>
{/if}

<style lang="scss">
  .toolbar {
    display: grid;
    grid-template-columns: 1fr auto;
    align-items: center;
    padding: 0.5rem 1rem;
    border-bottom: 1px solid var(--dark-grey);
  }

  .toolbar__info {
    display: grid;
  }

  .toolbar__title {
    font-size: 1rem;
    font-weight: normal;
    color: var(--white);
  }

  .toolbar__filename {
    font-size: 0.75rem;
    color: var(--grey);
  }

  // Always rendered to reserve space and prevent layout shift when toggling
  .dirty-indicator {
    color: transparent;
    font-size: 1.25rem;
    vertical-align: middle;
    margin-left: 0.25rem;
  }

  .dirty-indicator--visible {
    color: var(--gold);
  }

  .toolbar__actions {
    display: grid;
    grid-auto-flow: column;
    align-items: center;
    gap: 0.5rem;
  }

  .btn {
    border: none;
    border-radius: 0.25rem;
    color: var(--white);
    cursor: pointer;
    font-size: 0.875rem;
    padding: 0.25rem 0.75rem;

    &:disabled {
      opacity: 0.5;
      cursor: default;
    }
  }

  .btn--save {
    background: var(--plum);

    &:hover:not(:disabled) {
      background: var(--light-plum);
    }
  }

  .btn--publish {
    background: var(--light-green);
    color: var(--black);

    &:hover:not(:disabled) {
      background: var(--green);
    }
  }

  .btn--delete {
    background: none;
    border: 1px solid var(--light-red);
    color: var(--light-red);

    &:hover {
      background: var(--light-red);
      color: var(--white);
    }
  }
</style>
