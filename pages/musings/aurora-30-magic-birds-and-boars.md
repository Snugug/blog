---
title: Aurora 3.0 - Magic Birds and Boars
template: _layout.html
published: May 4, 2013
---
I'm excited to announce the official release of Aurora 3.0! Ian and I have been worked hard to build out a base theme that truly is designed around the best tools and techniques available for front end development today. In the process, we've built better Drupal tools and walked the bleeding edge of Node.js, all to suss out the absolute best tools for the various jobs that we do most often.

## Updates to Aurora Base Theme

There are three large changes made to the Aurora Base Theme itself. The two most prominent ones are the removal of the two sidebar regions from the standard `page.tpl.php` because, let's be honest, sidebars are a lie, and the removal of the standard system information from `page.tpl.php` (site name, logo, tabs, messages, etc…). Instead we encourage you to create your layouts through CSS and a grid system for when you need it and to use [Blockify](http://drupal.org/project/blockify) (or a similar module) to get those blocks you'd like back.

The other big thing we've done to the base theme itself is the removal of many of the advanced theme settings in favor of [Magic module](/musings/do-you-believe-magic) integration. This way we have a standard way of using these advanced features across multiple themes with modules only needing to support the Magic syntaxes. We think this is a big win for the Drupal community, and we will be actively maintaining that module as well.

## Updates to the Aurora Gem

Along with some standard tweaks, we've got some exciting new updates to the Aurora gem! We've streamlined the available subtheme selections to include what use to be the Singularity install as the basic install, the Corona install, and a new SMACSS based subtheme called Polaris. We've also included Gemfiles in all of the new base themes to keep your dependencies in check.

We've also included some advanced integration with the awesome Bower and Grunt tools. Both tools can be installed optionally into your new base themes or even in to your old base themes.

The Bower integration is just enough to get your started, a `components.json` file for components and a `.bowerrc` file for controlling them.

Our Grunt integration, on the other hand, is super cool, bleeding edge, and generally awesome. Instead of using Compass to compile your Sass directly, we've included `grunt build` and `grunt watch` tasks. The `grunt watch` task will compile your Sass for you with far fewer resources needed by the native Compass compiler (and will run everything through Bundler!), JSHint your JavaScript for you, and will even set up a LiveReload server for you so you don't have to buy any apps or or deal with any complicated setup! The `grunt build` task will also compile your Sass for you into production mode and optimize your images for you! 

## Updates to the Aurora Docs

While our old PDF manual was very neat, it was a pain to keep up to date and, therefore, was out of date. We've updated our docs, put them up on GitHub, and now anyone can view them or edit them from anywhere. [Go check them out!](http://snugug.github.io/Aurora/)
