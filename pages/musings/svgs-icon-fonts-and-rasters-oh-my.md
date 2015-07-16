---
title: SVGs, Icon Fonts, and Rasters! Oh My!
template: _layout.html
published: March 16, 2013
updated: March 16, 2013
summary: >
  One of the most hotly argued topics in front-end development today is whether you should use SVGs, Icon Fonts, or varying-resolution Rasterized Images when it comes to resolution-independent interface elements. Like all great things on the Internet, _it depends_.
---
One of the most hotly argued topics in front-end development today is whether you should use SVGs, Icon Fonts, or varying-resolution Rasterized Images when it comes to resolution-independent interface elements. Like all great things on the Internet, each side espouses that their solution is the end-all and be-all solution to the problem. However, like all great things in web development, each has its pros and cons, and as such, the answer to the question "which one should I use" is "it depends".

## Rasterized Images

Let's start by looking at Rasterized Images, also known as your friendly neighborhood Bitmap. This is what you use now! You've got your .pngs, .jpgs, .gifs, all of the image formats you know and love, all right here. This is actually one of the advantages of using rasterized images; you've been doing them for years! With transparency in .pngs, you can pretty much do whatever you'd like in them, there are tonnes of optimization tools already in place (one of my favorites is the Open Source [ImageOptim](http://imageoptim.com/)), and they are very widely supported. The downside to rasterized images is, however, the very thing that makes them so powerful; they, like our old static sites, are designed to be viewed at a specific size. This means that you need to build multiple different sizes for varying resolutions, which itself brings a slew of other issues. Large rasteriezd images are very heavy, especially when you have transparency. In order to optimize performance, you've also got to do some fairly complex media queries and include a no-query fallback to mitigate extra image loads for high resolution displays while still allowing for sites without media query support to see an image:

<pre><code class="language-scss">
/* Simple example assuming only a 1x and 2x image size */

/* 1x image. We're going to swap out the larger image at 1.5dppx, so we keep the 1x until right before that */
@media (-webkit-max-device-pixel-ratio: 1.4), (max--moz-device-pixel-ratio: 1.4), (max-resolution: 1.4dppx), (max-resolution: 134.4dpi) {
  #foo {
    background-image: url('image@1x.png');
  }
}

/* We swap in the 2x at 1.5dppx */
@media (-webkit-min-device-pixel-ratio: 1.5), (min--moz-device-pixel-ratio: 1.5), (min-resolution: 1.5dppx), (max-resolution: 144dpi) {
  #foo {
    background-image: url('image@2x.png');
  }
}

.no-query #foo {
  background-image: url('image@1x.png');
}
</code></pre>

That's a lot of code to cover just two resolution sets, and that's only going to cover current devices. That just won't do.

## SVGs

SVGs are a more interesting solution. While not as versatile as Rasterized Images in terms of effects (especially raster effects that Designers are use to in Photoshop), they still provide most of the flexibility of rasterized images. What makes SVGs great is that, at the end of the day, they are simply an XML file (which means yes! you can edit them in a text editor!). The XML file also styles the SVG using CSS inside of it, making it easy to make simple color swaps, and if you use SVGs inline (as opposed to through CSS), you can actually attach external stylesheets to them, which is awesome! Because the image is stored this way, using syntax to describe shapes as opposed to saving the shapes themselves and describing styling through CSS, SVG images can be infinitely scaled and stay crisp at all resolutions! That being said, SVGs can be a bit temperamental when it comes to file size; many complex designs that look good visually have hidden visual complexity that still gets written to the SVG file. Therefore, Designers need to be conscious of how their visual complexity translates to mathematic complexity. That being said, there are some size optimizations that can help with size; I'm a fan of the Open Source [Scour](http://www.codedread.com/scour/), plus, being XML it can be gzipped quite effectively on server. You are still going to need a Rasterized Image fallback, but fortunately most programs that allow you to create Rasterized Images from your SVGs. Implementing SVGs with their fallback is fairly simple, especially when using [Modernizr](http://modernizr.com/) to detect SVG support:

<pre><code class="language-scss">
.svg #foo {
  background-image: url('image.svg');
}

.no-svg #foo {
  background-image: url('image.png');
}
</code></pre>

## Icon Fonts

Icon Fonts are, currently, all the rage. The first icon fonts were simple; take a character and, instead of displaying the character as you would expect, display a symbol. Then [Symbolset](http://symbolset.com/) came along and turned Icon Fonts on their head, by tying icons to [ligatures](http://en.wikipedia.org/wiki/Typographic_ligature) instead of individual characters, providing not only a cool demo, but a much cleaner and more accessible way of using the same trick. There are lots of advantages to them, too! Like SVGs, they are infinitely scalable, but actually have wider support across different browsers than SVGs do. On top of that, because they are text, we can manipulate them using CSS straight from our main stylesheet, applying shadows and transforms and colors and all of that awesome stuff very easily. When it comes to [.woff](https://en.wikipedia.org/wiki/Web_Open_Font_Format) files, I've found that the file size for a single font file vs its SVG counterpart can actually be smaller, too! It's not all roses though; because they're fonts they really only allow for a single color (with some hacking to be done to kind of make dual-tone icons) and, generally speaking, font icons are built/sold as a single big chunk, leaving you with a file with a bunch of icons you're not going to use. That being said, that last fault can be resolved by using a font generation tool to create your own! I'm particularly fond of the free [icomoon](http://icomoon.io/), doubly so because they support both custom ligatures *and* custom icons! Using Icon Fonts is as easy as calling the font!

<pre><code class="language-scss">
/* Select all classes that contain a -icon somewhere, for instance .twitter-icon or .facebook-icon */
[class|="icon"] {
  font-family: 'Icon Font', sans-serif;
}

/* You can also use them with CSS content to use them in place. In this instance, I'm going to add the word 'icon' before all items with a .icon class, and using my Icon Font's ligatures, that will become an icon. NOTE: This is pseudo-code, you're going to need more than this the :before to show up properly; this is just to show how to add the icon. */
.icon:before {
  font-family: 'Icon Font', sans-serif;
  content: 'icon';    
}
</code></pre>

I hope this sheds some light on the different methods for cross-browser, cross-resolution images and how to use the various methods currently available. One final thing to note before finishing: both SVGs and Icon Fonts can suffer from sub-pixel rendering issues. That means that it's possible for edges to be calculated to not fall along an actual pixel. When this happens, those lines become slightly blurry. When using Icon Fonts, it's especially bad on Windows as it generally has problems rendering fonts cleanly. Smashing Magazine has a good writeup on [cross-browser and cross-os font rendering](http://www.smashingmagazine.com/2012/04/24/a-closer-look-at-font-rendering/) to explain in more detail the issue.
