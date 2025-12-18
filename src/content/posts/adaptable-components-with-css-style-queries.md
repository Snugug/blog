---
title: 'Adaptable Components with CSS Style Queries'
published: '2023-04-04'
summary: 'Use CSS Style Queries to let components adapt to more scenarios than just container size or screen width.'
---

I'm in the process of refactoring [ChromeOS.dev](https://chromeos.dev) and using the opportunity to clean up our components and the styling that controls them. The site is designed to be maximally flexible; we don't use standard breakpoints, content areas are sized based on characters to maintain optimal line length, we've implemented flexible typography, and more. Think [intrinsic design](https://aneventapart.com/news/post/designing-intrinsic-layouts-aea-video) as coined by [Jen Simmons](https://front-end.social/@jensimmons). So when I sat down to refactor, [container queries](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Container_Queries) were the obvious choice for maintaining the responsive ideal of our site. I got through one component before I ran into an issue.

On our site, we've got a table of contents component (ToC). In theory, it's a pretty simple component: a list of certain headers on the page that, in one view, is collapsible with a background and in another, expanded without one. You can see examples on a [blog post](https://chromeos.dev/en/posts/grow-your-ideas-in-2023-dev-guidance-and-inspiration-for-delighting-chromeos-users) (_Grow your ideas in 2023: Dev guidance and inspiration for delighting ChromeOS users_) and a [reference page](https://chromeos.dev/en/web/desktop-progressive-web-apps) (_Desktop Progressive Web Apps_). My first thought was that this was a "reverse container query" moment, where the "small view" is for large viewports and the "large view" is for small viewports, except that's not quite true. That's not quite true, in practice.

Our blog post layout and reference page layout are slightly different. One expands to two columns, one to three, and the columns are slightly different sizes. This ultimately means that, if I were to adapt just on component width or screen size, which we have to do today, the ToC winds up breaking in one or the other layout. This isn't ideal.

Previously, the way I'd get around this would be by duplicating CSS; having something, usually a class, I can query off of (like [Modernizr](https://modernizr.com/) style feature detection),attach the media query to that, then duplicate my CSS for each instance. Then, I had a brainstorm.

## Custom view queries with CSS Style Queries

[CSS Style Queries](https://developer.chrome.com/blog/style-queries/) are the cousin to container queries; instead of querying a container's size, they query a specific property/value pair. Right now, they're [only implemented in Chromium browsers](https://caniuse.com/css-container-queries-style) and only for [CSS Custom Properties](https://developer.mozilla.org/en-US/docs/Web/CSS/--*), but that's all you need! With style queries, you can write a layout using normal media queries and set the view you want for a component, like this:

```scss
.layout {
  --toc-view: 'inline';
}

@media (min-width: 789px) {
  .layout {
    --toc-view: 'block';
  }
}
```

And then in your component, you can respond to it like this:

```scss
.toc {
  color: red;
}

// Only apply this styling with the ToC is displayed "inline"
@container style(--toc-view: 'inline') {
  .toc {
    color: blue;
  }
}

// Only apply this styling with the ToC is displayed "block"
@container style(--toc-view: 'block') {
  .toc {
    color: green;
  }
}
```

Voila! You've made a custom view query! You can do this on a per-component basis, like you see here, or, as I'm doing in our refactor, do it for higher-level layout parts (`--extras-inline` and `--subnav-inline`, either `0` or `1`). Now you can have components not only adapt to their size, but where they're used in a given layout!

Just about anywhere where I had a similar pattern of duplicating CSS code based on a media query and "pivot" class can be replaced with this. The next component I'll be tackling with this is our main navigation. There, we set different breakpoints to go from an inline to an offscreen menu based on language. It's the same pattern I had with the ToC: media queries plus a "pivot" selector, and duplicated CSS. Now, I'll still have those, but they'll just change a custom property to signal that the menu should be rearranged! Much easier to maintain.

You can (and should) stack this pattern with other best-practice responsive patterns, like treating this as progressive enhancement, and starting small, and being flexible with the final display; this should be used as a way to expand your design options, not as a way to swim against the [ebb and flow of the web](https://alistapart.com/article/dao/).

---

With this new pattern in my back pocket, I've now got three ways to change how a component looks: based on the viewport, based on its inherent size, and based on where it lives on the site, all without JavaScript, all without duplicating CSS, and all maintained in a component-first way. I'm already excited to use it, and hope you'll find uses for it in your work, too.
