<script>
  import Next from '$components/icons/fontawesome/chevron-right.svg?raw';
  import Previous from '$components/icons/fontawesome/chevron-left.svg?raw';

  export let page;
  export let total;
  export let home;
  export let prefix;

  const previous = Number(page) - 1 > 0 ? Number(page) - 1 : null;
  const next = Number(page) + 1 <= Number(total) ? Number(page) + 1 : null;

  console.log('----');
  console.log(previous);
  console.log(next);
  console.log('----');
</script>

<div class="nav">
  {#if previous}
    <a
      class="nav--previous"
      href="/archive/twitter/{prefix}-{previous}"
      title="Previous page"
    >
      <span class="icon">{@html Previous}</span>
    </a>
  {:else}
    <a
      class="nav--previous"
      href="/archive/twitter/{home}"
      title="Previous page"
    >
      <span class="icon">{@html Previous}</span>
    </a>
  {/if}
  <span class="nav--page">{Number(page)} / {total}</span>
  {#if next}
    <a
      class="nav--next"
      href="/archive/twitter/{prefix}-{next}"
      title="Next page"
    >
      <span class="icon">{@html Next}</span>
    </a>
  {/if}
</div>

<style lang="scss">
  .nav {
    display: grid;
    gap: 0.5rem;
    grid-template-columns: 1rem auto 1rem;

    &--next,
    &--previous,
    &--page {
      grid-row: 1;
    }

    &--previous {
      grid-column: 1;
    }

    &--page {
      color: var(--grey);
      font-size: 0.8rem;
      grid-column: 2;
      text-align: center;
    }

    &--next {
      grid-column: 3;
    }
  }

  .icon :global(svg) {
    fill: var(--grey);
    height: 1rem;
    width: 1rem;
  }
</style>
