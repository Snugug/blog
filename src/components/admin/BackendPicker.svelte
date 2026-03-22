<script lang="ts">
  import {
    getBackendType,
    getPermissionState,
    getError,
    pickDirectory,
    requestPermission,
    connectGitHub,
  } from '$js/admin/state.svelte';

  // Whether the stored FSA handle needs re-authorization
  const needsReauth = $derived(
    getBackendType() === 'fsa' && getPermissionState() === 'prompt',
  );

  // GitHub form state
  let token = $state('');
  let repo = $state('');
  let connecting = $state(false);
  let githubError = $state<string | null>(null);

  /**
   * Handles the GitHub connect form submission.
   * @return {Promise<void>}
   */
  async function handleGitHubConnect(): Promise<void> {
    if (!token || !repo) return;
    connecting = true;
    githubError = null;
    try {
      await connectGitHub(token, repo);
    } catch (err) {
      githubError = err instanceof Error ? err.message : String(err);
    } finally {
      connecting = false;
    }
  }
</script>

{#if needsReauth}
  <div class="picker">
    <p>This folder requires re-authorization to continue.</p>
    <button onclick={requestPermission}>Re-authorize folder</button>
  </div>
{:else}
  <div class="picker">
    <h2 class="picker-title">Connect to your project</h2>

    <div class="picker-options">
      <div class="picker-option">
        <h3>Local Folder</h3>
        <p>Select your project folder on this device.</p>
        <button onclick={pickDirectory}>Choose project folder</button>
      </div>

      <div class="picker-option">
        <h3>GitHub Repository</h3>
        <p>Connect using a Personal Access Token.</p>
        <form
          onsubmit={(e) => {
            e.preventDefault();
            handleGitHubConnect();
          }}
        >
          <label>
            <span class="field-label">
              Personal Access Token
              <button
                class="info-btn"
                type="button"
                title="Required permissions"
                interestfor="pat-info"
                commandfor="pat-info"
                command="toggle-popover"
              >
                <span class="material-symbols-outlined">info</span>
              </button>
            </span>
            <input type="password" bind:value={token} placeholder="ghp_..." />
          </label>
          <div id="pat-info" class="pat-tooltip" popover="hint" role="tooltip">
            <p class="pat-tooltip-heading">
              Create a <a
                href="https://github.com/settings/personal-access-tokens"
                target="_blank"
                rel="noopener noreferrer">fine-grained PAT</a
              > with:
            </p>
            <dl class="pat-permissions">
              <div class="pat-permission">
                <dt>Contents</dt>
                <dd>Read and write</dd>
              </div>
              <div class="pat-permission">
                <dt>Metadata</dt>
                <dd>
                  Read-only <span class="pat-note">(included by default)</span>
                </dd>
              </div>
            </dl>
          </div>
          <label>
            <span class="field-label">Repository</span>
            <input type="text" bind:value={repo} placeholder="owner/repo" />
          </label>
          <button type="submit" disabled={!token || !repo || connecting}>
            {connecting ? 'Connecting...' : 'Connect'}
          </button>
        </form>
        {#if githubError}
          <p class="error">{githubError}</p>
        {/if}
      </div>
    </div>

    {#if getError()}
      <p class="error">{getError()}</p>
    {/if}
  </div>
{/if}

<style lang="scss">
  .picker {
    display: grid;
    place-items: center;
    gap: 1rem;
    padding: var(--spacing);
    min-height: 50vh;
    text-align: center;
  }

  .picker-title {
    font-size: 1.5rem;
    margin-bottom: 0.5rem;
  }

  .picker-options {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 2rem;
    max-width: 40rem;
    width: 100%;
  }

  .picker-option {
    display: grid;
    // auto rows for content, last row (button/form) aligns to bottom
    grid-template-rows: auto auto 1fr;
    align-items: start;
    gap: 0.75rem;
    padding: 1.5rem;
    border: 1px solid var(--dark-grey);
    border-radius: 0.5rem;
    text-align: left;

    h3 {
      font-size: 1.25rem;
      margin: 0;
    }

    p {
      font-size: 0.875rem;
      color: var(--grey);
      margin: 0;
    }

    // Align the last child (button or form) to the bottom of the card
    > :last-child {
      align-self: end;
    }
  }

  form {
    display: grid;
    gap: 0.75rem;
  }

  label {
    display: grid;
    gap: 0.25rem;
  }

  // Flex to align label text and info icon inline
  .field-label {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    font-size: 0.875rem;
    color: var(--grey);
  }

  // Override generic button styles for the inline info icon
  .info-btn {
    anchor-name: --pat-info-btn;
    interest-delay: 0s;
    background: none;
    border: none;
    border-radius: 0;
    color: var(--grey);
    padding: 0;
    cursor: pointer;
    display: grid;
    place-items: center;

    .material-symbols-outlined {
      font-size: 1rem;
    }

    &:hover {
      background: none;
      color: var(--white);
    }
  }

  .pat-tooltip {
    position-anchor: --pat-info-btn;
    position: fixed;
    inset: unset;
    top: anchor(bottom);
    right: anchor(right);
    margin-top: 0.25rem;
    background: var(--dark-grey);
    border: 1px solid var(--grey);
    border-radius: 0.25rem;
    padding: 0.75rem 1rem;
    max-width: 18rem;
    text-align: left;

    // Invisible bridge so hover interest isn't broken by the gap
    &::before {
      content: '';
      position: absolute;
      bottom: 100%;
      left: 0;
      right: 0;
      height: 0.25rem;
    }
  }

  .pat-tooltip-heading {
    font-size: 0.875rem;
    color: var(--white);
    margin: 0 0 0.5rem;

    a {
      color: var(--white);
      text-decoration: underline;
    }
  }

  .pat-permissions {
    margin: 0;
  }

  .pat-permission {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 0.5rem;
    padding: 0.25rem 0;
    font-size: 0.875rem;

    dt {
      color: var(--white);
      font-weight: 600;
    }

    dd {
      margin: 0;
      color: var(--white);
    }
  }

  .pat-note {
    font-size: 0.75rem;
    color: var(--grey);
  }

  input {
    width: 100%;
    padding: 0.5rem 0.75rem;
    background: var(--black);
    border: 1px solid var(--dark-grey);
    border-radius: 0.25rem;
    color: var(--white);
    font-size: 0.875rem;

    &::placeholder {
      color: var(--grey);
    }
  }

  button {
    background: var(--plum);
    border: none;
    border-radius: 0.5rem;
    color: var(--white);
    cursor: pointer;
    font-size: 1rem;
    padding: 0.75rem 1.5rem;
    text-align: center;

    &:hover {
      background: var(--light-plum);
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }

  .error {
    color: var(--light-red);
    font-size: 0.875rem;
  }
</style>
