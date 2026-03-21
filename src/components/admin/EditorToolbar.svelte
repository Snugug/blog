<script>
  import { getEditorFile } from '$js/admin/editor.svelte';

  /** Current editor file state */
  const file = $derived(getEditorFile());

  /** Display title from formData, falling back to filename */
  const title = $derived(
    file && typeof file.formData.title === 'string'
      ? file.formData.title
      : file?.filename ?? '',
  );
</script>

{#if file}
  <header class="toolbar">
    <div class="toolbar__info">
      <span class="toolbar__title">
        {title}
        <span
          class="dirty-indicator"
          class:dirty-indicator--visible={file.dirty}
          title={file.dirty ? 'Unsaved changes' : ''}>&bull;</span
        >
      </span>
      <span class="toolbar__filename">{file.filename}</span>
    </div>
    <button
      class="save-button"
      type="submit"
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

  .toolbar__info {
    display: grid;
    gap: 0.25rem;
  }

  .toolbar__title {
    font-size: 1rem;
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
