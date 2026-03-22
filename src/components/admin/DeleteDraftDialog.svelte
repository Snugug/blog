<script lang="ts">
  /**
   * Confirmation dialog for deleting a draft, using native <dialog> with modal backdrop.
   */
  interface Props {
    // Called when the user confirms deletion
    onConfirm: () => void;
    // Called when the user cancels
    onCancel: () => void;
  }

  let { onConfirm, onCancel }: Props = $props();

  // Dialog element ref
  let dialogEl = $state<HTMLDialogElement | null>(null);

  // Open the dialog on mount
  $effect(() => {
    dialogEl?.showModal();
  });
</script>

<dialog class="confirm-dialog" bind:this={dialogEl} onclose={onCancel}>
  <h2 class="dialog-title">Delete Draft?</h2>
  <p class="dialog-message">This cannot be undone.</p>
  <div class="dialog-actions">
    <button class="btn btn--cancel" type="button" onclick={onCancel}
      >Cancel</button
    >
    <button class="btn btn--delete" type="button" onclick={onConfirm}
      >Delete</button
    >
  </div>
</dialog>

<style lang="scss">
  // dialog renders in the top layer — CSS custom properties may not be inherited,
  // so use a hardcoded fallback for the background
  .confirm-dialog {
    background: var(--near-black, #1e1e22);
    color: var(--white, #e0e0e0);
    border: 1px solid var(--dark-grey);
    border-radius: 0.5rem;
    padding: 1.5rem;
    min-width: 18rem;
  }

  // Backdrop for the modal overlay
  .confirm-dialog::backdrop {
    background: rgba(0, 0, 0, 0.6);
  }

  .dialog-title {
    font-size: 1rem;
    font-weight: 600;
    margin-bottom: 0.5rem;
  }

  .dialog-message {
    font-size: 0.875rem;
    color: var(--grey);
    margin-bottom: 1.25rem;
  }

  .dialog-actions {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.75rem;
  }

  .btn {
    padding: 0.5rem 1rem;
    border-radius: 0.25rem;
    font-size: 0.875rem;
    cursor: pointer;
    border: none;
    text-align: center;
  }

  .btn--cancel {
    background: var(--dark-grey);
    color: var(--white);

    &:hover {
      background: var(--grey);
    }
  }

  .btn--delete {
    background: var(--light-red);
    color: var(--white);

    &:hover {
      background: var(--red);
    }
  }
</style>
