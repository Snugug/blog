---
title: Element Queries
template: _layout.html
published: November 11, 2013
updated: November 11, 2013
summary: >
  When building responsive sites, especially style and component guide driven responsive sites, being able to query an item's width instead of the viewport is invaluable for re-usability. While we don't have them natively, we can emulate them with JavaScript.
---
When building responsive sites, especially style and component guide driven responsive sites, eventually the idea of "why can't we just query our element instead of the viewport" comes up. Sometimes the question is formed as "working around the lack of element queries", sometimes as "media queries are a hack", but no matter how it's phrased, the question always makes the assumption that getting native element queries is a foregone certainty and seem to miss the fundamental issue with element queries: they can't, really, be implemented natively.

Tab Atkins has a [great writeup on the issues of element queries](http://www.xanthir.com/b4PR0). There are circularity issues in both styling declaration (setting `width: 400px` at a `min-width: 450px` for instance) and in needing to get properties of elements based on the content placed inside of it (think `inline` elements, just about any `height` query). Add on top of this the need for your page to be rendered by the browser in order for the proper sizes to be calculated and then, potentially, rerendered again and, potentially, rerendered again, ad nauseam. In fact, the only real solution that Tab and Boris Zbarsky, a hacker for Mozilla, could come up with was, essentially, an `iframe`-like element whose properties (such as `width` and `height`) are treated in the DOM like normal elements (and thus can't be effected by element queries) with elements inside being able to query the width of that element. But that gets really ugly, is likewise slow, and they really only like the solution if it can be detected from the markup. Overall, not particularly good.

That all being said, as I've been working on [Style Prototypes](https://github.com/team-sass/generator-style-prototype), I really wanted element queries for the component guide in order to create truly reusable component guides. Understanding the inherent issues with element queries, I decided I wanted to write a little JavaScript library to try and provide some form of limited element queries like functionality, and so I built [eq.js](https://github.com/snugug/eq.js)

## eq.js

**eq.js** is a tiny little stand-alone JavaScript library (2.26KB minified, 1002B gzipped) that provides element query-like functionality for your projects. Unlike other JavaScript libraries that look to provide similar functionality, **eq.js** doesn't require jQuery or Sizzle to work, making its weight the only added weight to the page, and is designed to be blazing fast, utilizing techniques to reduce layout thrashing and increase perceived render speed such as grouping reads and writes together and firing the reads and writes through `requestAnimationFrame`. The [demo site](http://eqjs.io/) contains the performance benchmark page that was used to test performance, using more than 2,200 nodes, each requiring a query and applying a new set of styling. This benchmark is able to query all of the nodes and apply the correct attribute in ~35ms.

Created with a component guide in mind, it reduces many of the common pitfalls of element queries by reducing what you can query and when it gets queried down to a single item and provides a single interface for working with that query. **eq.js** will only query `min-width` as presented in a single data attribute, will only query it on `unload` and `onresize`, and allows you to access the queried `min-width` through a single attribute. It also provides an interface to allow users to fire a query for any selected nodes, allowing you to trigger queries on an as-needed basis. Usage is fairly easy, simply add a `data-eq-pts` attribute with `key: value` pairs of desired keywords and `min-width` values you'd like to use, each separated by a comma `,`.

```markup
<div class='component' data-eq-pts="small: 400, medium: 600, large: 900">
  <h1>Hello World</h1>
</div>
```

When the correct size is available, a `data-eq-state` attribute will be added to the component with the `key` for the given `min-width`. This makes styling easy:

```scss
.container {
  border: 2px solid red;
  background-color: rgba(red, .25);

  &[data-eq-state="small"] {
    border-color: green;
    background-color: rgba(green .25);
  }

  &[data-eq-state="medium"] {
    border-color: orange;
    background-color: rgba(orange, .25);
  }

  &[data-eq-state="large"] {
    border-color: blue;
    background-color: rgba(blue, .25);
  }
}
```

Installing and using **eq.js** is fairly easy. You can either [download a release](https://github.com/Snugug/eq.js/releases) or install it through [Bower](http://bower.io/)

```markup
bower install eq.js --save
```

When adding **eq.js** to your site, make sure you load it in the `<head>` so that it's ready and available to for when `onload` is available as it directly affects styling on the page.

Hope you enjoy!
