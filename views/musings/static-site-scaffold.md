---
title: Static Site Scaffold
date: 2019-12-18
summary: >
  Introducing the Static Site Scaffold. Part 1 of 3 discussing the new scaffolding.
---

My journey with JavaScript started 7 years ago, with my first commit to [Generator Armadillo](https://github.com/Snugug/generator-armadillo/tree/928636eeaf074a39acfe62391838684e6baef3bb), a Yeoman generator to make static sites. I didn't like Jekyll, didn't want to run Ruby, and thought that if I could get something running in Node (back in the 0.10 days!) to fit my needs faster than I could figure out Jekyll, I'd go full-in on it. Turns out, I could. Armadillo has evolved a lot over the years, with the latest version, [Gulp Armadillo](https://github.com/Snugug/gulp-armadillo), only now showing a little bit of its age even being a couple years old. After joining Google, and looking to collaborate with the team building [web.dev](https://web.dev), I was introduced to [Eleventy](https://www.11ty.dev/). It looked to be a good replacement for the custom Nunjucks compiling I was doing in Armadillo, so I took what I had learned from my 7 years of building static site generators and built one more. **Introducing [Static Site Scaffold](https://github.com/chromeos/static-site-scaffold)**, an i18n static site starter for building easy-to-maintain sites and Progressive Web Apps.

Static Site Scaffold is divided into two parts: a [Node module](https://github.com/chromeos/static-site-scaffold/tree/module) that contains the core logic around configuration and compiling, and the actual [scaffold](https://github.com/chromeos/static-site-scaffold), which contains all of the user-facing files. To get started, run `npx degit chromeos/static-site-scaffold my-awesome-site`, `cd` into the new folder that was created (`my-awesome-site`), run `git init && npm install` to initialize the repository and install dependencies, and finally `npm start` to start up the development server and get to building! Let's go through the two bits of Static Site Scaffold so you know what to expect when you get it set up.

## Module

One of the things that I've tried hard to do is avoid some of the pitfalls and pet peeves that I've come across both developing and using static site generators in the past. The most important thing that I wanted to tackle was making sure that the build system powering everything could be transparently manipulated. For 90% of the customization you'd want to do to the build system, I've included [config](https://www.npmjs.com/package/config) powered configuration, which provides a simple and powerful way of configuring code across the codebase without needing to pass objects around. This makes it as easy to grab config as requiring a module, decreasing complexity of accessing config for both users and the system. But this doesn't cover actually changing how the core build system parts operate.

In Armadillo I made the mistake of doing automagic bootstrapping. This meant that the userland boilerplate was very small, a single line of code, but meant that changing anything from that bootstrapping required a user rewriting everything themselves, or me providing configuration for everything. This is a problem I see crop up all over the place with modern tooling chains, so I looked for a way to have both powerful automatic configuration and for it to be easily broken down and extended by the user. I wound up borrowing and expanding on the model I made for Gulp Armadillo, exporting pre-configured Gulp tasks and Rollup, Babel, and Eleventy config, but having those exported items be composed in userland instead of through magic bootstrap functions. With this setup, you can, for example, either use pre-composed Rollup config that's available, or you can use the decomposed pieces exported from the same file to build your own config. In some cases, this leads to a little more boilerplate in user land, but the tradeoff between composability provided and the extra bits written feels right to me.

## Scaffold

The scaffold is where you're going to do most of your work. I've chosen [Rollup](https://rollupjs.org) and [Gulp](https://gulpjs.com/) as the primary drivers here for asset compiling as I prefer their user ergonomics over other available tooling, and I specifically didn't want to run everything through a JavaScript bundler. Of course, there's Eleventy too.

The places you'll touch most are the files in the `templates`, `views`, and `src` folders. Nothing too extraordinary for the `src` files; JavaScript that by default compiles to [ESM modules](https://snugug.com/musings/modern-cutting-the-mustard/) and Sass for the CSS. The service worker, powered by [Workbox](https://developers.google.com/web/tools/workbox), gets compiled to an IIFE, but what's in the service worker, now that's interesting.

I've set up the templates (which include layouts and components) and views (which contain the things that get compiled to pages with Eleventy) to support [localization of content](https://github.com/chromeos/static-site-scaffold/tree/a0ea44fd4326b2845def1f2b4c2583f2157ea437#internationalization-and-localization) out of the box. This takes a bit of finagling to do well with a static site generator, and I think I've come up with a fairly good process for it. The next blog post is going to deep-dive into the internationalization setup, but for me the party piece isn't getting the right files output, it's being able to do preferred locale redirection _straight in the service worker_! I wanted sites built on this scaffold to be able to hosted entirely on a CDN edge, like [Firebase Hosting](https://firebase.google.com/products/hosting); other people I talked to couldn't get the redirection to work without a server, so I set out and solved that. The other major thing the provided service worker does, which will be covered in-depth in the final blog post in this series, is that it allows for partial-page caching! After spending a bunch of time talking with [Jeff Posnick](https://twitter.com/jeffposnick), and him sending me [an article](https://jeffy.info/2017/01/24/offline-first-for-your-templated-site-part-2.html) or [two](https://developers.google.com/web/updates/2018/05/beyond-spa#common_pitfalls) on the problem of full-page caching, I came up with a solution that allows for partial page caching in the service worker that should be able to work with _any_ static site because it's not reliant on moving compiling to the service worker! I call these [Service Worker Includes](https://github.com/chromeos/static-site-scaffold/tree/a0ea44fd4326b2845def1f2b4c2583f2157ea437#service-worker-includes).

With all of this in place, what do you (currently) get from Static Site Scaffold? Here's a rundown of features and functionality that it provides:

- Live reloading local development server.
- Internationalization and Localization, including service worker based locale redirection, local date filter, local URL filter, and language name in local language filter.
- Service Worker Includes.
- ESM and IIFE based JavaScript compiling, including sourcemaps, node resolution, mangling and compression, `process.env.NODE_ENV` replacement, linting, and dynamic import support.
- Service Worker precache injection.
- Sass to CSS compiling, including sourcemaps and linting.
- Image optimization.
- Inlining of critical CSS and HTML minification (on production build).
- Compile-time syntax highlighting using [Prism](https://prismjs.com/).
- Markdown extensions including definition lists, footnotes, superscript, abbreviations, emoji, attributes, and an [Emmet](https://www.npmjs.com/package/emmet) block that allows for single-depth expansion.
- [AVA](https://github.com/avajs/ava) powered tests, including [Lighthouse](https://developers.google.com/web/tools/lighthouse) testing.

I hope you give Static Site Scaffold a try and find it useful, either as-is, or by taking ideas or components from it for your own project.
