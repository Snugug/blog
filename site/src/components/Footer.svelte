<script>
  import { onMount } from 'svelte';
  import { setup } from '$js/plausible';

  export let link = '/links';

  let footer;

  onMount(async () => {
    /* global plausible */
    setup();

    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        if (window.plausible) {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              plausible('Fully Read');
              observer.unobserve(footer);
            }
          });
        }
      });

      observer.observe(footer);
    }
  });
</script>

<footer bind:this={footer} class="footer">
  <div class="inner">
    <img
      src="/images/me/square.jpg"
      alt="Headshot of Sam"
      class="headshot"
      loading="lazy"
    />
    <h2>
      Sam <br /><span class="aka">aka</span>
      <a class="type--a" href={link}>Snugug</a>
    </h2>
    <p>BBQ lead, ChromeOS DevRel</p>
    <p>Web, design, development, food</p>
  </div>
</footer>

<style lang="scss">
  .footer {
    --base-hue: 171;
    --max-saturation: 20;
    --max-lightness: 25;
    --size: 100;
    --paint-alpha: 0.5;
    background-color: hsl(var(--base-hue), 10%, 20%);
    background-image: paint(triangles);
    box-shadow:
      inset 0 -0.05rem 1rem rgba(0, 0, 0, 0.25),
      inset 0.05em 0 1rem rgba(0, 0, 0, 0.25),
      inset -0.05em 0 1rem rgba(0, 0, 0, 0.25);
    color: var(--snow);
    min-height: 20vh;
    padding: var(--spacing);
    position: relative;
  }

  .inner {
    margin: 0 auto;
    max-width: 30ch;
  }

  .headshot {
    --paint-alpha: 0.25;
    --base-hue: 171;
    --max-saturation: 100;
    --max-lightness: 100;
    --size: 20;
    background-color: hsl(var(--base-hue), 70%, 30%);
    background-image: paint(triangles);
    border-radius: 50%;
    display: block;
    float: left;
    height: 5rem;
    margin-bottom: 1rem;
    margin-right: 1rem;
    padding: 3px;
    width: 5rem;
  }

  h2 {
    text-shadow:
      1px 1px 0 #111,
      2px 2px 0 #111,
      3px 3px 0 #111;
    font-size: 2rem;
    font-weight: 700;
    line-height: 1;
    margin-bottom: 0.5rem;
  }

  p {
    font-size: 0.8rem;
    margin-top: 0.25rem;
  }

  .type--a {
    padding: 0 0.25rem;
  }
</style>
