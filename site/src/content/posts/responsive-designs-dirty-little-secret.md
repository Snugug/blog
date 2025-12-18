---
title: "On Responsive Design's Dirty Little Secret"
published: '2012-12-01'
summary: "After having extensive conversations with John Albin Wilkins, I've realized that some of the basic assumptions I made when I first went to test this are in fact incorrect and that I was working under the wrong mental model. I am keeping up the original article as record."
updated: '2013-01-29'
archived: true
---

!!! aside.note--warning
**Update 1/29/2013**

After having extensive conversations with John Albin Wilkins, I've realized that some of the basic assumptions I made when I first went to test this are in fact incorrect and that I was working under the wrong mental model. When working under the correct mental model, the Isolation method clears rows perfectly fine; however, it's a mental model significantly differently than the one I'm use to and anyone who has used traditional Float style grids or Susy are use to. I am keeping up the original article as record.
!!!

If, for some reason, over the past few months you haven't read [John Albin Wilkins'](https://twitter.com/johnalbin) article [Responsive Design’s Dirty Little Secret](http://palantir.net/blog/responsive-design-s-dirty-little-secret). I highly suggest reading the whole article, as this is more or less a response to it. The basic gist of it is that browsers are really _really_ bad at rounding percentages, and where it becomes a real issue is with percentage widths in Responsive Web Design. The issue stems from the fact that some browsers, when handed (or calculate) non-whole-pixel value, round only in one direction and not how we would round if we were doing it by hand. IE6 and IE7 round up, Opera and Webkit round down, and FireFox does sub-pixel rendering, which in a nutshell means they round correctly. This is an issue because, when calculating a bunch of fluid grids in, say, a responsive grid, the rounding errors compound upon themselves so being one pixel off on each of ten columns means the last column is 10 pixels off. This can present serious layout problems.

Except that it doesn't.

We are going to be talking in terms of layouts as this is where the problem presents itself most usually. So, before we go any further, let's define a couple of terms.

- **Float Method**: The "standard" method for laying out items. A List Apart has a great writeup on [CSS Floats](http://www.alistapart.com/articles/css-floats-101/). Simply slap a percentage width on your item, use a CSS Float to push it around, and you're set. Susceptible to compounding rounding errors.
- **Isolation Method**: The "new" way proposed by John in the above linked article. A bit more advanced. Named Isolation method as the method isolates the sub-pixel rounding issues. While still using percentage widths and CSS floats to push your item around, to finely tune the position you need to know where on the grid your item sits. Not susceptible to compounding rousing errors.
- **Float Clearing**: When working with items in CSS, if you want a container of a float based layout (witch both Float and Isolation methods are) to accommodate the the floats, you need to clear said floats. Peter-Paul Koch has a [great introductory writeup](http://www.quirksmode.org/css/clearing.html) on the subject.
- **Row Clearing**: Row clearing is related to float clearing. If you've got row of items, you generally don't want one row to bleed into another. Row clearing makes sure that this happens.

Now here's where things get interesting.

## Sub-Pixel Says What?

While John's article makes some very valid points about sub-pixel rounding in his article, the truth of the matter is that it's not as big of an issue as John makes it out to be on most browsers today. While he mentions IE6 and IE7 being total crap and rounding up and Webkit and Opera being no better and always rounding down, conveniently missing from that list is IE8 and up. Tyler Tate has a great writeup on [Sub-Pixel Rounding in IE](http://tylertate.com/blog/2012/01/05/subpixel-rounding.html) which says, as it turns out, that IE8 and IE9 (and thus, presumably IE10) all do the same Sub-Pixel Rounding awesomeness that FireFox does! Oh, and Google Chrome? That does it too! So with an eye toward modern browsers, let's take a look at who is exactly still effected by this issue.

According to the [W3Counter October 2012 Global Web Stats](http://www.w3counter.com/globalstats.php) Top 10 Browsers, the current version of Chrome (which has the sub-pixel fix) has a 25.15% market share, IE8 and 9 have a combined 21.93% market share, and FireFox has a combined total 22.1% market share. That's a grand total of 69.18% of global browser market totally unaffected by this Sub-Pixel Rendering issue. IE7 has a market share of 4.77%, with IE6 less than that (or unreported, can't quite find exactly which). So, those two most atrocious offenders we shouldn't need to worry about much anymore (unless, of course, you're targeting, say, China). The rest of the 26 some odd percent is a combination of old browsers, Safari, and Mobile browsers which all (generally speaking) suffer from some sort of sub-pixel rounding issue, most of them having the round down issue. The long and short of the question "is sub-pixel rendering an issue for my site" is a matter of "it depends".

## The Hidden Cost Of Outsmarting The Browser

Yup, mobile is still an issue. But remember that 10 pixel issue we had at the start? Well that's a worst case scenario, in fact the whole sub-pixel rendering issue, is enflamed not because of how pervasive the issue is in general usage, but rather at these worst case scenarios. Besides, there are bigger things that we need to consider when working with Responsive Web Design.

While the Isolation method most certainly will solve the sub-pixel rounding issue across browsers, and especially on mobile where browser choice is limited and sub-pixel rendering issues are rampant, it does something that, in my opinion, is even worse than being a pixel or two off here and there. **The Isolation method out and out breaks standard row clearing**.

## Isolation Method's Dirty Little Secret

Take a look at what standard row clearing looks like.

<!-- ![Float Row Clearing](/sites/default/files/field/image/Float%20Row%20Clearing.png) -->

Using the Float method, we get nice cleared rows with absolutely no extra markup. Why is this important? Well, for Responsive Web Design, we send one set of HTML down to the user and alter the layout using CSS. The Float method makes changing our layouts really easy without changing our markup because of its inherit row clearing abilities. Simply change your margins, widths, and floats at your given breakpoints and you've got a new grid! It's awesome, it works really well, and it's how [Susy](http://susy.oddbird.net/), one of my favorite Sass powered grid systems, works. But yes, it's still affected by the sub-pixel rounding issue.

Let's take a look at what row clearing looks like with the Isolation method.

<!-- ![Isolation Row Clearing](/sites/default/files/field/image/Isolation%20Row%20Clearing.png) -->

Those dark green parts? Those are the parts of the two rows that overlap each other. Yup! You read (and see) that right! The isolation method fixes the sub-pixel rounding issues by introducing an even worse issue, breaking row clearing! While float clearing still works, as you can see, rows clear based on the height of the last item in the row, not the tallest as in the Float method. Well how do we solve this? **_Welcome back wrapper divs!_** That's right! In order to fix row clearing with the Isolation method, each row needs to be wrapped in a clearfixed div! And for each change in row arrangement you make as you change layouts, you need wrapper divs for each row! It's not without its place in Responsive Web Design. If you've got major pieces of a site that are already cordoned off or naturally have wrappers around the rows you need, the Isolation method is a great method to use. This is what [Zen Grids](http://zengrids.com/) uses.

## Well Which One Should I Use?

As with all great question in Web Development, the answer is, it depends. I tend to prefer the tradeoffs from Float method to the Isolation method, but many many people prefer the Isolation method. I tend to find that the sub-pixel rendering issues with the Float method don't bite me in most of my day to day usage, but your mileage will vary.

<hr>

## Postscript: What If I Want To Use Both?

Well now that's an interesting question. Because both the Float and the Isolation method have different use cases and do different things well, I find that sometimes I want to use the Float method and sometimes I want to use the Isolation method. To my knowledge, there's only one grid system that allows you to switch your method based on when you need it. That's [Singularity GS](https://github.com/scottkellum/singularity). Currently in the 1.0 preview (`gem install singularitygs --pre`) and then in the 1.0 itself and going forward, you can choose which output method you want to use and when! By default, Singularity will use the Isolation method, but if set a the variable `$output: 'float';`, TADA! You've switched to the Float method. But wait, you say. What if I want to swap between the two? Well in Singularity's `grid-span` mixin, if you include the optional `$output` variable and set it to `'float'` or `'isolation'`. For example, if you had all of your output set to Float method you could change a single output to Isolation method by doing the following: `@include grid-span(1, 1, $output: 'isolation') {}`. I've been using this for a while, and I like it a lot.
