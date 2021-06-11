---
title: '@target Your CSS'
date: 2014-06-15
summary: >
  `@target` syntax to spin out specific pieces of your CSS into new files through a little bit of post processing.
---

Way back on January 5, 2012, a feature was made to the Sass issue queue titled [separate media/browser specific markup to separate style sheet](https://github.com/sass/sass/issues/241). The gist of the issue is fairly simple in concept, it's very useful to be able to maintain styling in a single Sass file (or really, single output CSS file), but be able to spin out the pieces you'd like to enhance/degrade with into their own CSS files automatically. Think writing styling for browsers that support Flexbox and browsers that don't support Flexbox in the same file, but having two separate CSS files output for the two different levels of support, letting you use something like [yepnope](http://yepnopejs.com/) or [loadCSS](https://github.com/filamentgroup/loadCSS) to load in only the styling needed. It would make [graceful degradation](https://github.com/sass/sass/issues/241#issuecomment-7881980) for legacy browsers easier too. Lots of good things.

The general consensus from that thread is that a syntax similar to `@target` would be great, so you could write Sass that looks like the following:

```scss
.foo {
  content: bar;
  @target old {
    content: baz;
  }
}
```

With this syntax proposal, you'd get out the base stylesheet that you wrote (with `content: bar`) and a file named `old.css` with `content: baz`. Fantastic! Except, it hasn't been implemented yet, so we can't quite use it yet.

But ya know what? I want to use it now. My current [best practice of manually doing it](http://pointnorth.io/#partial-structure) makes me sad. I want to do it automatically! I've got a bit task runner crazy recently, and after messing around with some Sass, I've cracked the case and have made this possible!

Introducing [gulp-css-target](https://github.com/snugug/gulp-css-target), a Gulp plugin for post-processing a CSS file into its target parts. Usage is fairly simple, and takes two parts. The first part is a special CSS comment to fence in the code you want. The opening fence should be as follows:

```scss
/*! @{target: my-awesome-target} */
```

Then, write any styling you'd like to include under that. The closing fence should look like the following:

```scss
/*! {target: my-awesome-target}@ */
```

You can have multiple of the same targets in the same stylesheet, they'll get added in order. Once you've got those comments in, create a Gulp task and pipe your CSS into `target` and back out to where you'd like it to go!

```scss
var gulp = require('gulp');
var target = require('gulp-css-target');

// Same Directory
gulp.task('target', function () {
  return gulp.src('css/**/*.css')
    .pipe(target())
    .pipe(gulp.dest('css/'));
});
```

This will create a `my-awesome-target.css` file in your CSS directory, put your targeted styling into that file (without comments), and remove the targeted styling from your source file. Yay!

Now for some bonus material! [Toolkit 2.4.0](https://github.com/Team-Sass/toolkit) includes a [`@include target` mixin](https://github.com/Team-Sass/toolkit#target) to make writing these special comments easy! This mixin requires Sass 3.3.x or greater as it relies upon `@at-root`. The actual mixin is fairly simple, you can simply include it yourself if you'd like:

```scss
@mixin target($target) {
  @at-root {
    /*! @{target: #{$target}} */
    & {
      @content;
    }
    /*! {target: #{$target}}@ */
  }
}
```

While I haven't (and honestly probably won't) write mixins for other preprocessors, it should be do-able with similar features, or just by hand. That makes `gulp-css-target` usable with any preprocessor, including not using one at all.

Enjoy everyone!
