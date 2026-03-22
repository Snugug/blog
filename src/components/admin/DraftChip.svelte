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
  {variant === 'draft' ? 'draft' : 'outdated'}
</span>

<style lang="scss">
  // Visually sized closer to the subtitle than the main label text —
  // exempt from font size scale and .25rem padding-block rule per CLAUDE.md
  .chip {
    font-size: 0.6rem;
    font-weight: normal;
    text-transform: lowercase;
    padding-inline: 0.25rem;
    padding-block: 0.15rem;
    border-radius: 5rem;
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
