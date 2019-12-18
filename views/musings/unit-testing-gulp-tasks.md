---
title: Testing Gulp Tasks
date: 2016-12-17
summary: >
  Testing Gulp tasks can seem daunting and maybe a little convoluted, but by rethinking how tasks get written a little, it that uncertainty can be quickly removed.
---

I recently started rewriting my static site generator [Armadillo](https://github.com/snugug/gulp-armadillo) and had a dilemma; the current version of Armadillo could only be tested manually because I didn't have good way of automating my tests. Now, in order to accomplish things like continuous integration and delivery, and be able to automatically roll semantic releases, this wasn't good enough. So, I went in search of a way to test Gulp tasks, and my search, well, wasn't great. Pretty much everyone recommended calling the task from the command line, which seemed a bit heavy-handed for me. I think, however, I've figured out a better way.

## Rethinking a Gulp Task

Let's take a look at a typical Gulp task:

```javascript
'use strict';

const gulp = require('gulp');
const sass = require('sass');
const eyeglass = require('eyeglass');
const prefix = require('gulp-autoprefixer');
const lint = require('gulp-sass-lint');
const sourcemaps = require('gulp-sourcemaps');

gulp.task('sass', () => {
  return gulp
    .src('sass/**/*.scss')
    .pipe(lint())
    .pipe(sourcemaps.init())
    .pipe(sass(eyeglass()))
    .pipe(prefix())
    .pipe(sourcemaps.write('./maps'))
    .pipe(gulp.dest('./css'));
});
```

This Gulp task reads in all `.scss` files in all sub-directories of the `sass` folder, lints them with [Sass Lint](https://github.com/sasstools/sass-lint), initializes a [Source Map](https://snugug.com/musings/debugging-sass-source-maps/), compiles it to CSS using [Sass](http://sass-lang.com/) and [Eyeglass](https://github.com/sass-eyeglass/eyeglass) (the Node replacement for Compass's extensions and asset pipeline from Ruby), adds vendor prefixes to CSS via [Autoprefixer](https://github.com/postcss/autoprefixer), closes out the Source Map, and writes the compiled CSS file to the `./css` directory (with Source Map written to `./css/maps`).

Breaking down this task, `gulp.src` and `gulp.dest` under the hood are really the [file stream Vinyl adapter](https://github.com/gulpjs/vinyl-fs), [Vinyl](https://github.com/gulpjs/vinyl) being a virtual file format. There are lots of different [Vinyl adapters](https://www.npmjs.com/search?q=vinyl-). Vinyl adapters take in a source (`src`) glob producing a stream of Vinyl objects. With this knowledge, we can rethink how we build our Gulp tasks to make them more testable!

Accepting that `gulp.src` and the final pipe, `gulp.dest`, we shouldn't _need_ to test, as they are already tested in Gulp (and again in Vinyl FS), then the only thing we need to test is the middle bit; that our transforms work the way we expect them to. So, let's break that middle bit out!

Turns out, there's a _great_ Node module for this already called [lazypipe](https://www.npmjs.com/package/lazypipe). Lazypipe allows us to build a reusable set of pipes, that we can call from a pipe. This is going to be the key to modularizing our Gulp task, and eventually testing it. Let's break that previous Gulp task out in t a `lib` file that an be reused, and the task itself:

**lib/sass.js**

```javascript
'use strict';

const lazypipe = require('lazypipe');

const sass = require('gulp-sass');
const eyeglass = require('eyeglass');
const prefix = require('gulp-autoprefixer');
const lint = require('gulp-sass-lint');
const maps = require('gulp-sourcemaps');

module.exports = lazypipe()
  .pipe(lint)
  .pipe(maps.init)
  .pipe(sass, eyeglass())
  .pipe(prefix)
  .pipe(maps.write, './maps');
```

**Gulpfile.js**

```javascript
'use strict';

const gulp = require('gulp');
const sass = require('./lib/sass');

gulp.task('sass', () => {
  return gulp
    .src('sass/**/*.scss')
    .pipe(sass())
    .pipe(gulp.dest('./css'));
});
```

Now we have two files: `lib/sass.js` that contains the _functionality_ of the Gulp task, and `Gulpfile.js` which contains the _implementation_ of the Gulp task. Now that there's a separation of concerns built, we are all set up to start testing.

## Testing Our Task

Now that the body of our task is split out, we can start to test it! Because what we've got now in `lib/sass.js` is a reusable set of pipes that can be reused with _any_ stream of Vinyl objects, we can build some test scaffolding around it! We can use Vinyl FS like what's under the hood for Gulp, or wen can use [Vinyl String](https://www.npmjs.com/package/vinyl-string) to build a stream of Vinyl Objects (well, really, one object) from a string. I've also found that wrapping our stream in a [Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise) makes it easier to plug in to any test system out there, so let's do that as well.

**tests/helpers/pipe.js**

```javascript
'use strict';

const vs = require('vinyl-string');
const map = require('map-stream'); // Lets us write in-line functions in our pipe

/*
 * Get transformed contents of a string
 *
 * @param {string} input - String contents of the "file"
 * @param {string} path  - The "path" of the "file"
 * @param {function} func - The lazypipe that will be used to transform the input
 *
 * @returns {string} Vinyl file representing the original `input` and `path`, transformed by the `func`
 */
module.exports.fromString = (input, path, func) => {
  return new Promise((res, rej) => {
    let contents = false; // So we can grab the content later

    const vFile = vs(input, { path }); // Equivalent to path: path. ES6 Object Literal Shorthand Syntax

    vFile
      .pipe(func()) // Call the function we're going to pass in
      .pipe(
        map((file, cb) => {
          contents = file;
          cb(null, file);
        }),
      )
      .on('error', e => {
        rej(e);
      })
      .on('end', () => {
        res(contents);
      });
  });
};
```

The `fromString` function takes a string to transform, what its file path would be (if it had been a file), and the lazypipe function, and it'll return a promise that will reject if there's an error, or resolve with the Vinyl file. Once we have this, we're all set up to test our task! This example is going to be with [AVA](https://github.com/avajs/ava), but will work with any test scaffolding.

**tests/sass.js**

```javascript
import test from 'ava';
import { fromString } from './helpers/pipe';

import sass from '../lib/sass';

test('compiles', t => {
  const input = '$foo: red; body { background: $foo; }';
  const expected = 'body{background:red}\n\n/*# sourceMappingURL=../maps/sass/style.css.map */\n';

  return fromString(input, 'sass/style.scss', sass).then(output => {
    const contents = output.contents.toString();
    t.is(contents, expected, 'Sass compiled as expected');
  });
});
```

And with that, we've been able to divide out the body of a Gulp task to make it both modular and testable! This can be seen in action in the (as of this writing) [3.x Armadillo branch](https://github.com/snugug/gulp-armadillo/tree/3.x) (or in the `master` branch if I've finished it all by then).

Happy testing!
