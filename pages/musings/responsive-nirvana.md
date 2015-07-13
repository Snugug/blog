---
title: Responsive Nirvana
template: _layout.html
published: April 26, 2013
---
While they've been soft launched for a few weeks now, I'm crazy excited to announce that we've finally, officially, launched [Singularity 1.0](https://github.com/Team-Sass/Singularity) and [Breakpoint 2.0](https://github.com/team-sass/breakpoint). To me, these two tools represent the next generation of Responsive Web Design with Sass and provide me with an awesome happy place. They've allowed me to create and iterate over responsive designs faster and easier than I've ever been able to before while still allowing me to maintain full control. They provide for me a responsive web design nirvana and I can't wait for everyone to start using them.

## Singularity 1.0

Singularity is a little bit different than most other grid systems you've come across. To begin with, it's not a grid system *per se*, but rather a grid framework to allow you to make your own grid system. Singularity is divided into three parts, a syntax layer, a math engine, and an output layer. 

The math engine is really Singularity's secret sauce; all of the calculations are based on the supplied grid definitions themselves as opposed to the container in which the grid resides. This allows two things: the first is that it allows either symmetric or asymmetric grids to be specified, awesome! The second is that, because the math engine is container independent, you can use your girds anywhere, in any container, and they'll work precisely as expected. After all, grids are just a percentage of a whole, no matter what the whole is.

The syntax layer and output layer set Singularity apart as well. While Singularity's default output style is [Isolation](https://github.com/Team-Sass/Singularity/wiki/Output-Styles#isolation), it also comes with the more traditional [Float](https://github.com/Team-Sass/Singularity/wiki/Output-Styles#float) output style. More important than those two output styles coming with Singularity, though, is that Singularity is designed to allow you to create custom output styles allowing you total control of your output. This means that when CSS Grids land, or when Flexbox is more widely supported, you will continue to be able to use Singularity for your grids with these new output styles. You can even choose output styles on the fly, letting you mix and match as you'd like. Each output style can also supply its own [Output Span](https://github.com/Team-Sass/Singularity/wiki/Spanning-The-Grid#output-span), allowing each output style to define a syntax that makes most sense to that output.

## Breakpoint 2.0

Breakpoint 2.0 is everything that you loved from the original Breakpoint, just made *that much more awesome*. It's still just as easy to use as before, but it's now been super powered. You can now include [Media Types](https://github.com/Team-Sass/breakpoint/wiki/Advanced-Media-Queries#media-types) and [No Query Fallbacks](https://github.com/Team-Sass/breakpoint/wiki/No-Query-Fallbacks) straight in your variable definitions, your No Query Fallbacks files can now [target specific fallbacks](https://github.com/Team-Sass/breakpoint/wiki/No-Query-Fallbacks#separate-fallback-file-specific-fallbacks), and Breakpoint now supports [Or Queries](https://github.com/Team-Sass/breakpoint/wiki/Advanced-Media-Queries#or-queries), giving you better control over exactly what constitutes a successful query. We've also updated our [Cross Browser Resolution Media Queries](https://github.com/Team-Sass/breakpoint/wiki/Advanced-Media-Queries#resolution-media-queries) to use standard queries and produce better output, and we've even rolled [Respond-to](https://github.com/Team-Sass/breakpoint/wiki/Respond-To) into Breakpoint Core, allowing use of both syntaxes out of the box and as you need them.

## In Action

Those who have had an opportunity over the past few weeks to see my RWD with Sass+Compass talk will have seen both of these in use, even if they didn't quite know it. Once the video for my talk is online, I'll be sure to link to it, but until then, if you'd like to see code examples of these tools in action, along with [Toolkit](https://github.com/team-sass/toolkit), my slides [are available online](http://snugug.github.io/RWD-with-Sass-Compass/#/).
