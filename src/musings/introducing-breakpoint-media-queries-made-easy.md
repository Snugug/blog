---
title: 'Introducing Breakpoint: Media Queries Made Easy'
date: 2012-06-27
summary: >
  Introducing Breakpoint, a Sass extension for making writing and maintaining media queries a breeze.
---

As anyone who has done Responsive Web Design will tell you, keeping track of your content based breakpoints ain't so easy. If you're writing plain old CSS, you would need to have a separate file or scattered inline comments telling you what each each number was meant for. Hell, even if you're using Sass, you're probably doing something similar… until now! Introducing [Breakpoint](https://github.com/canarymason/breakpoint); Media Queries Made Easy.

Breakpoint is a [Compass Extension](http://compass-style.org) jointly developed by [Mason Wendell](http://thecodingdesigner.com/) and myself with the aim of solving your media query fatigue. Designed with a mobile first, future friendly mindset, Breakpoint will help you simplify and keep track of your most common media queries while remaining powerful and flexible enough to write any complex, compound media query you'd ever want. First, let's get you installed.

```bash
gem install breakpoint
```

If you're creating a new project using Compass, you can require breakpoint from the get go, otherwise you're going to need to require it from your config.rb file.

```bash
compass create <my_project> -r breakpoint
```

```ruby
require 'breakpoint'
```

Finally, import the Breakpoint partial at the top of your working file, or into your Base partial.

```scss
@import 'breakpoint';
```

There you go! You now are ready to start using Breakpoint! Let's get started.

## The Options

Breakpoint comes with a few default options that you can change to suit your development needs.

`$breakpoint-default-media` - This is the default media type you're targeting. We've made this 'all' so that your media queries apply everywhere, regardless of if you're on a handheld, screen, tv, etc… You can override this for all of your media queries by changing this, or override them on an individual basis by passing a secondary option into the breakpoint mixin for your media type.

`$breakpoint-default-feature` - This is the default feature you're querying against. We've made this 'min-width' as we feel this is both the most common media query you're going to use, and is the proper mobile-first approach (as opposed to max-width). This feature gets used when Breakpoint sees your query is a single number. You can override this for all of your media queries by changing this, or override them on an individual basis by including the feature you want to query against when calling the breakpoint mixin.

`$breakpoint-default-pair` - This is the default feature you're querying against when you pass in two numbers to the breakpoint mixin. This will prepend the min- and max- to the feature you want to use to create a min/max pair. We've made this 'width'. You can override this for all of your media queries by changing this, or override them on an individual basis by including the base feature (without min/max) you want to query against when calling the breakpoint mixin.

`$breakpoint-to-ems` - Now here's my favorite option for Breakpoint. I know that it's much easier to think in PX, and much easier to get screen dimensions in PX, than it is in EMs, even though I know I should be writing all of my Media Queries in EMs for greater accessibility and future friendliness. By default this is set to _false_, but by setting it to _true_, you can write your media queries in whatever units you want, PX, %, or PT, and they will all be converted to EMs! How cool is that?

## Cross Browser Compatibility

Besides the awesome `$breakpoint-to-ems`, we've added in a little bonus to help make your media queries against high resolution devices cross browser compatible. Instead of querying `-webkit-device-pixel-ratio`, `-moz-device-pixel-ratio`, and `-o-device-pixel-ratio`, all of which have different, nonstandard syntaxes, you can query against simply `device-pixel-ratio` and we'll convert it into the standard `resolution` query for you! Fear not though, if you really want the prefixed versions, you can still use them for individual queries, but they won't work for min/max queries; we encourage you to use `device-pixel-ratio` for that.

## Shut Up and Take My Media Queries!

Show me how to use the damn thing already! Okay! What we're going to be doing is creating variables that we can name whatever we want with the features and values we want. Let's say our login form breaks at three different places, we can create the following three variables (I like prefixing breakpoint variables with bkpt, but it's not needed):

```scss
$bkpt-login-small: 370px;
$bkpt-login-medium: 490px;
$bkpt-login-large: 865px;
```

Then, in our Sass, we'd call the breakpoint media query with our variable, and we're set! Remember, we're building this Mobile First, so our first breakpoint is really our second set of rules!

```scss
#login {
  background: red;

  @include breakpoint($bkpt-login-small) {
    background: orange;
  }

  @include breakpoint($bkpt-login-medium) {
    background: yellow;
  }

  @include breakpoint($bkpt-login-large) {
    background: green;
  }
}
```

And the CSS that it spits out? Super clean, super simple.

```scss
#login {
  background: red;
}

@media (min-width: 370px) {
  #foo {
    background: orange;
  }
}

@media (min-width: 490px) {
  #foo {
    background: yellow;
  }
}

@media (min-width: 865px) {
  #foo {
    background: green;
  }
}
```

And if we've got `$breakpoint-to-ems` turned on?

```scss
#login {
  background: red;
}

@media (min-width: 23.125em) {
  #foo {
    background: orange;
  }
}

@media (min-width: 30.625em) {
  #foo {
    background: yellow;
  }
}

@media (min-width: 54.0625em) {
  #foo {
    background: green;
  }
}
```

That should cover 90% of your media queries, but you can get a little crazy if you want. Say you want to query between two values of a feature? Easy squeazy lemon peaty.

```scss
$bkpt-medium-not-wide: 500px 700px;
$bkpt-medium-heigh: 300px 700px 'height';

#foo {
  color: purple;
  background: yellow;

  @include breakpoint($bkpt-medium-not-wide) {
    color: blue;
  }

  @include breakpoint($bkpt-medium-height, 'screen') {
    background: red;
  }
}
```

Becomes:

```scss
#foo {
  color: purple;
  background: yellow;
}

@media (min-width: 500px) and (max-width: 700px) {
  #foo {
    color: blue;
  }
}

@media screen and (min-height: 300px) and (max-height: 700px) {
  #foo {
    background: red;
  }
}
```

For more examples, check out [Breakpoint's Read Me](https://github.com/canarymason/breakpoint/blob/master/README.markdown). If you have any questions, ping either [@Snugug](http://twitter.com/#!/snugug) (me) or [@CodingDesigner](http://twitter.com/#!/codingdesigner) (Mason) on Twitter or leave a ticket for us on [GitHub](https://github.com/canarymason/breakpoint/issues).

Happy coding, and may the Sass be with you!
