---
title: 'Principles of Responsive Web Design'
published: '2012-05-24'
summary: "I've spent almost the last year learning about and really digging into responsive Web design and I've gotta say, there are very few things that excite me more in front end development today. It is the beginning of a new era of the Web."
categories:
  - 'Web Development'
  - 'Responsive Web Design'
---

I've spent almost the last year learning about and really digging into responsive Web design and I've gotta say, there are very few things that excite me more in front end development today. It is the beginning of a new era of the Web, an era that has its root in the launch of the iPhone five years ago which brought with it a fully capable Web browser to the pockets of the masses. There was really only one issues with this, up until this point, just about every website had been designed for a desktop screen and therefore didn't look or work their best at the new small form factor. A couple of years later, the Web development community got a new way of thinking about Web design when [Ethan Marcotte's Responsive Web Design](http://www.alistapart.com/articles/responsive-web-design/ 'A List Apart: Articles: Responsive Web Design') and [Luke Wroblewski's Mobile First Design](http://www.lukew.com/ff/entry.asp?933 'LukeW | Mobile First') philosophies were published. (As an aside, both Ethan and Luke have written books on the subjects that you should absolutely read, which are available as a bundle from [A Book Apart](http://www.abookapart.com/products/mobile-first-responsive-web-design-bundle 'A Book Apart, Mobile First and Responsive Web Design Bundle')). With this knowledge in hand, and shaped by personal experience and other expert's research and teachings, I went about forming my personal Principles of Responsive Design. Below is an attempt to codify my knowledge so that I can share it with the communities I'm lucky enough to be a part of, and so I never again have a less than ideal browsing experience on any of the devices I choose to surf the Web with.

## The Web is a Medium

Of all of the concepts of responsive Web design (thus-forth known as RWD), this is the most important one, it's _raison d'être_. Since the web's inception, and through this day, we have been trying make the Web behave like print design, to differing degrees of success. In order for RWD to flourish, we need to take to heart the words of [Ethan Maracotte](https://twitter.com/globalmoxie/statuses/192282944944091136): "the Web is an inherently unstable medium."

While there are many similarities between print and Web as mediums, and many concepts from print translate well onto the web, many more do not belong, the most prevalent being a fixed size. There is a reason fixed sized websites are so prominent, it's because it is very easy to design to a known size, a page metaphor if you will, especially for print designers who are use to working with set paper dimensions. It's easier to control your design when you control its dimensions, so designers took to determining what dimensions a "web page" should be, and we all generally settled on a 960px grid based on statistics about desktop browser size. There's just one problem with that, as [Brad Frost has brilliantly put it](http://bradfrostweb.com/blog/web/responsive-web-design-missing-the-point/ 'Responsive Web Design: Missing the Point | Brad Frost Web'):

![What is the Web](/images/principles-responsive-web-design/the-web.jpg 'What is the Web')

> The point of creating [responsive] sites is to create functional (and hopefully optimal) user experiences for a growing number of web-enabled devices and contexts.
>
> ~ Brad Frost

Print is easy; we can control the colors, the print size, the font size, we even have a pretty good idea about where, when, even how far away it is going to be viewed. There is a very limited number of ways to interact with print media, and those are fairly easy to control. In these respects, the Web is the polar opposite of Print, and rapidly becoming more so. As Brad says, RWD is a design process aimed at rectifying inherent lack of stability in the medium. It requires new ways of thinking about design, of user interaction, of user experience; a truly holistic approach to the wants, needs, and capabilities of an ever increasing number of Web connected devices. RWD is the groundwork for us to start to embrace the instability and move us away from the want to always be in absolute control of our designs, because when you look at the Web through RWD tinted glasses, pixel perfect will drop from your vocabulary faster than a missile that has all of a sudden become a pot of petunias.

With that being said, all is not lost in the need to control our design. Thanks to a feature in modern Web browsers called media queries, we as designers now have the tools needed to be able to transform our designs when they no longer are optimal for our content. We are able to not just shift columns around, but potentially providing an entirely new experience when our designs break; by embracing the instability, we are able to potentially provide previously unimaginable flexibility with our designs. There's just one problem with the existing design workflow: [you can't articulate fluidity on paper.](https://twitter.com/brad_frost/statuses/195245787150688256). We, as designers, need to close our print tools and open up our Web tools if we are going to succeed in developing responsive websites. Just like how we use the print medium itself to sketch, draw, paint, and create print items, we need to use the Web as its own medium for creation. We need to start designing our websites where they are going to live and with the tools used to bring them to life. We need to start designing in our browsers.

## Design In Browser

A static Photoshop mock isn't cool. You know what is cool? A living mock. Anyone who has ever translated a Photoshop mock into a website knows the hassle of needing to translate print designs into the language of the Web. With the widespread implementation of most of the visual flair we are accustomed to from Photoshop built into modern Web browsers (even fancy Web fonts!), we have the toolset needed to create stunning websites without any graphics at all, all within our browsers. What this means, to borrow a phrase from my friend Mason Wendell, is that all designers should be [Coding Designers](https://github.com/canarymason/survival-kit). Yes, this means that all designers need to know HTML and CSS; if they don't, it's like a chef that knows where to buy the best ingredients but not how to prepare them.

Let me step back a minute; it's not that Photoshop isn't cool, it's that using _any_ bitmap tool for RWD to build anything except bitmap images is functionally impractical. Not only do you have all of the limitations already inherit with using a print tool to design for the Web, you also run into the issue of needing to create different mocks for every content based break point, which is not only hard to do in a bitmap tool, but it's a hell of a lot of extra mocks you're going to need to make. Practically, that's hours of extra work plus hours extra for each design iteration. Designing in browser allows you to iterate quickly over the full range potential break points. Throw in version control, and you've got a quick and easy way to show multiple mocks with real content very easily.

Designing your website in browser also gives you insight into your design you wouldn't have otherwise, such as how it looks with real and variable content, how it looks and how it needs to change as browser size increases and decreases, how the design actually performs, how it renders in a wide array of devices and browsers, in an array of circumstances (like on a train, on the street, at your desk, in the coffee shop down the block), and a slew of other things. It also provides quite a few benefits to the design process, like a final product that can either be used or very easily translated at the end of the design process and, if using a CSS preprocessor like [Sass](http://sass-lang.com/ 'Sass - Syntactically Awesome Stylesheets') (which I highly recommend you do), major style elements, such as colors and typography, can be changed very easily on the fly and rendered nearly instantaneously. Designing in browser allows you to build the products of the Web with the tools of the Web in the languages of the web.

## Mobile First

If you're building a RWD site, you need to, as championed by Luke W, design for Mobile First. By designing for the Mobile First, you are setting a lowest common denominator to build from; one of slow connection speeds, impatient users, unconventional input methods, underpowered browsers, and amazingly cool APIs. But, when discussing Mobile First design, it is worth separating design and development. Many projects understand and implement, to some extent, the development side of Mobile First while neglecting the design side, unfortunately usually to the detriment of the end user.

Before we continue, let me step back and define what I mean when I say mobile. To quote Cennydd Bowles "[mobile is a user state, not a device](https://twitter.com/brad_frost/statuses/192281875434319872)." When I mention mobile, I'm talking about a user potentially on the go, probably on an unreliable connection with medium to low bandwidth who, to use [Kristofer Layton's Theory of Mobile Motivation](http://kristoferlayon.files.wordpress.com/2012/03/klayonsxsw2012.pdf), values content and navigation above built-in social sharing and visual and technical flair. They are usually on small devices with quirky browsers, using anything and everything but a mouse to navigate, and value their time highly. [As Gomez reports](http://www.gomez.com/wp-content/downloads/19986_WhatMobileUsersWant_Wp.pdf) 75% of Mobile users are willing to abandon a site if it takes more than 5 seconds to load with 80% willing to spend more time on a website if the experience was fast and reliable. The cost of not taking the mobile user into account? 57% will neither return to your site after a bad experience nor recommend it to others. [Mobile users make up 88% of the US Adult Population](http://pewinternet.org/Commentary/2012/February/Pew-Internet-Mobile.aspx) with 46% of the US Adult population using a smartphone, a year over year increase of more than 1% of the population _per month_. There are now more than [five times the number of mobile device activations per day than human births](https://twitter.com/Snugug/statuses/182849284054581250), each one of them a mobile user. If you are not designing with the mobile user in mind first, you are neglecting your users.

Now, what does this mean for development? Well, actually, Mobile First development can be a fairly easy concept to grasp as it is really no more than a reiteration of Web development best practices: keep load times as low as possible, keep assets as small as possible, keep http requests to a minimum, make sure you site doesn't break if a browser feature is unavailable, and build using browser-independent modern Web standards (HTML, CSS, and JavaScript). When talking about Mobile First, we are also usually talking about HTML5 as well, so to these best practices we should also add light, semantic markup which, by it's nature, begs for a content-first approach to your site. Your source order should match the importance of content.

Mobile First design, on the other hand, is much less tangible, and requires a shift in thinking. There are three parts to Mobile First design (and really design in general): User Interface, User Experience, and Information Architecture (UI, UX and IA). In order to have a successful site, all three of these need to be done right, and all three of these should start Mobile First.

> Mobile devices require software development teams to [focus on only the most important data and actions](http://www.lukew.com/ff/entry.asp?870) in an application. There simply isn't room in a 320 by 480 pixel screen for extraneous, unnecessary elements. You have to prioritize.
>
> So when a team designs Mobile First, the end result is an experience focused on the key tasks users want to accomplish without the extraneous detours and general interface debris that litter today's desktop-accessed Web sites. That's good user experience and good for business.
>
> ~ Luke Wroblewski

A Mobile First design approach requires you to step back and take a good, hard look at what is most important to your visitors and can give you leverage to cut cruft from your website. Luke has a phrase he likes to use when describing a mobile user: "[[they have] one eyeball and one thumb](http://www.alistapart.com/articles/organizing-mobile/)". What this means is a mobile user is going to devote limited resources to trying to figure out your website and if you haven't architected your site to present your content as quickly and easily as possible, you're mobile user isn't going to see it.

But, this doesn't mean you should make a curated mobile experience, oh no! [Our job is not to willy-nilly strip out useful features. Anytime you say, somebody won't want that on mobile, that's not mobile content… you're wrong.](http://globalmoxie.com/jhc/prez/mobile-myths.pdf) Anything a user can, will, and expect to be able to do sitting in front of a desktop computer they can, will, and expect to be able to do from their handheld one; [people use any platform to do anything](http://www.cxpartners.co.uk/cxblog/mobile-app-or-mobile-web/). As [Josh Clark puts it](https://twitter.com/brad_frost/statuses/192198577605455874), "the myth that "mobile = less" mentality is wrong and damaging. Don't confuse context with intent." In fact, as [Cennydd Bowles says](https://twitter.com/globalmoxie/statuses/192280314452779008), "assuming user intent from simple device context is a "classic error."" Your site needs one to one content parity regardless of the device or screen size it is being viewed from. Use tools like location and time to determine context and assist in rearranging content, but not device and not to remove content.

By thinking about our sites in a Mobile First and content first approach, we are able to better architect our sites, which in turn leads to building better UX for our visitors and by then by extension, a better UI. Additionally, because this approach forces us to IA and UX for Mobile First, we are able to carry over our "one eye, one thumb" thinking to our "desktop" (re: large width) layout, improving _everyone's_ experience and not just the mobile user's. Even devices and browsers we may otherwise consider unsupported.

## Progressive Enhancement and Graceful Degradation

Both Progressive Enhancement and Graceful Degradation are two sides of the same coin: best practices for Web design. Progressive Enhancement is a ground up approach to Web design where you design for the lowest common denominator and, as features become available, you add more. This approach fits in most nicely with our Mobile First design approach which, in fact, is a form of Progressive Enhancement. Graceful Degradation, on the other hand, is a top down approach where you build a feature and then provide fallbacks when features are not available. Anything and everything you build should keep these concepts in mind because they both strive for the same end goal: being able to display your content no matter the device used to access it, including those you may consider unsupported. This a core tenant of the Web as a medium. Always bear in mind that the Web is an inherently unstable medium, and if we think in a Progressive Enhancement mindset, [that means that layout is itself an enhancement](https://twitter.com/globalmoxie/statuses/192282944944091136).

Speaking of layout and Progressive Enhancement, Joni Korpi has a [great article about just that](http://jonikorpi.com/leaving-old-IE-behind/). The gist of it is that, instead of trying to mimic media queries on unsupported browsers _including Internet Explorer 8 and below_, you serve a single column website and use media queries to build out your layout, instead of designing a desktop layout and using media queries to shrink it. This is the ideal for Mobile First design as well as it will serve a fluid, single column layout to mobile devices of a certain size and outdated browsers. The best part about this approach to layout is its hack free, JavaScipt free, almost thought free lowest common denominator.

One important thing that is an absolute must if you're building progressively is that, under no circumstances, should you be browser sniffing or using device detection to see if a user can use your site. Not only are these methods unreliable but they're unsustainable as well. For instance, there are currently five desktop versions of Internet Explorer and at least two mobile versions, Google Chrome's UA is set up to trick browsers into thinking it's Firefox, and there are over one thousand different types of Android devices either currently or previously on the market worldwide. If you want to make sure your user can use a feature, do the logical thing and _feature detect_. There is an amazing tool called [Modernizr](http://modernizr.com/) that is designed specifically to do feature based section to aid with development. If you absolutely must have a feature that isn't available, there are amazing polyfills and shivs being written to combat browsers lacking in features. Don't deny your user your content because of how they got to it, make sure it works, on some level, regardless.

## The Fluid Grid and Content Breakpoints

As [Scott Kellum jested](https://twitter.com/ScottKellum/statuses/182461146660474880): "You can tell a site is “web 3.0” if it’s built on a grid." It's funny 'cause it's true. A responsive site really needs to be built on a grid, _any grid_, as long as it's something you stick to and can scale in a fluid manner. Now this isn't to say your grid cannot change as you scale, but you need to build to a grid and the grid needs to be fluid.

As [John Albin so precisely puts](http://zen-grids.com), if you're going to be doing RWD, you really need to be using a CSS Preprocessor (of which we would both recommend [Sass](http://sass-lang.com)). The concept of a grid is easy, but when actually trying to implement one, especially a fluid one, the math can get complicated very quick, and grid classes are not only not semantic but break the separation of concerns between HTML and CSS. Both of these issues are solved by using a CSS Preprocessor to deal with the math for you, and to put your widths straight on the selects you're targeting instead of needing to edit your HTML to deal with styling. If you take a look at my source, you won't see any grid classes, only light, semantic widths and margins built with the use of Sass, [Susy](http://susy.oddbird.net/), and [Aura](https://github.com/snugug/aura).

With a grid set up, lets talk about physically designing on a fluid grid. Following our Mobile First mindset, the very first thing we design is our single column layout, more commonly described as our small screen or mobile layout. As [Brian and Stephanie Reiger say](https://twitter.com/brad_frost/statuses/192282902472564740), "the absence of support for media queries is indeed the first media query." [Ethan Marcotte reiterates that point](https://twitter.com/brad_frost/statuses/192282883929554944):

> Avoid starting large then shrinking down. Approach layout from a Mobile First approach. Fits in with progressive enhancement.

After a single column theme has been built, what next? The are many advocates of, and many responsive frameworks that work by, setting your breakpoint, or where your design changes, based off of known device sizes. This usually means non-retina iOS dimensions in landscape and portrait with maybe the addition of one in between iPhone and iPad and maybe one wide Desktop dimension. If you think that Android, Blackberry, and Windows Phone 7 all have a standard screen size that you could also break to, [let me](http://en.wikipedia.org/wiki/List_of_Windows_Phone_devices 'Windows Phone') [dash those](http://supportforums.blackberry.com/t5/Java-Development/List-of-Blackberry-Devices-with-resolution/td-p/556066 'Blackberry') [hopes and dreams](http://en.wikipedia.org/wiki/Comparison_of_Android_devices 'Android'). Overall, this seems amazingly short sighted to me (and pretty much everyone doing RWD professionally) and, possibly more importantly, neglects one of the core tenants of RWD: the Web is an inherently unstable medium. But even more practical than that, why would you want to shoehorn your design into known device dimensions when building breakpoints based on when your content needs it ensures it looks it's best on _all_ platforms.

> Start with the small screen first, then expand until it looks like shit. TIME FOR A BREAKPOINT!
>
> ~ [Stephen Hay](https://twitter.com/brad_frost/statuses/191977076000161793)

Content based breakpoints are surprisingly easy, as Stephen says, keep expanding your window until your content looks crap, then put a breakpoint there. There are a plethora of tools out there to get your window's screen size for your break point so there's no excuse not to do it this way. If you're using Sass 3.2 or higher, in fact, your life just became super easy! Instead of needing to remember all of your breakpoints by number, you can remember them by name! You can write a mixin like the following for all of your breakpoints:

```scss
// Four breakpoints: foo, bar, baz, and qux.
//
// Foo assumes the defaults of min-width and screen. Foo will gen @media screen and (min-width: 500px)
// Bar changes min-width to max, but assumes screen as well. Bar will gen @media screen and (max-width: 700px)
// Baz wants to use min-width, but change media type, so min-width needs to be re-declare. Baz will gen @media tv and (min-width: 700px)
// Qux goes all out and has a full unique media query. Qux will get @media tv and (max-width: 900px)

$breakpoints: 'foo' 500px, 'bar' 700px 'max-width', 'baz' 700px 'min-width' tv, 'qux'
    900px 'max-width' tv;

// Let's call respond-to!
#waldo {
  background: red;

  @include respond-to('foo') {
    background: green;
  }

  @include respond-to('bar') {
    background: yellow;
  }

  @include respond-to('baz') {
    background: purple;
  }

  @include respond-to('qux') {
    background: orange;
  }
}

// Our Output:
#waldo {
  background: red;
}

@media screen and (min-width: 500px) {
  #waldo {
    background: green;
  }
}

@media screen and (max-width: 700px) {
  #waldo {
    background: yellow;
  }
}

@media tv and (min-width: 700px) {
  #waldo {
    background: purple;
  }
}

@media tv and (max-width: 900px) {
  #waldo {
    background: orange;
  }
}
```

```scss
// Our respond-to mixin, with the new hotness?
// A little more complicated than previous respond-to mixins, but now runs off of a variable. This is also Rev 1 so if someone can help me make it better, I'm all ears.
// We need to start with a defaulted breakpoints variable.

$breakpoints: false !default;

@mixin respond-to($context) {
  @if $breakpoints != false {
    // Check to see if the 2nd item is a number. If it is, we've got a single query
    @if type-of(nth($breakpoints, 2)) == 'number' {
      // Check to see if the context matches the breakpoint namespace
      @if $context == nth($breakpoints, 1) {
        // Call Media Query Generator
        @include media-query-gen($breakpoints) {
          @content;
        }
      }
    }
    // Else, loop over all of them
    @else {
      // Loop over each breakpoint and check context
      @each $bkpt in $breakpoints {
        // If context is correctâ€¦
        @if $context == nth($bkpt, 1) {
          // Call the generator!
          @include media-query-gen($bkpt) {
            @content;
          }
        }
      }
    }
  }
}

// This functionality gets used twice so I turned it into its own mixin.

@mixin media-query-gen($bpt) {
  // Get length of breakpoint variable, minus the namespace
  $length: length($bpt);
  // Go through all of the breakpoint items, starting at the second, and add them to a variable to be passed into the media query mixin
  $mq: false !default;
  @for $i from 2 through $length {
    // If it's the first item, override $mq
    @if $i == 2 {
      $mq: nth($bpt, $i);
    }
    // Else, join $mq
    @else {
      $mq: join($mq, nth($bpt, $i));
    }
  }
  // Call Media Query mixin
  @include media-query($mq) {
    @content;
  }
}

// Slightly modified version of my Media Query Mixin (https://gist.github.com/2490750) from earlier, modified to accommodate list input
@mixin media-query($value, $operator: 'min-width', $query: 'screen') {
  // If a list is passed in for value, break it into value, operator, and query
  @if type-of($value) == 'list' {
    $mq: $value;

    @for $i from 1 through length($mq) {
      @if $i == 1 {
        $value: nth($mq, 1);
      } @else if $i == 2 {
        $operator: nth($mq, 2);
      } @else if $i == 3 {
        $query: nth($mq, 3);
      }
    }
  }

  @media #{$query} and (#{$operator}: #{$value}) {
    @content;
  }
}
```

The other issue I have with device based breakpoints is all they do is enforce the printed page metaphor with varying fixed page sizes instead of a single one (think designing a flyer, a brochure, and a business card instead of a website). As [Rachel Hinman says](https://twitter.com/brad_frost/statuses/192239397855440896), "the "page" metaphor holds us back from creating truly great mobile experiences". Device breakpoints are a wolf in sheep's clothing; passing itself off for RWD when in reality it's more of the same static design (even with a fluid grid).

## Design Natural User Interfaces, not Graphical Ones

If there is one thing to come out of the iPhone that is the fundamental defining feature of the device, multitouch would be it. It's an entirely new way of interacting with the content on your screen by actually _interacting with it_. [Pinch, swipe, tap, hold](http://www.lukew.com/ff/entry.asp?1071); these simple gestures are such a change from the point, hover, click nature of desktop interaction that many of the traditional graphical enhancements relied upon need to be rethought or thrown out altogether. As [Rachel Hinman says](https://twitter.com/globalmoxie/statuses/192247950817234944), "the legacy inertia of [graphical user interfaces] holds back [natural user interfaces] progress" and that "buttons are hacks". So what's a dev to do? Mobile First and Progressive Enhancement to the rescue! Build uncluttered, easy to use, large user interfaces (fingers are a much larger input device than the pixel perfect precision of a mouse) and do not rely upon proxy navigation of your content (hover states, for instance, _do not work_ on Mobile). If touch is available, utilize it! If you don't know what touch gestures are available, [Luke W has you covered once again](http://www.lukew.com/ff/entry.asp?1071). Make galleries and carousels swipeable! Turn context menus into hold menus! If not, make sure you have fallbacks! The point of Natural User Interfaces, like Mobile First, isn't to absolutely do away with Graphical ones, but rather to take our design queues from it, design towards that ideal, and present a gracefully degraded solution when our ideal isn't met.

One of the best examples of a true Natural User Interface is an iOS app called [Clear](http://www.realmacsoftware.com/clear/). Clear is a todo app where you pinch, pull, swipe, and tap to accomplish all of the normal todo actions, with the difference being that the controls _are_ the interface, and a beautiful interface it is. One of the toughest things with Natural User Interfaces is building interactions that need no explanation (or whose explanation can be hinted at while using), and Clear does this marvelously. What's more, if you're saying to yourself "but that's a native app, we can't do that in browser!", take a look at [HTML5 Clear](https://github.com/yyx990803/HTML5-Clear-v2). Check out the Clear promo video below to get a sense of how a great Natural User Interface works.

@[vimeo](https://vimeo.com/37182785)

Somewhere about this time, if you've been designing according to these principles, you're going to have an epiphany. When designing responsively from a content first perspective on a semantic framework, you're going to realize that, even totally devoid of CSS and JavaScript, your site is mobile optimized. As Scott Kellum says, this is a big deal because "after this epiphany it becomes impossible to set styles then override them when no style at all will do just fine." Let this epiphany guide you toward the Natural UI light and away from the Graphical UI dark.

An important point to this, though, is that Natural does not mean "mimicking the UI of native apps." Natural means natural to anyone on any platform, not natural to those on iOS or Android. As [Cennyyd Bowles says](https://twitter.com/bdconf/statuses/192280842272374784), "if you're trying to make a cat look more like a dog, just buy a dog." Don't fake native app UI, if you want a native app, build a native app, and, for the love of god, whatever you do, don't put a back button on your website. Every Web browser in existence has a built in back button that works better than yours, is more device agnostic than yours, and is more well integrated than yours. Now I can get behind swiping back and forth for forward and back in history (go ahead, try it now, two fingers for those devices that support it), but don't you dare put an actual back button on your site.

## And, In The End, the Love You Take is Equal to the Love You Make

To me, these Principles of Responsive Design all boil down to one thing: being [Future Friendly](http://futurefriend.ly/resources.html). Gartner predicts that [by next year, mobile devices will surpass desktop devices as the most common way to access the Internet worldwide](http://www.gartner.com/it/page.jsp?id=1278413). I feel as if that needs repeating. Not in 10 years, not in 5 years, not even in 1 year. In less than 8 months, worldwide, a user will be more likely to access your website from a mobile device than a desktop device. The writing is on the wall already, with more than 2 times the number of mobile device activations than [traditional computers sold per day](http://www.worldometers.info/computers/). Because of this we, as the keepers of the web, need to take these principles to heart when we talk to our clients and build our sites. By treating the Web as its own medium, by designing in browser instead of bitmap editors, by designing for Mobile First, by building our sites progressively, by making layout changes content based and device agnostic, and by designing natural user interfaces better suited for both mobile and desktop as opposed to graphical for only desktop, we will be building websites that are best viewed on any Web enabled device for the foreseeable future. To borrow a phrase from Gandhi, we need to be the change we want to see in the web.
