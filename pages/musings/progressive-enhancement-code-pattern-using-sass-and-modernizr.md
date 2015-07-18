---
title: Progressive Enhancement Code Pattern Using Sass and Modernizr
template: '_layout.html'
published: June 25, 2012
updated: June 25, 2012
summary: >
  Designing your websites in a [progressive way](http://en.wikipedia.org/wiki/Progressive_enhancement) is one of the best and easiest ways to ensure that a user coming to your site, no matter the way they access it, is going to be able to use your website.
---
Designing your websites in a [progressive way](http://en.wikipedia.org/wiki/Progressive_enhancement) is one of the best and easiest ways to ensure that a user coming to your site, no matter the way they access it, is going to be able to use your website. It's essential for everything on the web from accessibility to responsive web design, and doing it properly, *id est* through feature detection with JavaScript and CSS enhancements instead of through [browser detection](http://css-tricks.com/browser-detection-is-bad/) and UA targeted source files, will not only save you maintenance headaches when future devices come out, but may [save you some embarrassment as well](http://wtfmobileweb.com/). Enter my two favorite Front End tools: [Sass](http://sass-lang.com)+[Compass](http://compass-style.org) and [Modernizr](http://modernizr.com/).

Sass is a CSS Preprocessing language and Compass is a kickass framework built on top of it. Modernizr is modern feature detection. Both rock, and here's a simple Progressive Enhancement code pattern I've been using leveraging Modernizr's CSS class hooks and Sass nesting.

```scss
////////////////////////
// Sass Input
////////////////////////
.foo {
  /* Properties shared between detected features go here. */
  .feature & {
    /* Custom properties if the feature is present. */
  }
  .no-feature &,
  .no-js & {
    /* Default properties if the feature is not present, or JavaScript is disabled and therefore Modernizr didn't fire. */
  }
}
```

```scss
/*************
CSS Output
**************/
.foo {
  /* Properties shared between detected features go here. */
}
.feature .foo {
  /* Custom properties if the feature is present. */
}

.no-feature .foo, .no-js .foo {
  /* Default properties if the feature is not present, or JavaScript is disabled and therefore Modernizr didn't fire. */
}
```

What I'm doing in this pattern is defining properties directly underneath `.foo` that should be applied regardless of if the feature I'm looking for is available (anything from box model to design), then I'm nesting the Modernizr feature detection parent selectors underneath, allowing me to see both my feature-present (`.feature &`) and feature-absent (`.no-feature &`) styling in line, making future maintenance easier by leaps and bounds. I include the `.no-js &` as a comma-separated addition to the feature-absent both because there are some users with JavaScript disabled (and seeing as how Modernizr is a JavaScript based solution, it then won't fire), and because [all of your users are non-JS while they're downloading your JS](http://twitter.com/zeldman/status/215088145971159042). Neat, but what about in practice? Let's throw Compass into the mix and reinvent the replace-text wheel.

```scss
// Compass Image Sprites for our PNGs
@import 'social/*.png';

// Twitter Class!
.twitter {
  // Put the height/width of the image in
  height: image-height('social/twitter.png');
  width: image-width('social/twitter.png');
  // Hide text. Use squish-text() if the element is inline
  @include hide-text();
  // No repeating backgrounds, please.
  background-repeat: no-repeat;
  // SVG
  .svg & {
    // Inline the SVG so that advanced browsers and future tech doesn't need the extra HTTP requests for the SVG
    background-image: inline-image('social/twitter.svg');
    // Background size only needed if the SVG is larger than the PNG. 
    background-size: image-width('social/twitter.png') image-height('social/twitter.png');
  }
  // Default
  .no-svg &,
  .no-js & {
    // Call the Sprite'd image's position.
    @include social-sprite(twitter);
  }
}
```

So what exactly is all of that? We're going to combine the power of Compass image sprites, dimension helpers, and inlining capabilities to build a future friendly image replacement complete with progressive enhancement up to SVG to make our image replacement resolution independent (yay!). First step is first, we import our Social png icons to create a [Compass Image Sprite](http://compass-style.org/help/tutorials/spriting/). Yes, this will build a full image sprite from individual images; it rocks. Next, we're going to use the [Compass Image Dimension Helpers](http://compass-style.org/reference/compass/helpers/image-dimensions/) to grab the height and width of the PNG image so we don't need to hard code them, making them super dynamic if we choose to change the size of our images later; Compass will handle all of the changes for us in the background. We're then going to grab the hide-text [Text Replacement Mixin](http://compass-style.org/reference/compass/typography/text/replacement/) to hide our text. The final piece of our generic styling is to stop our background from repeating, because we don't want that on a text replacement.

Now onto the fun stuff, the Modernizr powered feature detection. First up, SVG. For it's background-image property, we're going to use the [Inline Image Data Helper](http://compass-style.org/reference/compass/helpers/inline-data/) to Base64 Encode our SVG, reducing HTTP requests for modern browsers and caching the image with the CSS at the cost of a slightly larger CSS file (a tradeoff I'm okay with making). If we want, say, if our SVG is of larger dimensions than our PNG, we can write a background-size property and set it to the same dimensions as our PNG to ensure the two stay in lock-step (we could feature detect for background-size, but according to the awesome Caniuse.com, all browsers that [support SVG](http://caniuse.com/svg) also [support unprefixed background-size](http://caniuse.com/background-img-opts), and I'm cool with assuming that). Finally, for our no-js and no-svg folks, we include the sprite placement for our icon, thus completing the circle. The net result of all of this? For modern browsers, they make 0 additional HTTP requests for our image replacement (which is resolution independent), get our image replacement cached with the CSS, and shouldn't download the image sprite because none of the sprite selectors apply to anything on page! For older browsers, while they will have slightly larger download sizes for their CSS, that then gets cached and they only need 1 additional HTTP request to grab their icons. 

I can hear you now, though, saying: "Hey Sam, that looks like a lot I've got to write each and every time! Can't you make it easier?" Yes. Yes I can. Presenting the **Progressive Enhancement Text Replace Mixin**.

```scss
////////////////////////
// Progressive Enhancement Text Replace Mixin
//
// - $image-name: Name of the image file without extension. 
// - $path-from-images: The path from your images folder where the .png and .svg are stored. They should be stored in the same folder.
// - $sprite-name: The name of the folder your files are stored in in order to name the sprite. See Compass Image Spriting for more info.
// - $inline: Whether or not the parent item is an inline item. If the item is inline, squish-text() needs to be used. Defaults to false.
////////////////////////
@mixin replace-text-pe($image-name, $path-from-images, $sprite-name, $inline: false) {
  // Put the height/width of the image in
  height: image-height('#{$path-from-images}/#{$image-name}.png');
  width: image-width('#{$path-from-images}/#{$image-name}.png');
  // Hide text. Use squish-text() if the element is inline
  @if $inline {
    @include squish-text();
  }
  @else {
    @include hide-text();
  }
  // No repeating backgrounds, please.
  background-repeat: no-repeat;
  // SVG
  .svg & {
    // Inline the SVG so that advanced browsers and future tech doesn't need the extra HTTP requests for the SVG
    background-image: inline-image('#{$path-from-images}/#{$image-name}.svg');
    // Background size only needed if the SVG is larger than the PNG. 
    background-size: image-width('#{$path-from-images}/#{$image-name}.png') image-height('#{$path-from-images}/#{$image-name}.png');
  }
  // Default
  .no-svg &,
  .no-js & {
    // Call the Sprite'd image's position.
    @include #{$sprite-name}-sprite(#{$image-name});
  }
}
```

Hope people find this useful. If there are any bugs in the mixin, let me know and I'll update the mixin here. Happy coding!
