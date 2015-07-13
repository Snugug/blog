---
title: Site Refresh
template: _layout.html
published: March 24, 2013
---
So it's happened, finally. A site refresh. Back to basics, built with my actual usage in mind, not what I thought I'd use my site for.So, what do we have here, then? First, obviously, you'll see a new color scheme loosely inspired by the [Monokai Color Scheme](http://studiostyl.es/schemes/sublime-text-s-monokai-color-scheme) for Sublime Text 2, which is what I use when I code. My main copy is set in [P22 Underground](https://typekit.com/fonts/p22-underground) (the commercial version of [Johnston](http://en.wikipedia.org/wiki/Johnston_(typeface)), the font used in the London Underground) and my code snippets are set in Adobe's great [Source Code Pro](http://blogs.adobe.com/typblography/2012/09/source-code-pro.html). I'm doing a little bit of font scaling to provide a better measure at smaller widths, using Em based fonts combined with [Compass's Vertical Rhythm] combined with a Golden Ratio based [Modular Scale](http://thesassway.com/projects/modular-scale). For syntax highlighting, I've moved from Geshi to the awesome [Prism](http://prismjs.com/). Some of my source code highlighting may be broken at the moment, but it'll be fixed once I get the plugins I need for Prism. I've got a bit of off-canvas going for my menu, if you can call it that, and am making use of Viewport units because why not? 

I've also re-architected my site a little bit. I sat back, thought about what exactly people were coming to my site for, looked at my analytics, and decided the following: First, my home page would redirect immediately to the most recent post as that's most likely what people are coming to my site for. Secondly, I've dropped both the Gallery and Labs sections as they've both been broken since launch and I don't see myself using them any time soon. If I do, I can add them in later, but for now I don't need them. The Me section is still there, just in the flyout now.

There are some issues with the site, right now. For instance, I haven't fully finished the theming for the Comments section, but they look fairly decent right now. Like I said before, not all of my syntax highlighting is correct right now, but it will be. Finally, I've set up being able to slide the menu out using a swipe on touch, but I haven't gotten around to writing that code yet.

If there was one thing that's really bothering me about this site that I wish I could change is the reliance of Drupal upon jQuery. This dependency does quite a bit to bloat my page size when I truly don't believe I need it, but that's the price for working in this system; oh well.

Enjoy! 
