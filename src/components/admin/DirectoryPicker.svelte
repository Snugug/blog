<script>
  import {
    getDirectoryHandle,
    getPermissionState,
    getError,
    pickDirectory,
    requestPermission,
  } from '$js/admin/state.svelte';

  // Whether the stored handle needs re-authorization
  const needsReauth = $derived(
    getDirectoryHandle() !== null && getPermissionState() === 'prompt',
  );

  // Whether to show the initial picker
  const showPicker = $derived(
    getDirectoryHandle() === null || getPermissionState() === 'denied',
  );
</script>

<div class="picker">
  {#if needsReauth}
    <p>This folder requires re-authorization to continue.</p>
    <button onclick={requestPermission}>Re-authorize folder</button>
  {:else if showPicker}
    <p>Select your project folder to get started.</p>
    <button onclick={pickDirectory}>Choose project folder</button>
  {/if}

  {#if getError()}
    <p class="error">{getError()}</p>
  {/if}
</div>

<style lang="scss">
  .picker {
    display: grid;
    place-items: center;
    gap: 1rem;
    padding: var(--spacing);
    min-height: 50vh;
    text-align: center;
  }

  button {
    background: var(--plum);
    border: none;
    border-radius: 0.5rem;
    color: var(--white);
    cursor: pointer;
    font-size: 1rem;
    padding: 0.75rem 1.5rem;

    &:hover {
      background: var(--light-plum);
    }
  }

  .error {
    color: var(--light-red);
    font-size: 0.875rem;
  }
</style>
