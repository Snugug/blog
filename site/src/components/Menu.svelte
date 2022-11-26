<script>
  let expanded = false;
  let menu;

  let label = 'Open menu';

  /**
   * Toggles whether the menu is expanded or not.
   */
  function toggle() {
    expanded = !expanded;

    if (expanded) {
      label = 'Close menu';
      menu.focus();
    } else {
      label = 'Open menu';
    }

    document.dispatchEvent(
      new CustomEvent('menuOpened', {
        detail: { expanded },
      }),
    );
  }
</script>

<div
  on:keydown={(e) => {
    if (e.key === 'Escape' && expanded) {
      toggle();
    }
  }}
>
  <button
    class="toggle"
    bind:this={menu}
    aria-expanded={expanded}
    aria-label={label}
    on:click|preventDefault={toggle}
  />

  <nav class="menu" aria-expanded={expanded}>
    <ul class="menu--list">
      <li><a href="/" tabindex={expanded ? 0 : -1}>Home</a></li>
      <li><a href="/musings" tabindex={expanded ? 0 : -1}>Posts</a></li>
      <li><a href="/cookbook" tabindex={expanded ? 0 : -1}>Cookbook</a></li>
      <li><a href="/me" tabindex={expanded ? 0 : -1}>About</a></li>
      <li>
        <a href="/presentations" tabindex={expanded ? 0 : -1}>Presentations</a>
      </li>
      <li>
        <a href="/rss.xml" tabindex={expanded ? 0 : -1}>RSS</a>
      </li>
    </ul>
  </nav>
</div>

<style lang="scss">
  @use 'sass:math';

  .menu {
    align-items: center;
    backdrop-filter: blur(2px);
    background: hsla(225, 6%, 13%, 0.75);
    border-bottom: 2px solid var(--snow);
    border-left: 2px solid var(--snow);
    box-shadow: -5px 5px 1em rgba(0, 0, 0, 0.75);
    color: transparent;
    display: flex;
    padding: 0.5rem;
    position: fixed;
    right: 0;
    top: 0;
    transform: translatex(calc(100% + 1em));
    transition: transform 0.3s ease-in-out, color 0.3s ease-in;
    width: calc(100% + 2px);
    z-index: 100;

    @supports (max-width: max-content) {
      max-width: max-content;
      padding-left: 0.75rem;
      padding-right: 2.5rem;
    }

    &[aria-expanded='true'] {
      color: var(--white);
      transform: translateX(-2px);
    }

    &--list {
      column-gap: 1rem;
      display: flex;
      flex-wrap: wrap;
      font-size: 0.8rem;
      max-width: calc(100vw - 3rem);
      row-gap: 0.25rem;
    }
  }

  .toggle {
    // &[aria-expanded='true'] {
    //   transform: translateY(calc(100px - 2rem));
    // }

    // background: black;

    $size: 65%;
    $offset: math.div((100% - $size), 2);
    --color: var(--snow);
    border: 2px solid var(--snow);
    border-radius: 5px;
    cursor: pointer;
    height: 1.5rem;
    position: fixed;
    right: 0.25rem;
    top: 0.25rem;
    width: 1.5rem;
    z-index: 101;

    &::before {
      background-color: var(--snow);
      content: '';
      height: 2px;
      left: $offset;
      position: absolute;
      top: calc(0.75rem + 2px);
      transition: 0.15s;
      width: $size;
    }

    &::after {
      background-color: var(--snow);
      bottom: calc(0.75rem + 2px);
      content: '';
      height: 2px;
      left: $offset;
      position: absolute;
      transition: 0.15s;
      width: $size;
    }

    &[aria-expanded='true'] {
      &::before {
        transform: rotate(135deg) translateY(0.5em) translateX(0.5em);
        // top: 25%;
        // left: calc(70% + 0.5px);
        transform-origin: 100% 100%;
      }

      &::after {
        transform: rotate(45deg) translateY(0.5em) translateX(0.35em)
          scaleX(1.1);
        // top: 25%;
        // left: calc(30% + 0.5px);
        transform-origin: 100% 100%;
      }

      // &::before {
      //   transform: rotate(-45deg) translateY(-5px) translateX(2px) scaleX(0.85);
      //   top: calc(0.75rem + 2.5px);
      //   transform-origin: 100% 100%;
      // }

      // &::after {
      //   transform: rotate(45deg) translateY(5px) translateX(2px) scaleX(1);
      //   bottom: calc(0.75rem + 1.5px);
      //   transform-origin: 100% 100%;
      // }
    }
  }
</style>
