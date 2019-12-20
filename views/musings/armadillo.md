---
title: Armadillo
date: 2016-12-31
summary: >
  Armadillo 3.0 is out! It's faster, easier to maintain, and comes with service workers! Let's learn what Armadillo is!
---

A couple weeks ago, I wrote about how I was [testing Gulp tasks](https://snugug.com/musings/unit-testing-gulp-tasks/) for an in-progress rebuild of [Armadillo](https://github.com/snugug/gulp-armadillo), my static site generator (that actually powers this site!). [Last time I did this](https://snugug.com/musings/yo-dawg-i-heard-you-like-redesigns/), I promised a full write-up on Armadillo, which I swear I wrote (in fact was _just_ looking for it) but looks like I never did. So, consider this that writeup!

## What is Armadillo

``````bash
               ,.-----__
            ,:::://///,:::-.
          /:''/////// ``:::`;/|/     .--------------.
         /'   ||||||     :://'`\     | Hello, again |
        .' ,   ||||||     `/(  e \   /--------------'
  -===~__-'\__X_`````\_____/~`-._ `.
              ~~        ~~       `~-'
``````

I've got a mantra when it comes to building open-source projects: **pick a name, make the ASCII art, start coding**. Armadillo here's proof.

Armadillo [started back in May 2013](https://github.com/Snugug/generator-armadillo/commit/928636eeaf074a39acfe62391838684e6baef3bb) as a [Yeoman](http://yeoman.io/) generator for scaffolding out a Grunt-based static site generator. It was one of my earliest Node projects.

Today, Armadillo is still a static site generator, but it's evolved to be a set of composable [Gulp](http://gulpjs.com/) plugins and tasks that can be configured and used as-is, or can be brought in to another Gulp project as the basis for doing static site generation. Because it's Gulp, Armadillo can be extended with any and all of the goodies available to the Gulp ecosystem.

## What Does Armadillo Do?

Armadillo, when using the [default config](https://github.com/Snugug/gulp-armadillo/blob/master/config/default.js), takes static files, compiles those that it needs to, and spits out a static site.

### Static Assets

Static assets, like videos (`videos`), audio (`audio`), fonts (`fonts`), and documents (`docs`), all get copied directly to a folder of the same name.

### Images

Images get run through [image optimization](https://www.npmjs.com/package/gulp-imagemin) and get placed in the `images` folder.

### Sass

Sass gets watched from the `sass` directory, linted using [Sass Lint](https://github.com/sasstools/sass-lint), and compiled using [Node Sass](https://www.npmjs.com/package/node-sass) with [Eyeglass](https://github.com/sass-eyeglass/eyeglass) to allow for Sass NPM modules to be used!

### JavaScript

JavaScript compiling is a big space right now, with the heaviest hitter being Webpack. That would seem to make it the obvious choice for inclusion, but I've found Webpack to be too slow for my liking, and don't like that it wants to _be_ the ecosystem. I'm still very much a fan o Gulp, and I know that for many of my users, Webpack presents a very big learning curve. That said, I felt strongly that some form of JavaScript compiling was needed for Armadillo 3, and so it comes with [Rollup](http://rollupjs.org/).

I like Rollup as I find its learning curve to be fairly minimal, it has a sizable community in and of itself, is quite fast, and can be integrated in to a Gulp based workflow in a way I was satisfied with without needing to own the whole ecosystem. I've bundled it with the Node Module and CommonJS loaders to be able to import modules from NPM, and I pass the bundle through [Babel](https://babeljs.io/) once it's compiled, but mostly to gain the ability to use [Babili](https://github.com/babel/babili/) as an ES2015+ aware minifier (I've been running in to too many issues with Uglify and ES2015, so had to make a switch). User-written JavaScript gets linted using [ESLint](http://eslint.org/).

### Markup

Armadillo supports two different ways of producing markup: either by writing HTML, or by writing [GitHub Flavored Markdown](https://guides.github.com/features/mastering-markdown/) (my preferred Markdown syntax). Both support [front matter](https://jekyllrb.com/docs/frontmatter/) for defining variables to be passed in to the actual page render.

Markdown previously was rendered with Marked, which I love, but found hard to extend as I wanted to, and feels very much like it's in maintenance mode. For Armadillo 3, I've switched to [Remarkable](https://www.npmjs.com/package/remarkable) which is very fast and has support for a plugin system, which I put to use to extend it a little. The documentation is lacking, but it's working well so far. One of the extensions I've written is to have the rendered syntax highlighting be done through [Prism](http://prismjs.com/), with proper `pre` and `code` wrapping, reducing the need to have to run it in browser.

Templating for markup rendering is done through [Nunjucks](https://mozilla.github.io/nunjucks/). Nunjucks has been my go-to templating engine of choice since Swig was discontinued, and I explored switching to Twig for Armadillo 3, but ultimately decided that Nunjucks still reigns supreme in the token-based Node templating languages for my needs, so it's here.

Full documentation of markup rendering extensions can be found in the [Armadillo Additions](https://github.com/Snugug/gulp-armadillo/wiki/Armadillo-Additions) section of Armadillo's documentation.

### Server

Armadillo uses [Browsersync](https://www.browsersync.io/) to run its development server, allowing for automatic code injection, navigation and scroll sync, and testing on actual devices, all out of the box. This means more accurate cross-browser cross-device development that only requires an open URL.

## What A Fast Armadillo

One of my goals for Armadillo, starting with the previous version, is to automate much of the work that goes in to making a _super fast site_. In Armadillo 2, that meant including [Critical](https://github.com/addyosmani/critical) to automatically extract and inline above-the-fold CSS and load the remaining CSS asynchronously. This goes a very long way to producing a fast [First Meaningful Paint](https://developers.google.com/web/tools/lighthouse/audits/first-meaningful-paint) and [Time to Interactive](https://developers.google.com/web/tools/lighthouse/audits/time-to-interactive), two key metrics for looking at Load in [RAIL Performance Measurement](https://developers.google.com/web/fundamentals/performance/rail).

In Armadillo 3, though, this has been supplemented to make sites even faster. [Service Workers](https://developers.google.com/web/fundamentals/getting-started/primers/service-workers) are a low-level browser cache API can be leveraged by developers to precisely control a browser's cache. One of the amazing uses for this is the ability to cache the actual content and markup of a page, allowing content to be available offline! With a static site generator producing, well, mostly static sites, this is a _perfect_ way to turn performance up to 11. Armadillo will now use [sw-precache](https://github.com/GoogleChrome/sw-precache) to automatically generate a service worker to cache all of its static files, and inject in to the top of the rendered JavaScript file the code needed to actually register and use the service worker! With these two things combined, it becomes a 0-touch process to implement some of the most advanced performance tuning techniques available! Faster sites for everyone!

## The Future

I currently use Armadillo for two things right now: this here blog, and creating web-based presentations. The later has become quite an interesting use-case for me, and I'd like to see if I can make Armadillo easier to use for when I'm doing so. That may mean extending the newly-updated [Armadillo Yeoman Generator](https://github.com/Snugug/generator-armadillo/) (which needs some testing and semantic release love) or something else; not quite sure.

Since "finishing" Armadillo 3.0 3 days ago, I've already released 6 point releases with new functionality (yay automated semantic release!), but now my [issue queue is empty](https://github.com/Snugug/gulp-armadillo/issues) so I'd love to hear ideas as to how to improve my little Webadillo (right? yah? sure.). Moving documentation from the wiki to an actual site is likely the first step after working out a better way to deploy to GitHub Pages than the current shell script I've got. For now, though, I'm very happy with the current state of the codebase, so get out there, use it, and leave me some feedback!

## Yo Armadillo!

To get started with Armadillo, the easiest thing to do is use the Yeoman generator. Be sure that Node 6+ is being used, and run the following from the command line:

**Install Yeoman and the Armadillo generator globally**

```bash
npm i yo generator-armadillo -g
```

**Run the Armadillo generator**

```bash
yo armadillo
```

Follow the on-screen instructions. Once the project is scaffolded out, move in to that folder in the command line, and run the following:

**Start Armadillo**

```bash
npm start
```

This will kick off the build to get Armadillo up and running!

---

```bash
:-.
::`;/|/     .---------------.
:://'`\     | Happy Coding! |
 `/(  e \   /---------------'
__/~`-._ `.
~       `~-'
```
