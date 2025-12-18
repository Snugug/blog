<script>
  export let content;
</script>

<a href="/cookbook/{content.slug}" class="card__link">
  <article class="card">
    <img
      src="{content.image}?h=343&w=610&fit=crop&auto=format"
      alt={content.title}
      class="card--image"
      loading="lazy"
    />
    <h2 class="type--h3 type--a card--title">{content.title}</h2>
    <footer class="card--date">
      {content.published.toLocaleDateString([], {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
      })}
    </footer>
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
    height: 100%;

    &--title {
      align-self: flex-end;
      grid-column: 2 / span 1;
      grid-row: 2;
      word-break: break-word;
    }

    &--image {
      grid-row: 1;
      // border-radius: 5px .5rem 0 0;
    }

    &--date {
      align-self: flex-start;
      color: transparent;
      font-size: 1rem;
      grid-column: 1 / span 1;
      grid-row: 1 / span 2;
      line-height: 1;
      -webkit-text-stroke: 1px var(--snow);
      transform: rotate(180deg);
      writing-mode: vertical-lr;
    }

    &__link {
      &:focus-visible .card--title,
      &:hover .card--title {
        box-shadow: inset 0 -1.6em 0 var(--highlight-color);
      }
    }
  }
</style>
