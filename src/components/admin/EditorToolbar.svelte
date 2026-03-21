<script>
  import { getEditorFile, saveFile } from '$js/admin/editor.svelte';

  /** Current editor file state */
  const file = $derived(getEditorFile());
</script>

{#if file}
  <header class="toolbar">
    <span class="filename">
      {file.filename}
      <span
        class="dirty-indicator"
        class:dirty-indicator--visible={file.dirty}
        title={file.dirty ? 'Unsaved changes' : ''}>&bull;</span
      >
    </span>
    <button
      class="save-button"
      onclick={saveFile}
      disabled={!file.dirty || file.saving}
    >
      {file.saving ? 'Saving...' : 'Save'}
    </button>
  </header>
{/if}

<style lang="scss">
  .toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.5rem 1rem;
    border-bottom: 1px solid var(--dark-grey);
  }

  .filename {
    font-size: 0.875rem;
    color: var(--white);
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

  .save-button {
    background: var(--plum);
    border: none;
    border-radius: 0.25rem;
    color: var(--white);
    cursor: pointer;
    font-size: 0.875rem;
    padding: 0.25rem 0.75rem;

    &:hover:not(:disabled) {
      background: var(--light-plum);
    }

    &:disabled {
      opacity: 0.5;
      cursor: default;
    }
  }
</style>
