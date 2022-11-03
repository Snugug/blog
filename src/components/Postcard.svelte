<script>
  export let content;

  const updated = content.updated.getTime() !== content.published.getTime();
  const label = updated ? 'Updated' : 'Published';
</script>

<a href="/musings/{content.slug}" class="card__link">
  <article class="card">
    <h2 class="type--h3 type--a card--title">{content.title}</h2>
    <footer class="card--date" aria-label="{label} on">
      {#if updated}
        <span class="card--updated">U</span>
      {/if}
      {content.updated.toLocaleDateString([], {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
      })}
    </footer>
    <p class="card--content">{content.summary}</p>
  </article>
</a>

<style lang="scss">
  .card {
    align-items: flex-start;
    display: grid;
    grid-column-gap: 0.5rem;
    grid-row-gap: 0.5rem;
    grid-template-columns: 1rem 1fr;
    grid-template-rows: auto 1fr;

    &--title,
    &--content {
      grid-column: 2 / span 1;
      word-break: break-word;
    }

    &--title {
      grid-row: 1;
    }

    &--content {
      grid-row: 2;
    }

    &--date {
      align-self: flex-start;
      color: transparent;
      font-size: 1rem;
      grid-column: 1 / span 1;
      grid-row: 1 / span 2;
      line-height: 1;
      margin-top: 0.35rem;
      -webkit-text-stroke: 1px var(--snow);
      transform: rotate(180deg);
      writing-mode: vertical-lr;
    }

    &--updated {
      -webkit-text-stroke: 1px var(--light-red);
    }

    &__link {
      &:focus-visible .card--title,
      &:hover .card--title {
        box-shadow: inset 0 -1.6em 0 var(--highlight-color);
      }
    }
  }
</style>
