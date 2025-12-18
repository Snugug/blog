---
title: 'Bulletproof Combo Fixed and Fluid Grids with CSS3 Calc'
published: '2014-01-17'
summary: 'CSS3 Calc can be used to do all sorts of neat things, including creating some fantastic advanced responsive grids. Oh yah, and a new Singularity output style to support it.'
---

You wanna see something cool?

@[vimeo](https://vimeo.com/84435424) {data-aspect-ratio=500x89}

Did you catch that? If not, take a good look at the red and green columns. Notice something different about them? How about something a bit more practical.

@[vimeo](https://vimeo.com/84435488) {data-aspect-ratio=500x89}

See it there? Are you excited yet, because I know I am!

Yesterday morning I had a bit of a brainstorm. Working on a new project, I was asked by a designer who didn't have any responsive web design experience if he could have a fixed width sidebar and a fluid, flexible column to fill the rest of the space. I told him he'd need to wait until [flexbox](http://www.w3.org/TR/css3-flexbox/) in order to have it; he didn't understand what that meant. I though in the back of my mind "well, maybe with [calc](http://www.w3.org/TR/css3-values/#calc) you could pull something off", but I let that though go quickly because, well, it was stupid. Oh but how the unconscious works! I was awoken yesterday morning at 5am to my brain yelling at me "SAM! YOU'VE ALREADY DONE ALL OF THE MATH! JUST PRINT IT OUT AS A STRING!" To which, I replied "Brain, shut up. It's too early to mess with calc for the first time." My brain didn't listen. After taking a quick trip to [Can I Use](http://caniuse.com/calc), I was amazed by the fact that, for the most part (and certainly for this project's support level), not only could I reliably use `calc`, but I could use it unprefixed! After reading that, my brain wouldn't let me go back to sleep.

In order to get the calculations right, I had to do a bit of math. I like math, but this was annoying math because the only way I'm able to check the results is by rendering everything in browser; no way to check my work as I went. With a bit of work, I came up with the following (somewhat) simple formula for determining the width of a single fluid item in a mixed fixed/fluid column pattern:

```bash
((100% - (sum of fixed widths + sum of gutter widths)) / (sum of fluid width)) * (fluid column width)
```

It's fairly straight forward; take the whole width, subtract the fixed parts, divide into equal sized columns, multiply by column width. Sure, fair enough. But then, what happens if you want to span multiple fluid columns? Well you get a formula that looks something like this:

```bash
(((100% - (sum of fixed widths + sum of gutter widths)) / (sum of fluid width)) * (fluid column width) + (gutter width)) + (((100% - (sum of fixed widths + sum of column widths)) / (sum of fluid width)) * (fluid column width))
```

Fair enough, math, it's complex. Did I mention yet that that's the _string_ that needs to get printed out? What about a mixture of fixed and fluid columns?

```bash
(((100% - (sum of fixed widths + sum of gutter widths)) / (sum of fluid width)) * (fluid column width) + (gutter width)) + (fixed width + gutter width) + (((100% - (sum of fixed widths + sum of column widths)) / (sum of fluid width)) * (fluid column width))
```

Okay, that's getting unwieldy. But it's not over! We want to be able to use [isolation](https://github.com/Team-Sass/Singularity/wiki/Output-Styles#isolation) output's source order independent ordering, so we need to calculate margins too! Simple enough, the width of each column preceding the one we're on plus a gutter a piece, but remember the formula for fluid width items! To give you an idea of what that'd look like (and it's calculated width), here's the margin property for the blue item in the first video (the initial `0.5em` is because we're using [split gutters](https://github.com/Team-Sass/Singularity/wiki/Creating-Grids#split-gutters)).

```scss
.third {
  width: calc((((100% - (520px + 5em)) / (4))) * 2);
  margin-left: calc(
    0.5em + (320px + 1em) + (((100% - (520px + 5em)) / (4)) * 1 + 1em)
  );
}
```

Yah, long story short, this is stupid and you shouldn't ever use this method; at least not without a CSS Preprocessor

## Enter Sass

I love [Singularity](https://github.com/Team-Sass/Singularity/) and I'm really proud of 1.2.0's output plugin system. Scott and I have always envisioned Singularity as a base API for working with grids, something that can be extended in ways unimaginable. So, I decided to write an Output Plugin for Singularity called `calc`. Because we're not ready to support it fully yet, it's living in [Singularity Extras](https://github.com/Team-Sass/Singularity-extras) now as of version 1.0.0.alpha.1. Using it is easy, just download (either add that version to your Gemfile, or [download the files directly to your project](https://github.com/Team-Sass/Singularity-extras/releases/tag/1.0.0.alpha.1)) and import `singularity-extras/outputs`. Then, you're ready to use!

`calc` grids are some restrictions placed on them that `float` and `isolation` grids don't. First, they must be asymmetric grids, meaning you must define the width of each column. You can mix any units you want as long as they are compatible with `calc` (as of this writing, for instance, `rem` units aren't for some reason). If you want to define parts of the remaining fluid area, you do so with unit less numbers just like you would when normally using Singularity. The other change is that `calc` grids only work with fixed width gutters (gutters with defined units, including `%` if you so choose) as the alternative would be having the gutter widths being defined by the remaining fluid area, which is quite hard to grok and doesn't make much sense to me. Mix units all you want, `calc` will take care of it (at least in all of my tests). Otherwise, `calc` behaves more or less identical to `isolation`. To give you an idea of what this looks like, here's the grid definition for the first video:

```scss
@import 'breakpoint';
@import 'singularitygs';
@import 'singularity-extras/outputs';

@include add-grid(320px 1 2 200px 1);
@include add-gutter(1em);
@include add-gutter-style('split');
@include sgs-change('output', 'calc');
```

Here's the HTML and the Sass for the second video:

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Test</title>
    <link rel="stylesheet" href="css/test.css" />
  </head>
  <body>
    <div class="main"></div>
    <div class="primary-sidebar"></div>
    <div class="secondary-sidebar"></div>
  </body>
</html>
```

```scss
@import 'breakpoint';
@import 'singularitygs';
@import 'singularity-extras/generators/ratio';
@import 'singularity-extras/generators/snap';
@import 'singularity-extras/outputs';

@include add-grid(400px 1 300px);
@include add-gutter(1em);
@include sgs-change('output', 'calc');

.main {
  background: red;
  @include grid-span(1, 2);
}

.primary-sidebar {
  background: green;
  @include grid-span(1, 1);
}

.secondary-sidebar {
  background: blue;
  @include grid-span(1, 3);
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  padding: 0;
}

div {
  height: 100vh;
  margin: 0;
  padding: 0;
}
```

I hope you enjoy doing some awesome and crazy things with this. Enjoy!
