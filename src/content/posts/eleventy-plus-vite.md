---
title: 'Eleventy + Vite'
published: '2021-05-13'
summary: "A pattern I've started using combining Eleventy and Vite."
---

I really like [Eleventy](https://www.11ty.dev/) as a static site generator; it does all of the things I want from an SSG and it does it well. Well, except asset handling, like compiling, bundling, and managing my CSS and JavaScript. I think part of that is because setting up compilers and bundlers just is kinda an absolute drag, even if you know what you're doing. Except, that is, with [Vite](https://vitejs.dev/). Vite may just be the single best front-end development tool I've used in literal years. It's fast, it's got bells and whistles built-in, it's smart and un-opinionated enough that there's almost no overhead to get what you likely want, and it's super extensible. Combining the two felt obvious.

Eleventy and Vite both take slightly different approaches to compiling; Eleventy, everything's compiled up-front, whereas Vite things are compiled on-the-fly. Critically, because of this, Vite expects everything to be served from one folder, by default the top-level folder, but Eleventy expects things to be compiled to a folder for serving. While I"m sure someone could get super creative with a combination of Vite and or Eleventy plugins to make the workflow I'm about to show cleaner, this setup is fast, efficient, and will have you rolling with both of them quickly.

## Configure Vite

First thing first, after installing Eleventy and Vite is to set up your Vite config. I'm going to assume that all of the working code is going to go into the `src` directory, so `src/js` for JavaScript, `src/css` for CSS, etc… and that the compiled output is going to go into the `public` directory. Switch these folders up as you need. To make this work from the Vite side, this is all you need in your `vite.config.js` file:

```js
const { defineConfig } = require('vite');

module.exports = defineConfig({
  root: 'src',
  clearScreen: false, // This is to show Eleventy output in the console along with Vite output
  build: {
    outDir: '../public', // The output directory is relative to the project root, so we need to put it back one folder to work
  },
});
```

That's it! It sets the root directory Vite works from to the `src` folder, it sets the build directory to a sibling of the `src` folder called `public`, and it configures the command line interface so that you can see Eleventy and Vite output at the same time.

## Configure Eleventy

Next up is configuring Eleventy. Here, the only essential configuration is to change the output directory of Eleventy to Vite's root directory; this ensures the HTML is available for Vite to serve. This will make that directory _a little messy_ as all compiled HTML will get put in there, but for a quick and effective solution, I'm OK with it. To do so, make sure the following is set in your `.eleventy.js` file:

```js
module.exports = function (eleventy) {
  return {
    dir: {
      output: 'src',
    },
  };
};
```

Any other Eleventy config you want, you can put in there, too. Last thing you need to do to button this up is to add `src/**/*.html` to any ignore files you have (like `.gitignore`) so the in-development Eleventy compiled HTML is not included.

## Add NPM Scripts

Two more steps! Almost done! This step is optional, but I highly recommend it: setting up NPM scripts to make working with all of this easier. My recommendation is to install the following dev dependencies:

```bash
$ npm i -D npm-run-all del-cli delete-empty
```

These three packages, will, in order, let you run NPM scripts sequentially or in parallel from other npm scripts, let you delete items, and let you delete empty folders. These three combine to make a few really handy scripts possible:

```json
{
  "scripts": {
    "prestart": "run-s clean",
    "start": "run-p *:dev",
    "prebuild": "run-s clean",
    "build": "NODE_ENV=production run-s eleventy:build vite:build",
    "clean": "run-s clean:files clean:empty",
    "clean:files": "del 'src/**/*.html' public",
    "clean:empty": "delete-empty src",
    "eleventy:dev": "eleventy --watch",
    "eleventy:build": "eleventy",
    "vite:dev": "vite",
    "vite:build": "vite build"
  }
}
```

These combine to give you, really, two scripts you're likely to run: `npm start` and `npm run build`. They do the following:

`npm start`
~ Before start is run, it deletes all of the HTML files from the `src` directory and removes the `public` directory, then deletes empty folders in the `src` directory that may be left over fom removing the HTML files. Once done, it runs all of the NPM scripts ending in `:dev`, so `eleventy:dev` and `vite:dev`, in parallel, which starts Eleventy in watch mode and Vite in dev mode.

`npm run build`
~ This is run with `NODE_ENV=production`, or "in production mode", which is a common signal that production optimizations should happen. Before build is run, it cleans up the files just like start did, then runs Eleventy's build first, then Vite's build second; this is to ensure that the HTML gets generated before Vite tries to do its thing with it.

## Multi-Page Apps, Static Assets, and Vite

Vite, in development mode, work with multi-page apps just fine! Unfortunately, when it comes to build time, it only works on `src/index.html` by default. This is straightforward to remedy, though. First install [Fast Glob](https://www.npmjs.com/package/fast-glob) as a dev dependency (`npm i -D fast-glob`) and add the following to your `vite.config.js` file:

```js
const glob = require('fast-glob');
const path = require('path');

// Find all HTML files and build an object of names and paths to work from
const files = glob
  .sync(path.resolve(__dirname, 'src') + '/**/*.html')
  .reduce((acc, cur) => {
    let name = cur
      .replace(path.join(__dirname) + '/src/', '')
      .replace('/index.html', '');
    // If name is blank, make up a name for it, like 'home'
    if (name === '') {
      name = 'home';
    }

    acc[name] = cur;
    return acc;
  }, {});

module.exports = defineConfig({
  // ... Other config stuff
  build: {
    // ... Other build config stuff
    rollupOptions: {
      input: files,
    },
  },
});
```

While a little complicated, what this does is find all of the HTML files in the `src` directory, figure out a name for the file by removing `/index.html`, and then building an array of names and HTML pages to use as input for Vite's Rollup configuration. This assumes that all pages that get assets have a `/index.html` file; if not, update the glob or the replacement accordingly. This is also going to generate a JavaScript file for each page, but because of how Vite handles imports, you should still get shared chunks between all of them. This is kind of the ugliest bit of this setup, and I'm sure it can be improved, but it's pretty good for a quick solve.

As for assets, like a `manifest.json`, `robots.txt`, or images, Vite expects those to be in a `public` folder in your root, so in this case, `src/public`. Usually not a big deal, but if you find those assets aren't getting checked in, make sure you're ignore files are ignoring `/public` for the roo public folder, not `public` which will ignore folders named public _anywhere_, including the one is `src`.

## What's Next

For me, this is a very happy little setup. I'm sure there's more tweaking that can be done to make everything a bit more smooth and a bit easier to deal with, but this was the most minimal setup I could get to that consistently worked and, more importantly, gave me the awesome dev experience of the combined power of Vite and Eleventy. If you've got thoughts on this setup or this post, drop me a line on Twitter.

Enjoy y'all!
