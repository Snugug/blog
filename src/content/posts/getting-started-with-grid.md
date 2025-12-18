---
title: 'Getting Started with Grid'
published: '2017-03-22'
summary: "CSS Grid is out! I've started playing it, here are my first thoughts."
---

[CSS Grid](https://www.w3.org/TR/css3-grid-layout/)! _[It lives](http://caniuse.com/#search=grid)!_ While it may be a _hair_ too early (in my opinion) to start using in production, now's the time to start learning it! [MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Grid_Layout), as always, has great documentation, and much like he did with [flexbox](https://css-tricks.com/snippets/css/a-guide-to-flexbox/) (which is still the only way I'm able to navigate flexbox), [Chris Coyier](https://twitter.com/chriscoyier) has a [fantastic grid guide](https://css-tricks.com/snippets/css/complete-guide-grid/) over on CSS-Tricks. [Jen Simmons](https://twitter.com/jensimmons) has a great set of [Grid learning resources](http://jensimmons.com/post/feb-27-2017/learn-css-grid) compiled for those looking to dive in to the deep end.

I started digging in to it last week, and a funny thing happened happened: for the most part, it clicked! Don't get me wrong, it's an immensely complex spec, and I have no idea how _most_ of it works, but for the stuff I'm likely to use most often? The "make a grid and stick stuff on it" part? That stuff _just clicked_. It felt natural, it reminded me of [Singularity](https://github.com/at-import/Singularity). Flexbox has been out for a while, and I still can't really explain how it works, or get even the most basic of syntax right without referring to CSS-Tricks; for some reason, not so for Grid. So, for those coming from Singularity (or Susy, or Bootstrap, or Foundation, or any of those things), let's see how that knowledge can transfer over to Grid.

The first thing that's going to differ from old float based grid systems is that CSS Grid is not just a 1-dimensional system; items can be positioned and sized in 2 dimensions! That's _awesome_! In more advanced usage, which I think is still being explored (check out Jen Simmons' [Experimental Layout Lab](http://labs.jensimmons.com/) for cool layout ideas with Grid), I believe Grid's 2 dimensions are going to come in _really_ useful and will produce _really_ interesting and innovative layouts on the web. In my mind, the way I've been able to wrangle this (at least initially) is by thinking of Grid as two sets of 1-dimensional systems (let's see if this actually pans out), and thinking about it this way makes thinking in Grid pretty straight forward for me. So, let's dive in!

## Defining a Grid

As far as I can tell, there are roughly an equal number of ways to define a grid as stars in the sky with Grid. While it may seem overwhelming at first (and I still don't quite know all the ways to do it), if coming from something like Singularity, just about every permutation available there is fairly straight forward to do with Grid! The secret sauce to most of this is a brand-new unit, the `fr` unit. For those familiar with Singularity, the `fr` unit is _roughly_ equal to Singularity's magic `1` number, which is "one part of the available remaining free space". In Singularity a grid that's defined `1 3 1` would be a 3 column grid where the first and third columns are 1/3 the width of the 2nd column. With CSS Grid, that'd be `1fr 3fr 1fr`, where the width of `fr` is the total width of free space (minus the grid gap, we'll get to that in a second) divided by 5 (total number of `fr` units). This works _really_ well for asymmetric grids, but it works just as well for symmetric grids. Familiar with Bootstrap? It's a 12 column grid where each column is the same percentage of the container. For repeating sections in a grid, the new `repeat()` function is available! While any grid definition can be repeated, to make a simple 12 column grid, it's `repeat(12, 1fr)`! These new `fr` units can be combined with any of the other units that are already available in CSS to form a grid, so don't worry about just using those! Throw these on `grid-template-columns` to define the columns of a grid, and `grid-template-rows` to define the rows of a grid.

Once we understand how to define a grid (and in CSS Grid, that can be columns _or_ rows), we likely want some space between each column. In Singularity and the like, that was called a "gutter". In Grid, it's called a `grid-gap`. Gaps can be defined with whatever units one would like, but there can only be one gap value for columns and one for rows, there can't be variable gaps between columns or rows. In CSS Grid, gaps are _only_ between columns, so there is no "split gutter" like there was in Singularity (but the `fr` unit plus container padding takes care of that).

Let's put this all together! CSS Grid works by putting the grid styling on a container, and having the items inside it attached to the grid (more on that next). So, let's build a couple of grids!

```scss
.container {
  display: grid; // Magic sauce! The new Grid display!
  grid-template-columns: repeat(
    16,
    1fr
  ); // Defining a 16 column grid where each column is 1/16 of the available space
  grid-gap: 20px; // This is shorthand to define grid-column-gap (gap between columns) and grid-row-gap (gap between rows). Row gap will apply between rows even if a row template isn't defined
}

.layout {
  display: grid;
  grid-template-rows: 100vh 2fr 1fr 50px; // A funky set of rows, maybe for an article with a big lead?
  grid-row-gap: 1em; // Gap between just the rows
}
```

## Putting Stuff on a Grid

Once a grid's defined, how do we place something on it? In Singularity and the like, we used mixins called something along the lines of `span`. Well, now that Grid is out and it's in 2 dimensions, it's not as simple as `span`, we need to tell Grid _what_ we want to span! So, there are two new properties, `grid-column` and `grid-row` that we need to use to span rows or columns. Good news though! Grid has literally introduced `span` to define how many rows or columns to span! So, `grid-column: span 2` (yah, a slightly new syntax where it's `keyword value`) will tell Grid that, for this item, its width should be the width of two columns (the actual width depends on what those two columns are). Same thing for rows; `grid-row: span 3` will have an item that is the height of three rows. Now, the thing that I think made this click for me (and why I'm reminded of Singularity specifically) is that spanning on a grid isn't just about _how many_ columns or rows to span, but _where to start_! To do so, start with what column or row to start spanning at (a unitless number) and then define the span. So `grid-column: 2 / span 3` would span 3 columns, starting at the 2nd column (another slightly new syntax here, with the `/` acting as a separator in `value / value`). Let's put some things on an imaginary grid!

```scss
.item {
  grid-column: 4 / span 2; // Span 2 columns, starting at the 4th column
  grid-row: span 2; // Span 2 rows, regardless of what row .item is in
}

// This places item2 at a specific width, height, horizontal position, and vertical position
.item2 {
  grid-column: 2 / span 3; // Span 3 columns, starting at the 2nd column
  grid-row: 3 / span 2; // Span 2 rows, starting at the 3rd row
}
```

## CSS Grid Frameworks?

After a little bit of playing around with Grid, I'm not really sure if there's a _need_ for CSS Grid based grid frameworks like there were with `float` based grids. The syntax for 70%-80% of the most common tasks I see myself doing with Grid is so straight forward that abstracting it in to a system feels heavier than its worth. I started experimenting with a very light-weight set of Sass helper mixins I'm calling [GRIDdle](https://github.com/at-import/griddle), but I'm not really sure of its worth yet; some of the mixins, for instance, take more effort to write than the actual property (yah, literally _property_) that it spits out.

What I think is going to be much more common in the era of Grid is being able to really, successfully share layouts with each other. This is a much more exciting proposition for me as it's going to allow thinking about how to best display _content_ grow and mature in the same way that thinking about grids as layout tools have. It'll open up a whole set of interoperable layouts in style guides that otherwise would be constrained to the specific environment they live in. I'm hopeful that I'm going to get to use Grid in production soon, and kick the tires on just what responsive, art and content directed layouts look like in the real world, and be able to share that back. I've got some funky ideas to toy with as well, so maybe a "fun with Grid" post is soon to come as well.

In the mean time, go out and play! Grid is here!
