<script lang="ts">
  /**
   * A small colored badge for indicating draft or outdated status in the sidebar.
   */
  interface Props {
    // The chip variant — "draft" is yellow, "outdated" is red
    variant: 'draft' | 'outdated';
  }

  let { variant }: Props = $props();
</script>

<span
  class="chip"
  class:chip--draft={variant === 'draft'}
  class:chip--outdated={variant === 'outdated'}
>
  {variant === 'draft' ? 'DRAFT' : 'OUTDATED'}
</span>

<style lang="scss">
  .chip {
    font-size: 0.75rem;
    font-weight: 700;
    padding: 0.25rem 0.5rem;
    border-radius: 1rem;
    text-transform: uppercase;
    letter-spacing: 0.025em;
    line-height: 1;
    white-space: nowrap;
  }

  .chip--draft {
    background: var(--gold);
    color: var(--black);
  }

  .chip--outdated {
    background: var(--light-red);
    color: var(--white);
  }
</style>
