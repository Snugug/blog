<script>
  import Twitter from '$lib/tweetback/twitter';
  import md from 'chromeos-dev-markdown';
  import Heart from '$components/icons/fontawesome/heart.svg?raw';
  import Retweet from '$components/icons/fontawesome/retweet.svg?raw';
  import Link from '$components/icons/fontawesome/link.svg?raw';
  export let tweet = {};
  export let showReplies = false;
  export let wrapper = 'div';
  const published =
    tweet.date.toLocaleDateString('en-US') +
    ' - ' +
    tweet.date.toLocaleTimeString('en-US');
  const media = tweet?.media.filter((m) => m.type !== 'link');
  console.log(tweet);
</script>

<svelte:element this={wrapper} class="wrapper">
  <div class="tweet">
    <div class="type">
      {@html md.render(tweet?.text)}
    </div>

    {#if media.length}
      <ul class="media">
        {#each media as m}
          <li class="media--item">
            <a href={m.url}
              >{#if m.type === 'image'}
                <img
                  class="media--image"
                  src={m.url}
                  alt={m.alt}
                  loading="lazy"
                />
              {/if}</a
            >
          </li>
        {/each}
      </ul>
    {/if}

    <footer>
      <time datetime={published}>
        {published}
      </time>
      <ul class="meta">
        <li class="meta--item">
          <a href="/archive/twitter/{tweet?.id}" title="Permalink"
            ><span class="meta--icon">{@html Link}</span></a
          >
        </li>
        <li class="meta--item">
          <span class="meta--icon" aria-label="Retweets">{@html Retweet}</span>
          {tweet?.shares || 0}
        </li>
        <li class="meta--item">
          <span class="meta--icon" aria-label="Favorites">{@html Heart}</span>
          {tweet?.favorites || 0}
        </li>
      </ul>
    </footer>
  </div>
  {#if showReplies}
    {#await Twitter.getReplies(tweet.id) then replies}
      {#if replies.length}
        <ol class="replies">
          {#each replies as reply}
            <svelte:self tweet={reply} {showReplies} wrapper="li" />
          {/each}
        </ol>
      {/if}
    {/await}
  {/if}
</svelte:element>

<style lang="scss">
  .replies {
    border-left: 1px solid var(--grey);
    margin-left: 1rem;
  }

  .tweet-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .wrapper {
    --highlight-color: var(--dark-grey);
    max-width: 50ch;
    width: 100%;
  }

  .tweet {
    border-bottom: 1px solid var(--grey);
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding: 0.5rem;
  }

  footer {
    color: var(--grey);
    display: flex;
    font-size: 0.8rem;
    gap: 1rem;
  }

  .meta {
    display: flex;
    gap: 1rem;

    &--item {
      display: grid;
      gap: 0.5rem;
      grid-template-columns: 1rem 1fr;
    }

    &--icon :global(svg) {
      fill: var(--grey);
    }
  }

  .media {
    display: grid;
    gap: 1rem;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));

    &--item {
      align-items: center;
      display: flex;
      justify-content: center;
    }

    &--image {
      max-height: 50vh;
    }
  }
</style>
