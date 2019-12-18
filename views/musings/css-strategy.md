---
title: CSS Strategy
date: 2014-17-01
original: 2013-07-28
summary: >
  My current thoughts on this subject have been codified in [North](https://github.com/snugug/north).
---

## UPDATE 1/17/2014

**_My current thoughts on this subject have been codified in [North](https://github.com/snugug/north)._**

Part of what I do at work is creating and maintaining our front-end standards, and this includes a CSS strategy. The first, and if you know any of my work most obvious, part of this strategy is the use of Sass for CSS Preprocessing. Sass adds so much for large scale maintainability that this is really a no-brainer. That's the how, but what about the what? What are we going to be writing with our CSS Preprocessor? What's our class naming strategy? This has been bugging me a lot. Right now, there are three prevailing thoughts on CSS strategy: [SMACSS](https://smacss.com/), [OOCSS](http://oocss.org/), and [BEM](http://bem.info/). I dislike all of them. I find that SMACSS is too loose of a convention (that at times contradicts its own advice) to work at scale with a large distributed team. OOCSS stores all of its styling knowledge in the HTML instead of the CSS where it belongs, and is also pretty loose in its naming conventions. BEM's conventions work against how CSS natively parses and frankly destroys the cascade, the one thing that CSS is excellent at. While I may not like SMACSS's `.pod .pod-body.is-active`, I absolutely despise BEM's `.slider__figure--is-active`. None of the current strategies really seem to cover architecture (the core pieces that make up your styling, think framework) and implementation (the details of a single site).

It's not all fire and brimstone, though. I like that both SMACSS and OOCSS emphasize thinking in reusable patterns and that BEM has a visual way of easily distinguishing between different conceptual pieces that go into styling. I'm also a fan of SMACSS's recommendation to use a style guide, although it really doesn't go into that much which disappoints me. That being said, pretty much all of these CSS strategies are built for writing vanilla CSS, none really utilize the power that CSS Preprocessors have to offer.

As it turns out, a bunch of my really smart friends, including [Dale Sande](https://twitter.com/anotheruiguy), [Scott Kellum](https://twitter.com/scottkellum), [Mason Wendell](https://twitter.com/codingdesigner), and [Rob Wierzbowski](https://twitter.com/robwierzbowski), have similar gripes about these existing strategies. We've decided to [work together](https://github.com/team-sass/sucks) to try and create a new CSS strategy that hopefully will solve the issues we have with those that currently exist. While it's in the _very_ early stages (we started working on this Friday, it will be a long journey), I firmly believe that we will get the best results if we can get some feedback on it while we work on it. I'm especially interested in where people have pain points with the existing strategies and, where possible, what their solutions are.

## Current Thoughts

I've spent the past couple of days thinking about what I like and what I dislike about these strategies, and what I'd like to see in a strategy. The following is what I'm looking to cover in this new strategy:

- Variable, Mixin, and Extendable Classes
- Style Guides
  - Element Guides
  - Component Guides
- CSS Naming Conventions
- Separation of architecture vs implementation

I'd also like to stick to the following design philosophy:

<blockquote cite="http://www.brainyquote.com/quotes/quotes/a/antoinedes121910.html#GeAxVqpIyzdqELch.99"><p>A designer knows he has achieved perfection not when there is nothing left to add, but when there is nothing left to take away.</p><b>Antoine de Saint-Exupery</b></blockquote>

I firmly believe that being as concise as possible when choosing significant properties should be a priority, as should designing for extensibility and reusability. To me, it's one of the places where BEM falls down the hardest; it's replaced selector specificity with selector naming specificity. To me, this is one of OOCSS's strengths; being able to create modules, submodules, and skins that are decoupled enough that they have proper semantic meaning standing alone.

I've got some of the more high-level pieces figured out already I think. For me, the separation of architecture and implementation, and the creating of a reusable Style Guide have been fairly well encompassed in [Style Prototypes](https://github.com/Team-Sass/generator-style-prototype). I also think that we can leverage preprocessing for mixins and extendables for properties that get shared across multiple pieces. [Toolkit's Contributing Guide](https://github.com/Team-Sass/toolkit/blob/1.x.x/CONTRIBUTING.md) does a fairly good job at breaking down how that would work, with good examples being [Intrinsic Ratios](https://github.com/Team-Sass/toolkit/blob/1.x.x/compass/stylesheets/toolkit/_intrinsic-ratio.scss) and [Clearfix](https://github.com/Team-Sass/toolkit/blob/1.x.x/compass/stylesheets/toolkit/_clearfix.scss). These mixins are designed to be either extended or write properties directly and are written in such a way as to make implementation easy. Mixins and extendables like this would be part of the Style Guide.

Naming conventions and strategy are the big thing that I'm still working through. I will fully admit, I haven't implemented what I'm about to propose yet, but rather is based on my experiences. I prefer semantic naming of classes, describing their purpose, to functional naming (maybe highlighted instead of border-red). This way, the same semantics can be used to produce varied results. Either way, it's all subject to change, but this is what I've got:

### Bases

These are the variables, mixins, and extendables that power your Style/Component guides. They are core patterns that are shared by multiple components/objects/nuances.

### Components

These are classes, without prefix, to be used as styling anchor points (and, of course, can include styling in and of themselves). Components will probably be equally used inside of Style/Component guides and in individual implementations. They are similar to blocks in BEM and modules in SMACSS and OOCSS.

```scss
.component {
}
```

### Objects

These are classes, prefixed with an underscore, to be used to style individual pieces that could be used to make up a component. Objects will mostly be used in Style/Component guides, with individual changes happening inside of implementations, probably using a Component as an anchor for a change. They are similar to elements in BEM and sub-modules in SMACSS.

```scss
_object {
}
```

### Nuances

These are classes, prefixed with a dash, to be used to alter the appearance of a component or object. They are similar to modifiers in BEM, themes/states in SMACSS, and skins in OOCSS.

```scss
.-nuance {
}
```

### Grids and Layout

When building grids and layouts, I prefer to use semantic grid frameworks like [Singularity](https://github.com/Team-Sass/Singularity/wiki) as well as asymmetric grids. These do not lend themselves well to grid classes, nor would I really want them to. I find grid classes make maintaining your layouts hard. I haven't quite figured out exactly where I would prefer to put them, but my initial feeling is that they are implementation specific and would be defined inside of an implementation. They would pivot off of components or objects, but not entirely sure yet.

Here's a CodePen of [how this would all work](http://codepen.io/Snugug/pen/mfKvo) as proposed right now.

Anyway, with all of this, feedback more than welcome.
