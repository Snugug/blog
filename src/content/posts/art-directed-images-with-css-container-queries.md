---
title: 'Art Directed Images with CSS Container Queries'
published: '2023-01-06'
summary: 'How to art direct images with container queries, no JavaScript required.'
---

I've just started a refactor of some code for ChromeOS.dev and I'm starting with a tricky component that I'm looking to refactor into using [container queries](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Container_Queries). This component has a `<picture>` element in it that uses media queries for art direction. Works great now, but part of this refactor is going from 3 separate components that all basically do the same thing to one single, container query based one, so that media query needs to go. So I started digging in.

I found Sara Soueidan's wonderful [Component-level art direction with CSS Container Queries](https://www.sarasoueidan.com/blog/component-level-art-direction-with-container-queries-and-picture/) post which mentions this, but sadly doesn't have an answer other than bumping the images to CSS. Ten I came across the [`srcset` and `sizes` interaction with container queries](https://github.com/w3c/csswg-drafts/issues/5889) issue from Una in the CSS Working Group drafts. Reading through that article, it got me thinking, and I think I've got a workable, if lightly bad for above-the-fold performance solution that requires 0 JavaScript.

Thanks to wonderful work by Tim Kadlec, we've known since 2012 that [`display: none` images still get downloaded by browsers](https://timkadlec.com/2012/04/media-query-asset-downloading-results/). This is because browsers try and eagerly download images before styling and layout has occurred to improve loading performance. But, something we didn't have then, but we do have now, is built-in support for lazy loading via `loading="lazy"` attribute on images.

I put together a [quick CodePen proof of concept](https://codepen.io/Snugug/pen/VwBmqQQ) based on comments in the CSSWG issue and, sure enough,in Chrome anyway, a lazy loaded image won't download if display is `none`. And just like that, a solution emerged.

Now, the reason this isn't great for performance is it will delay image loading, so [largest contentful paint](https://web.dev/lcp/) may suffer, so `<picture>` elements are probably better most of the time. That said, if you need container based image art direction, here's how you do it:

1. Add `loading="lazy"` to lazy load the desired images, one image per "art direction"
2. `display: none` the images that need to be art directed
3. Use container queries to undo `display: none` (with `block` for instance).

That's it! No JavaScript,only a couple of straightforward lines of CSS. Here's the example from the CodePen:

```scss
// Hide the image tags
img {
  display: none;
}

// Set the container to track inline size
.container {
  container-type: inline-size;
  width: 100%;
}

// Make the first image block initially, then none at the desired width
.pic-1 {
  display: block;

  @container (min-width: 700px) {
    display: none;
  }
}

// Make the second image block at the desired width
.pic-2 {
  @container (min-width: 700px) {
    display: initial;
  }
}
```

Something to consider if you're looking to give this a go in production:

- Small examples will probably seem to work fine, but do test if you're using this a lot
- After talking this out with Una, she recommends adding a placeholder in to help prevent layout shift. You can probably accomplish something similar using a trick similar to what Sara mentions in her post; wrap your images in a parent with an [`aspect-ratio`](https://developer.mozilla.org/en-US/docs/Web/CSS/aspect-ratio) that can change based on what image is being pulled in (so more container queries)

That's it! Go have fun with it!
