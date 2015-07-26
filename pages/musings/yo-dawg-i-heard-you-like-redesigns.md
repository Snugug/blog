---
title: 'Yo Dawg, I Heard You Like Redesigns'
template: _layout.html
published: July 25, 2015
updated: July 25, 2015
summary: >
  I redesigned and rebuilt my site again. Let's talk about that.
---
Exactly one month ago tomorrow, I was down in Austin and, after having done a few interviews for potential candidates and constantly talking about how important a developer's personal site is, I finally ~~snapped~~ decided it was time to be serious about redoing my website. So I started experimenting. Last night I finally cut over to the new site, and I'm pretty happy about how it turned out.

The goals of my redesign were fairly straight forward:

* Remove the complexity of a full content management system (CMS)
* Focus on the three key languages I use every day: HTML, CSS, and JavaScript
* Make publishing to the site as easily as a `git push`
* Improve the performance of the site
* Improve the overall visual design, especially the long-form text reading experience

These five goals required me to rethink my whole website from scratch, including writing my own static site generator and refining the continuous deployment process I'd been playing with at work.

## Goodbye Drupal, Hello Markdown

The very first decision I made was to drop [Drupal](https://www.drupal.org/). I haven't done active Drupal development in maybe two years, and Drupal code isn't something I'm interested in developing or maintaining anymore, so it seemed only logical that I drop it. This also meant saying goodbye to [Pantheon](https://pantheon.io/). I love Pantheon (frequently hold them up as a yardstick for managed hosting) and the team there, but moving off of Drupal meant moving off of Pantheon.

Deciding to move off of Drupal wasn't just a "Sam's Grumpy because Drupal" thing. Recently I've become increasingly exacerbated with CMSs when working on websites that don't have large amounts of highly interconnected content. I find them to simply be overkill. For a site like this, where each piece of content is stand-alone with maybe a few listings of content and some metadata for each piece of content, that's the realm of static sites, not dynamic ones.

While working on the [Watson Design Guide](https://github.com/IBM-Watson/design-guide), I came up with a system using [Markdown](https://help.github.com/articles/github-flavored-markdown/), [Front Matter](http://jekyllrb.com/docs/frontmatter/), and a templating language (more on that later) to create [primary and secondary content types](https://github.com/IBM-Watson/design-guide/wiki/Content-Models); a way for Markdown to have structured sub-content types, allowing for a mixture of unstructured long form text with structured pieces scattered throughout. I love this so much that I wanted to use it in my personal site.

I already had my content in Markdown in Drupal, but the way the markdown rendering worked in Drupal meant that a metric tonne of cleanup was needed in order to strip out some pre-rendered content that I needed to intersperse. After cleaning my content up, I'm now left with clean markdown with front matter that I can render each page with. It also means that updating my content is as easy as updating a `.md` file, which I'm a big fan of.

## Dog Food

I'm a Front End Developer. I work in HTML, CSS, and JavaScript. When I build a website, if I can stick to just that, that's what I want to do. Ruby based static site generators, like Jekyll and Middleman, were out because, well, I don't like Ruby and didn't want to add that to my stack. I haven't come across a Node one that had the level of flexibility and customization that I wanted, or one that focused on performance. So, my [Armadillo static site generator](https://github.com/Snugug/gulp-armadillo) was reborn (a full write up on this coming later).

```bash
               ,.-----__
            ,:::://///,:::-.
          /:''/////// ``:::`;/|/     .-------.
         /'   ||||||     :://'`\     | Hello |
        .' ,   ||||||     `/(  e \   /-------'
  -===~__-'\__X_`````\_____/~`-._ `.  
              ~~        ~~       `~-'
```

It was really fun for me to bring the Armadillo back to life; I learned Node by and [Yeoman](http://yeoman.io/) by building the original [Armadillo Yeoman generator](https://github.com/Snugug/generator-armadillo). More important than it being fun, though, was the need for an easy to use but powerful static site generator that the designers I work with could use. This is actually where my rebuild really started in earnest. While building my site, I refined the new and improved Armadillo based on the needs that cropped up while I was building, working to ensure that any feature I added would be easily accessible to our designers. There's something great about dogfooding the code you write for your team; it makes the experience using it better as I'm no longer just a developer, I'm a user too.

## Site, Deploy Thyself

Once I made the decision to not use a Ruby based static site generator, especially Jekyll, it meant that I needed to come up with a deployment process. I've used [Travis CI](https://travis-ci.org/) for a bunch of my projects, and had recently moved the Watson Design Guide to [CircleCI](https://circleci.com/), and really enjoyed the experience of using that, so I wrote a little [Bash deploy script](https://github.com/Snugug/blog/blob/master/.deploy.sh) to publish to GitHub Pages from CircleCI. Because this is a static site generator, the test that gets run is "can this build", then a distribution build happens, then a push. The net result? Within 5 minutes of pushing, [the site gets deployed](https://circleci.com/gh/Snugug/blog/tree/master), and boo!

The thing I'm most happy about with this setup is it provides a very generic way to deploy to GitHub pages from any CI system using any build process. I've seen many people choose Jekyll specifically because of how easy it is to deploy to GitHub Pages. While not absolutely as easy, this means I personally never have to consider that again, and hopefully it means you'll consider other options before doing so as well. I also think I'm going to update the Armadillo Yeoman generator to make it easier to set up a blog using this system.

## Go Speed Racer

Performance is [a big deal](http://snugug.com/musings/performance-sketches/). My old site was, acceptable? I guess? Drawing inspiration from my friend [Ian Carrico](https://iamcarrico.com/) and [Smashing Magazine's Performance Case Study](http://www.smashingmagazine.com/2014/09/improving-smashing-magazine-performance-case-study/), I went about figuring out how to make my site super fast. While I didn't go as far as Ian did, I did move to inline my critical CSS using [Critical by Addy Osmani](https://github.com/addyosmani/critical) and wrote a tiny [custom font loader](https://github.com/Snugug/blog/blob/master/templates/_index.html#L16-L57) to keep my custom font rendering hit small. Both of these things greatly speed up perceived performance of my site, and having everything rendered out before makes the site super fast to begin with. Serving from GitHub Pages also means that the whole site lives in the Fastly CDN, which further boosts performance. I also removed the redirect to the landing page that I use to have in favor of having a listing of the 5 most recent posts, with the latest prefetched.

 While I was at [Mobile+Web DevCon](http://mobilewebdevconference.com/san-francisco-july-2015/agenda/) two weeks ago, I got to watch [Steve Souders](http://stevesouders.com/) talk about [Design+Performance](https://www.youtube.com/watch?v=A9rKO2rhYYM) (video of the talk, you should go watch it!). During his talk, I signed up for [SpeedCurve](https://speedcurve.com/), his [WebPagetest as a Service](http://www.webpagetest.org/) (not a paid endorsement, just really like it). I set up SpeedCurve then, and I think the easiest way to see the performance impact of my redesign is to just see the graphs for yourself.

 ### East Coast US, 5Mbps up, 1Mbps down, 28ms Latency

 [![East Coast "Cable" SpeedCurve Performance View](/images/yo-dawg-i-heard-you-like-redesigns/cable.png)](/images/yo-dawg-i-heard-you-like-redesigns/cable.png)

 ### West Coast US, 1.6Mbps up, 768Kbps down, 300ms Latency

 [![West Coast "Mobile" SpeedCurve Performance View](/images/yo-dawg-i-heard-you-like-redesigns/mobile.png)](/images/yo-dawg-i-heard-you-like-redesigns/mobile.png)

For both East Coast US (which I have emulating a standard cable connection) and West Coast US (which I have emulating a 3G connection), post site relaunch my performance statistic basically fell off a cliff. Speed Index for East Coast went from around 1000 to around 600; for West Coast from around 3550 to 1200. Requests for both plummeted from around 40 to 10. Content size was cut nearly in half. Overall, then, I think a success.

## Those Textures Tho

["those textures tho"](https://twitter.com/britanyponvelle/status/624752936703258624) was probably the funniest response I got about the visual redesign, coming from an awesome visual designer I work with named [Britany Ponvelle](http://britanyponvelle.com/). So, I'm not a visual designer, but I was playing with CSS Gradients, and I would up building this fun little [gradient pattern](https://github.com/Snugug/blog/blob/master/sass/global/_heading.scss) that I could play with to create a few fun effects, so I ran with it. All of the headings on the site use the same pattern with tweaked angles and colors, and the footer does too (although you may need to bump your monitor's brightness to really see it). I wanted something that would provide a little visual flair without giant images, and I think I got there.

For typography, I moved from [P22 Underground](https://www.p22.com/family-Underground) to [Aller by Dalton Maag](https://www.daltonmaag.com/aller) for my font. Big thanks to [Scott Kellum](http://scottkellum.com/) for being my typography sherpa and for offering up a bunch of foundries and specifically picking out from them three or four he thought I'd like best. He wins big time for that, because Aller came from one of his suggestions. I stayed with [Source Code Pro](http://adobe-fonts.github.io/source-code-pro/) for my monospace font. I bumped up the font size and thickness and used [Modular Scale](https://github.com/modularscale/modularscale-sass) for my type scales including the entirely CSS driven fluid header typography.

Early on I knew I wanted the most important part of my site to be the writing, so I made the decision to move the main navigation of my site to the footer and not present top nav. I'm still a little squeamish about not having "a nav bar" visually, but I think I'll get over it, because I like it in the footer.

Overall, my last site was very dark. I liked it that way, but every time I went to play with a dark design on this site, it felt wrong, so I wound up going with an off white redesign with splashes of color. I think my favorite color that I use on the site is the link color, `#c20030`. Time was spent making sure that all of the colors used are AA accessible or better. The one place this gets weird is in the header as there's no good way of determining accessibility over gradients when combined with text shadows. Without them, they're totally inaccessible, but with they begin to have enough contrast to not set off my accessibility alarms that I've gained while working at IBM, so I'm gonna roll with it. Speaking of IBM, I pulled in some of the IBM colors for the redesign, and they work pretty well. I'm a fan.

I removed comments from my site as I didn't get much discussion on any particular blog post. If you'd like to talk about something, [to the issue queue!](https://github.com/snugug/blog/issues)

## Technology

There's a small cavalcade of technology used to power this whole thing, but it all kinda works together really cleanly to make building the site very clean and straight forward. Like I mentioned earlier, I'll do a full writeup on Armadillo, but here's the basic tech breakdown of what's building the site:

* [Swig](http://paularmstrong.github.io/swig/) - JavaScript template engine
* [Marked](https://github.com/chjj/marked) - Markdown converter
* [Sass](http://sass-lang.com/) - CSS Preprocessor. [Node Sass](https://github.com/sass/node-sass) specifically
* [Gulp](http://gulpjs.com/) - Task running
* [Useref](https://github.com/digisfera/useref) - CSS/JS minification and concatenation
* [Critical](https://github.com/addyosmani/critical) - Critical CSS extraction and inlining
* [CircleCI](https://circleci.com/) - Continuous integration and deployment

All of the [source code](https://github.com/snugug/blog) is also available for you to dig through and have fun with!

<hr>

I hope you enjoy my shiny new site! It was awesome finally getting to launch it last night after a month's worth of work, and I'm pretty happy with how it's turned out. Now that it's out there (and easier to update) my goal is to start writing more, so expect more of that. Although, considering this post took about 5 hours this morning to write, I'm not sure just how much more I can write before it becomes a full time gig.

If you've got any feedback, [Twitter](https://twitter.com/snugug) is the best place to find me, but the site's [issue queue](https://github.com/snugug/blog/issues) is also a good place to throw comments or suggestions.

Enjoy!
