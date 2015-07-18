---
title: Debugging Sass with Source Maps
template: _layout.html
published: February 28, 2013
updated: July 6, 2013
summary: >
  One of the super exciting features in Sass 3.3, currently in development, is the introduction of native Source Maps as a successor to Sass Debug Info. Working Source Map reading for Sass in Google Chrome Canary means this is a real debugging option you can start looking at today.
---
## UPDATE 07/06/2013

***After some user confusion about the difference between Source Maps and Debug Info, this article has been updated to more clearly focus on Source Maps. This update incorporates the previous update in which Paul Irish pointed out that the UI for individual properties have been added to Canary's Source Map implementation.***

One of the super exciting features in Sass 3.3, currently in development, is the introduction of native [Source Maps](http://www.html5rocks.com/en/tutorials/developertools/sourcemaps/) in Sass. Source Maps are a generic mapping format written in JSON that can be utilized by any processed file to create relations between pre-processed files and post-processed files, for instance between pre-compressed JavaScript and the expanded development files or, as in our case, between compiled CSS and the development Sass files. If you've ever used [FireSass](https://addons.mozilla.org/en-us/firefox/addon/firesass-for-firebug/) or Sass's `--debug-info` flag, you can think of Source Maps as their successor.

## Before We Start

Google Chrome [Canary](https://www.google.com/intl/en/chrome/browser/canary.html) currently has support for Sass Source Maps built in, so I will be referencing their implementation of debugging for the purposes of this post. There are other tools that are able to do what Chrome does, but Chrome provides a good good baseline for comparison. To enable Source Maps in Chrome, go to [chrome://flags](chrome://flags) inside of your Canary browser and enable `Enable Developer Tools experiments.`. You'll need to restart your browser afterwards. Once enabled, open up your Web Inspector, open up settings (the gear in the lower-right corner), go to `Experiments`, check `Support for Sass`, and restart your browser to have the changes take effect.

## Sass Source Maps

Source Maps change the Sass debugging game. Now, in order to test Sass Source Maps, your'e going to need the prerelease version of Sass 3.3 which you can install by running `gem install sass --pre`. You're going to need at least **Sass 3.3.0.alpha.101** for Source Maps to work. If you're compiling using Sass, you can compile your files with Source Maps by doing something like `sass --watch --sourcemap style.scss:style.css`; as of this writing, adding `sass_options = {:sourcemap => true}` into Compass's config.rb unfortunately [does not work](https://github.com/chriseppstein/compass/issues/1189), but it hopefully will soon. With Source Maps enabled, in addition to your compiled file, you get a file in the same directory called `file.css.map` which looks something like this:

```javascript
{
"version": "3",
"mappings": "AAOA,IAAK;EACH,MAAM,EAAE,IAAI;EACZ,KAAK,EAAE,IAAI;ECRX,gBAAgB,EAAE,IAAI;EDUtB,OAAO,EAAE,IAAI",
"sources": ["../sass/test.scss","../sass/_mixin.scss"],
"file": "test.css"
}
```

Look! A pretty JSON file! It's fairly human-readable except for the actual mappings which are encoded to make their size smaller. It also shows us all of the sources that make up that file, providing us a good way to see what actually is going into our files.

If you go to Sources in Canary, you'll be in for a wonderful surprise: each partial that is used to generate your final CSS file gets displayed! That means you can easily see your whole development partial structure!

On top of all of that, the Source Map not only maps selectors to their source, it also maps *individual properties* to their source! Simply `ctrl+click` (Windows) or `cmd-click` (Mac) to go straight to the line in the file a property comes from! As promised, Sass Source Maps allow you to dive in to a property that comes from mixins, jumping straight to the line in the file inside the mixin it comes from, as well as dive in to a property that comes from extendables, jumping straight to the line in the file inside the extendable it comes from and even working with placeholder extendables. If there was one disappointment, it's that, while the Source Maps will take you to a property that's built using a function and it will show you the function call, if the function is supplied by a partial, that partial isn't included in the Source Map tree and there's still no easy way to jump to the actual function definition. That being said, I'm not sure how I would effectively go about implementing that, so I can't be too upset about that.

Anyway, all in all, this is absolutely amazing, and I'm super excited to have this available to us in Sass. Huge thanks to Alexander Pavlov for the patch to put this into Chrome and I believe who wrote the Source Map patch for Sass to begin with.

## Sass Debug Info

If you have previously used FireSass or or Sass's `--debug-info`, you were using an ad-hoc hack to determine the source of selectors, but `--debug-info` *is not* a true Source Map. The new Source Map feature above is the first real implementation of Source Maps in Sass. If you are unable to use Sass 3.3's Source Map feature, you can still debug Sass currently with Debug Info.

Currently available in the stable version of Sass, as of this writing it's Sass 3.2.6, is the `--debug-info` flag. With this flag enabled, Sass will print out a non-standard media query that tools can read and determine the source file from. If you're compiling using Sass, you can compile your files with the debug info by doing something like `sass --watch --debug-info style.scss:style.css`; if you're compiling using Compass, you can add `sass_options = {:debug_info => true}` to the bottom of your `config.rb` file. With Debug Info on, above each selector in your compiled CSS file, a non-standard media query will be printed that looks something like this:

```scss
/* Compressed (what you'll see) */
/* @media -sass-debug-info{filename{font-family:file\:\/\/\/Users\/Richard\/Prototypes\/sourcemap\/sass\/test\.scss}line{font-family:\000034}} */

/* Expanded */
@media -sass-debug-info{
  filename{
    font-family:file\:\/\/\/Users\/Richard\/Prototypes\/sourcemap\/sass\/test\.scss
  }
  line{
    font-family:\000034
  }
}
```

Debug Info, instead of producing a Source Map, will produce a non-standard media query `-sass-debug-info` with two fake selectors; `filename` and `line`. The `filename` selector has the absolute path to the file, whereas the `line` selector has the line number the selector comes from (although this is a bit of misdirection as the line is actually 4, not 34). Debug Info isn't as powerful as Source Maps, being unable to dig into individual properties or pulling in all of the partials you're using. Google Chrome stable supports Debug Info, enabled the same way you enable Source Maps in Chrome Canary. When enabled, Sass's Debug Info will replace your normal properties with Debug Info properties just like with Source Maps, although in Sources, you will only see the primary Sass file, not any of the partials.
