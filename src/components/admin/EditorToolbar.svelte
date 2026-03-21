<script>
  import { getEditorFile, saveFile } from '$js/admin/editor.svelte';

  /** Current editor file state */
  const file = $derived(getEditorFile());
</script>

{#if file}
  <header class="toolbar">
    <span class="filename">
      {file.filename}
      {#if file.dirty}
        <span class="dirty-indicator" title="Unsaved changes">&bull;</span>
      {/if}
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

  .dirty-indicator {
    color: var(--gold);
    font-size: 1.25rem;
    vertical-align: middle;
    margin-left: 0.25rem;
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
