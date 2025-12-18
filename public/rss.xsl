<?xml version="1.0" encoding="utf-8"?>
<!--

Copyright genmon (https://github.com/genmon/aboutfeeds) under the Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported License. Modified by the author of this blog.

  https://creativecommons.org/licenses/by-nc-sa/3.0/

# Pretty Feed

Styles an RSS/Atom feed, making it friendly for humans viewers, and adds a link
to aboutfeeds.com for new user onboarding. See it in action:

   https://interconnected.org/home/feed


## How to use

1. Download this XML stylesheet from the following URL and host it on your own
   domain (this is a limitation of XSL in browsers):

   https://github.com/genmon/aboutfeeds/blob/main/tools/pretty-feed-v3.xsl

2. Include the XSL at the top of the RSS/Atom feed, like:

```
<?xml version="1.0" encoding="UTF-8"?>
<?xml-stylesheet href="/PATH-TO-YOUR-STYLES/pretty-feed-v3.xsl" type="text/xsl"?>
```

3. Serve the feed with the following HTTP headers:

```
Content-Type: application/xml; charset=utf-8  # not application/rss+xml
x-content-type-options: nosniff
```

(These headers are required to style feeds for users with Safari on iOS/Mac.)



## Limitations

- Styling the feed *prevents* the browser from automatically opening a
  newsreader application. This is a trade off, but it's a benefit to new users
  who won't have a newsreader installed, and they are saved from seeing or
  downloaded obscure XML content. For existing newsreader users, they will know
  to copy-and-paste the feed URL, and they get the benefit of an in-browser feed
  preview.
- Feed styling, for all browsers, is only available to site owners who control
  their own platform. The need to add both XML and HTTP headers makes this a
  limited solution.


## Credits

pretty-feed is based on work by lepture.com:

   https://lepture.com/en/2019/rss-style-with-xsl

This current version is maintained by aboutfeeds.com:

   https://github.com/genmon/aboutfeeds


## Feedback

This file is in BETA. Please test and contribute to the discussion:

     https://github.com/genmon/aboutfeeds/issues/8

-->
<xsl:stylesheet version="3.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:atom="http://www.w3.org/2005/Atom"
  xmlns:dc="http://purl.org/dc/elements/1.1/"
  xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd">
  <xsl:output method="html" version="1.0" encoding="UTF-8" indent="yes"/>
  <xsl:template match="/">
    <html xmlns="http://www.w3.org/1999/xhtml">
      <head>
        <title>
          <xsl:value-of select="/rss/channel/title"/>
 Web Feed</title>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1"/>
        <style type="text/css">
          *:where(:not(html, iframe, canvas, img, svg, video, audio):not(svg *, symbol *)) {
            all: unset;
            display: revert;
          }

          :root {
            --black: hsl(225, 6%, 13%);
            --white: hsl(0, 0%, 84%);
            --yellow: hsl(65, 94%, 93%);
            --gold: hsl(41, 100%, 43%);
            --plum: hsl(313, 91%, 22%);

            background-color: var(--black);
            color: var(--white);
            font-family: sans-serif;
            font-size: 125%;

            --highlight-color: var(--plum);
            --spacing: clamp(1rem, 5vw, 2rem);
          }

          strong {
            font-weight: bold;
          }

          a {
            box-shadow: inset 0 -0.4em 0 var(--highlight-color);
            transition: 300ms;
            padding: 0 0.25em;
          }

          a:hover,
          a:focus-visible {
            box-shadow: inset 0 -1.6em 0 var(--highlight-color);
            cursor: pointer;
          }

          .container {
            max-width: 65ch;
            margin: 0 auto;
            padding: var(--spacing);
          }

          .banner {
            background-color: var(--yellow);
            border: 2px solid var(--gold);
            border-radius: 5px;
            color: var(--black);
            padding: 1rem;
          }

          .min {
            font-size: .8rem;
            color: hsl(225, 6%, 55%);
          }

          header {
            margin-bottom: var(--spacing);
          }

          h1 {
            font-size: 1rem;
          }

          h2 {
            font-size: 2rem;
            margin-bottom: calc(var(--spacing) / 2);
          }

          .articles {
            display: flex;
            flex-direction: column;
            gap: calc(var(--spacing) / 2);
          }
          
          .description {
            margin-bottom: calc(var(--spacing) / 4);
            margin-top: calc(var(--spacing) / 4);
          }
        </style>
      </head>
      <body>
        <nav class="container">
          <p class="banner">
            <strong>This is a web feed,</strong> also known as an RSS feed. <strong>Subscribe</strong> by copying the URL from the address bar into your newsreader.
          </p>
          <small class="min">
            Visit <a href="https://aboutfeeds.com">About Feeds</a> to get started with newsreaders and subscribing. It's free.
          </small>
        </nav>
        <main class="container main">
          <header>
            <h1>
              <!-- https://commons.wikimedia.org/wiki/File:Feed-icon.svg -->
              <svg xmlns="http://www.w3.org/2000/svg" version="1.1" style="vertical-align: text-bottom; width: 1.2em; height: 1.2em;" class="pr-1" id="RSSicon" viewBox="0 0 256 256">
                <defs>
                  <linearGradient x1="0.085" y1="0.085" x2="0.915" y2="0.915" id="RSSg">
                    <stop offset="0.0" stop-color="#E3702D"/>
                    <stop offset="0.1071" stop-color="#EA7D31"/>
                    <stop offset="0.3503" stop-color="#F69537"/>
                    <stop offset="0.5" stop-color="#FB9E3A"/>
                    <stop offset="0.7016" stop-color="#EA7C31"/>
                    <stop offset="0.8866" stop-color="#DE642B"/>
                    <stop offset="1.0" stop-color="#D95B29"/>
                  </linearGradient>
                </defs>
                <rect width="256" height="256" rx="55" ry="55" x="0" y="0" fill="#CC5D15"/>
                <rect width="246" height="246" rx="50" ry="50" x="5" y="5" fill="#F49C52"/>
                <rect width="236" height="236" rx="47" ry="47" x="10" y="10" fill="url(#RSSg)"/>
                <circle cx="68" cy="189" r="24" fill="#FFF"/>
                <path d="M160 213h-34a82 82 0 0 0 -82 -82v-34a116 116 0 0 1 116 116z" fill="#FFF"/>
                <path d="M184 213A140 140 0 0 0 44 73 V 38a175 175 0 0 1 175 175z" fill="#FFF"/>
              </svg>

              Web Feed Preview
            </h1>
            <h2>
              <xsl:value-of select="/rss/channel/title"/>
            </h2>
            <p>
              <xsl:value-of select="/rss/channel/description"/>
            </p>
            <a target="_blank">
              <xsl:attribute name="href">
                <xsl:value-of select="/rss/channel/link"/>
              </xsl:attribute>
              Visit Website &#x2192;
            </a>
          </header>
          <h2>Recent Items</h2>
          <div class="articles">
            <xsl:for-each select="/rss/channel/item">
              <article>
                <h3>
                  <a target="_blank">
                    <xsl:attribute name="href">
                      <xsl:value-of select="link"/>
                    </xsl:attribute>
                    <xsl:value-of select="title"/>
                  </a>
                </h3>
                <p class="description">
                  <xsl:value-of select="description"/>
                </p>
                <small class="min">
                Published: <xsl:value-of select="pubDate" />
                </small>
              </article>
            </xsl:for-each>
          </div>

        </main>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>