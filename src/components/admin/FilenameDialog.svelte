<script lang="ts">
  import { slugify } from '$js/admin/slug';

  /**
   * Props for the FilenameDialog, a native <dialog> that prompts the user to set a filename before publishing.
   */
  interface Props {
    // The title from formData, used to pre-populate the slug suggestion
    title: string;
    // Existing filenames (both live and draft) to validate uniqueness against
    existingFilenames: string[];
    // Called with the chosen filename (including .md extension) when confirmed
    onConfirm: (filename: string) => void;
    // Called when the dialog is cancelled
    onCancel: () => void;
  }

  let { title, existingFilenames, onConfirm, onCancel }: Props = $props();

  // The dialog element ref for imperative showModal/close
  let dialogEl = $state<HTMLDialogElement | null>(null);

  // The slug input value, initialized from slugified title
  let slug = $state(slugify(title));

  // Validation error message
  const error = $derived.by(() => {
    if (!slug.trim()) return 'Filename cannot be empty';
    const full = `${slug}.md`;
    if (existingFilenames.includes(full)) {
      return 'A file with this name already exists';
    }
    return null;
  });

  // Open the dialog on mount
  $effect(() => {
    dialogEl?.showModal();
  });

  /**
   * Handles the confirm action — calls onConfirm with the full filename.
   * @return {void}
   */
  function handleConfirm(): void {
    if (error) return;
    onConfirm(`${slug}.md`);
  }

  /**
   * Handles the cancel action — closes the dialog and calls onCancel.
   * @return {void}
   */
  function handleCancel(): void {
    dialogEl?.close();
    onCancel();
  }
</script>

<dialog class="filename-dialog" bind:this={dialogEl} onclose={handleCancel}>
  <h2 class="dialog-title">Set Filename</h2>
  <div class="input-row">
    <input
      class="slug-input"
      type="text"
      bind:value={slug}
      onkeydown={(e) => {
        if (e.key === 'Enter' && !error) handleConfirm();
      }}
    />
    <span class="extension">.md</span>
  </div>
  {#if error}
    <p class="error">{error}</p>
  {/if}
  <div class="dialog-actions">
    <button class="btn btn--cancel" type="button" onclick={handleCancel}
      >Cancel</button
    >
    <button
      class="btn btn--confirm"
      type="button"
      disabled={!!error}
      onclick={handleConfirm}>Confirm</button
    >
  </div>
</dialog>

<style lang="scss">
  .filename-dialog {
    background: var(--near-black);
    color: var(--white);
    border: 1px solid var(--dark-grey);
    border-radius: 0.5rem;
    padding: 1.5rem;
    min-width: 20rem;
  }

  // Backdrop for the modal overlay
  .filename-dialog::backdrop {
    background: rgba(0, 0, 0, 0.6);
  }

  .dialog-title {
    font-size: 1rem;
    font-weight: 600;
    margin-bottom: 1rem;
  }

  .input-row {
    display: grid;
    grid-template-columns: 1fr auto;
    align-items: center;
    gap: 0.25rem;
  }

  .slug-input {
    width: 100%;
    padding: 0.5rem;
    background: var(--black);
    border: 1px solid var(--dark-grey);
    border-radius: 0.25rem;
    color: var(--white);
    font-size: 1rem;
  }

  .extension {
    color: var(--grey);
    font-size: 1rem;
  }

  .error {
    color: var(--light-red);
    font-size: 0.875rem;
    margin-top: 0.5rem;
  }

  .dialog-actions {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.75rem;
    margin-top: 1.25rem;
  }

  .btn {
    padding: 0.5rem 1rem;
    border-radius: 0.25rem;
    font-size: 0.875rem;
    cursor: pointer;
    border: none;
  }

  .btn--cancel {
    background: var(--dark-grey);
    color: var(--white);

    &:hover {
      background: var(--grey);
    }
  }

  .btn--confirm {
    background: var(--plum);
    color: var(--white);

    &:hover:not(:disabled) {
      background: var(--light-plum);
    }

    &:disabled {
      opacity: 0.5;
      cursor: default;
    }
  }
</style>
