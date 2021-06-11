---
title: A Modern Take on Cutting the Mustard
date: 2018-07-29
summary: >
  By taking advantage of JavaScript module support, we can update the Cutting the Mustard progressive enhancement technique to allow for modern JavaScript syntaxes and features!
---

One of the easiest ways to [progressively enhance](https://alistapart.com/article/understandingprogressiveenhancement) your web experience is the [Cutting the Mustard](http://responsivenews.co.uk/post/18948466399/cutting-the-mustard) technique. The essence of Cutting the Mustard is:

1. Provide an accessible base-line experience for everyone using semantic HTML and CSS
2. Write a test for a minimum subset of JavaScript functionality to support.
   - If the test _passes_, enhance the experience with modern JavaScript
   - If the test _fails_, enhance enhance the experience with older JavaScript (and usually a subset of the modern JavaScript's functionality)

The original test was developed by the BBC team to distinguish between HTML5 browsers and non-HTML5 browsers. That test was fairly straight forward:

```js
if ('querySelector' in document && 'localStorage' in window && 'addEventListener' in window) {
  // Enhance for HTML5 browsers
}
```

This works really well! The enhancements being looked for are all functions that hang off of `document` or `window` and can looked for using checks, so we use these tests even in browsers that don't support that functionality! Our progressive enhancement life is wonderful!

## Enter ES2015+

Starting with ES2015, or ES6, new JavaScript functionality started to be added that couldn't be tested for by checking if a property exists; it introduced some actual new JavaScript syntax, like `const`, `let`, arrow functions, and classes. The problem we now face wanting to test for support of these new syntaxes is that we can't even _write_ the new syntax and deliver it to browsers that don't support it without errors! This is because, unlike HTML and CSS which can gracefully ignore unsupported syntax, JavaScript can't! How, then, can we Cut the Mustard in a way that won't cause errors in unsupported browsers without compiling or transpiling our modern JavaScript syntax?

**JavaScript Modules to the Rescue**

## Using Modules to Cut the Mustard

Let's get straight to the code, then we'll explain it:

```markup
<script type="module" src="./mustard.js"></script>
<script nomodule src="./no-mustard.js"></script>

<!-- Can be done inline too -->

<script type="module">
  import mustard from './mustard.js';
</script>

<script nomodule type="text/javascript">
  console.log('No Mustard!');
</script>
```

When JavaScript modules were introduced, two new bits of HTML syntax were introduced that make this all possible: `type="module"` for `<script>` tags, and the `nomodule` attribute.

In all browsers that [support JavaScript module via `script` tags](https://caniuse.com/#feat=es6-module), `<script type="module">` will be interpreted as a JavaScript module and loaded and run as expected, but for browsers that don't recognize that type, it'll just be ignored because it's unknown HTML syntax! Easy Peasy! Mustard, cut.

We can also "test" for the opposite by including the `nomodule` attribute. In all browsers that support `type="module"` (except Safari 10.1 and iOS Safari 10.3), adding the `nomodule` attribute to out `<script>` tags will have that JavaScdipt ignored in module-supporting browsers while it'll load and run as expected in all other browsers! While it's not _absolutely perfect_ coverage (less than 1% of browsers globally will fall in to this category at the time of this writing), it's likely good enough for most production work.

## What's Our New Baseline

Using JavaScript modules as our new baseline gives us a [great modern baseline](https://caniuse.com/#compare=edge+16,firefox+60,chrome+61,safari+10.1,opera+48,ios_saf+10.3,and_chr+67,and_ff+60) of HTML, CSS, and JavaScript functionality that we can just _know_ is available to us. Some JavaScript highlights from this list are:

- [`const`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/const) and partial [`let`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/let) support
- [Promises](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise) and [async functions](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function)
- [`fetch`](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)
- [Arrow functions](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Arrow_functions)
- [Rest parameters](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/rest_parameters)
- [Classes](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes)
- [Template Literals](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals)
- [Generators](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Generator)
- And, of course, [JavaScript Modules](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import)

That's quite a bit of new syntax we get _out of the box_ by setting our baseline to JavaScript modules. This is, of course, in addition to everything we can test for and use that's _not_ based on new syntax, like Service Workers and Intersection Observers. We can even do it on a feature-by-feature basis:

```js
if ('IntersectionObserver' in window) {
  // Intersection Observers, GO!
}
```

With the power of JavaScript modules as a modern Cutting the Mustard technique, we have a modern JavaScript baseline we can code to. Combined with our tried-and-true progressive enhancement feature testing, it may finally be time to put down our compilers and transpilers and start delivering cutting-edge JavaScript straight from editor to browser.
