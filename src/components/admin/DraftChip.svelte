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
  // Visually sized closer to the subtitle than the main label text
  .chip {
    font-size: 0.75rem;
    font-weight: 600;
    padding: 0 0.25rem;
    border-radius: 3px;
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
