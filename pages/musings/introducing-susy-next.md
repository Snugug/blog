---
title: Introducing Susy Next
template: '_layout.html'
published: January 29, 2013
updated: January 29, 2013
summary: >
  As of April 3, 2013, [Singularity](http://github.com/at-import/singularity) is no longer being merged with Susy and is still being separately maintained. The original article is kept as a record.
---
## UPDATE 1/04/2014

***At the time of this article's writing, Susy Next was to be the successor to Singularity. As of April 3rd of last year, the previous update, that is no longer the case. The two projects have taken divergent paths and pretty much this entire article is out of date. Both Susy Next and Singularity are being developed separately and both are still active projects.***

## UPDATE 4/03/2013

***While work on Susy Next continues, Scott and I have decided that there is room for Singularity and have restarted development on it, having [released a 1.0](http://snugug.com/musings/singularity-10). As such, right now, my recommendation is to use Singularity 1.0.***

<hr>

This morning, at around 1am EST, the [Susy Next team](http://oddbird.net/2013/01/01/susy-next/) released the first alpha of of Susy Next. As [Eric says](http://oddbird.net/2013/01/29/susy-next-alpha-1/), this release is very sparse with really only the math engine in place; no user facing sugar, no tutorials, some functions uncommented, no documentation, nothing. The closest you'll get to a walkthrough of the power of what Susy Next can do is by taking a look at the code in the [test](https://github.com/ericam/susy/tree/susy-next/test) folder of the [Susy Next](https://github.com/ericam/susy/tree/susy-next) branch. To install it, type the following into your command line (you may need to <code>sudo</code> it)

<pre><code class="language-bash">gem install susy --pre</code></pre>

We've released it in this state for a few reasons, but the biggest one is to get it into the hands of our users and have them rip it apart. Please, do! We want Susy Next to be the most flexible, user friendly, awesome grid system not only available for Sass, but any grid system. The goal of Susy Next is to provide the math and the logic for you to build the grids you want and you need, but in order to do that, we need your feedback. The things we'd like the most feedback on are the `add-grid` and `add-gutter` syntaxes, and the `span` syntax that you can see on [line 39 of `test/scss/math.scss`](https://github.com/ericam/susy/blob/susy-next/test/scss/math.scss). Line 39 and line 43 produce the same results. We encourage you to play, break, have fun, and post your thoughts to the [Susy Issue Queue](https://github.com/ericam/susy/issues?state=open) and tag them with the *Susy Next* tag.

Susy Next is a big leap forward for Susy. We have introduced asymmetric grids to the mix, integrated [Breakpoint](http://breakpoint-sass.com/) for media queries and no-query fallbacks, and are introducing a new natural language syntax to the mix to make working with Susy more semantic and user friendly (don't worry, if you like the good old fashioned quick and dirty direct method, that's still available). We're also developing Susy Next with extensibility in mind, setting the stage for a full output API for different output methods (it ships with both [Float and Isolation](http://snugug.com/musings/on-responsive-designs-dirty-little-secret) methods), which you can take a look at in both [<pre><code>_api.scss</code></pre>](https://github.com/ericam/susy/blob/susy-next/sass/susy/_api.scss) and [the <code>api</code>](https://github.com/ericam/susy/tree/susy-next/sass/susy/api) folders. We also encourage the community to go and build extensions they find useful, like a way to write class classes based on your grid, or Flexbox support, or [off-canvas](http://oddbird.net/2012/11/27/susy-off-canvas/) plugins; anything you can think of! Expect to hear more on Susy Next plugins in the coming weeks and months.

### What Does This Mean For Singularity

I've got some good news and I've got some bad news. Bad news first; now that we've got a working stable version of the Susy Next math engine, development has more or less totally stopped on Singularity and soon Scott and I will probably deprecate Singularity in the coming weeks. This means that no new development will happen on Singularity, although there may be crossports from Susy Next. The good news? Susy Next has 100% API compatibility with Singularity. Your grid and gutter definitions, as well as media queries and no-query fallbacks, your grid-spans and gutter-spans, they all work and all have the same API. We've simplified some of it, and we've dropped Padding support for the time being, so some of the additional parameter you've passed in if you're doing really advanced things aren't available, class output isn't built (but you can build it as a Susy Next plugin!), and lit/rtl and desktop-first development isn't finished yet on the current build of Susy Next (it's coming), but other than that, you shouldn't really need to change anything! So fear not loyal Singularity fan! While the name may be going away, the heart stays.
