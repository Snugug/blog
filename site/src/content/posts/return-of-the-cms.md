---
title: 'Return of the CMS'
published: '2022-11-07'
summary: "After rebuilding my blog on a new generation headless CMS, I've rethought whether flat Markdown files in site code is worth the complexity, especially for JAMStack sites."
---

I really didn't like writing my last blog post. It wasn't the content. I really don't like maintaining content as flat markdown files. It's something I thought was great for a Avery long time, but the more I do it, both personally and professionally, the more I hate it. I got my start in content management systems and, while I would never return to a fat stack CMS like Drupal or Wordpress, I missed the simplicity of structured meta fields and a `textarea`, so I decided to make a change.

## The tyranny of the unstructured text box

Back when I worked at NBCUniversal, a friend of mine (also named Sam, we were "backend Sam and front-end Sam, or together, the Sams) used the phrase the phrase "the tyranny of the unstructured text box" to describe how, when presented with something totally unstructured like a blank text area, the possibilities of what to do with it can become overwhelming. Because of that, we wind up creating structure to fill the void. What I've come to realize is there's no more tyrannical of an unstructured text box than an empty Markdown file.

I love Markdown. This post is written in Markdown. I take notes in Markdown. But there may not be a greater text box tyrant than Markdown. For every project where the primary content structure is Markdown, I need to make the following _additional_ decisions:

- What flavor of Markdown am I going to use?
- What subset of features of that flavor am I going to allow?
- What missing features do I need?
- What should the syntax for those features be?
- What renderer should I use?
- How can I validate the content written?
- How can I attach meta-information to my markdown (like title, publishing date, and the like)
- How can I validate that meta-information to make sure ita structured right each time?
- How tightly do I need to couple my codebase to my particular duct-tape and string Markdown architecture?
- Can I use Markdown at all or do I need to use a variant, like MDX?

And the list goes on. The decisions I made for ChromeOS.dev have changed a number of times over it's short lifespan, but the result is always a pretty fat stack for anything non-trivial. To solve some of these problems, I've even gone so far as to write [JSON Schema powered linters](https://github.com/chromeos/chromeos.dev/tree/main/lib/linting) for the YAML frontmatter. Complexity upon complexity just to avoid a CMS. But even then, am I even really doing that?

Highly structured YAML frontmatter for meta-information. Folder based content structure. References by the grace of our build system and hopefully unique, manually-managed IDs. What I have is really an unstructured CMS whose database has been splatted across dozens of files and folders and whose rules are hidden away in opaque logic. After working this way for years, I'll take a web form, please.

## Return of the CMS

Like I said at the top, I've been doing CMSes for a long time. I started my career working in Drupal (even back then 10+ years ago advocating for what are now known as headless CMSes). I took a stab at building one while at IBM we called Punchcard. I've even tried CMSes that live on top of flat Markdown files, like the Netlify CMS. With all this in my back pocket I've gotta say, the current generation of headless CMSes are _really_ good.

!!! aside.note
While individual definitions may vary, to me, a headless CMS is one that focuses on managing content but _not_ on rendering the page a user sees (the "head"). It instead provides APIs for other systems to pull the content and display it.
!!!

I've never like fat stack CMSes because I always found they did a bad job at rendering the final website; in my Drupal days I worked really hard to undo most of what it gave me on the front-end. With Markdown files treated as code, you've got the same tight coupling problem, but in reverse! You've got a "bodyless" CMS! The tight coupling of code to content can also lead to awkward states where to deploy a feature you need to deploy content, or vice versa. For a few, small things this may be OK, but when looking to scale, thing get tough. In addition to all of the above things you need to look out for, you also now need to figure out:

- How to let others who aren't familiar with the codebase submit content
- How to review said content (which usually has a different set of needs than code)
- How to stage content not ready to be published
- _Where_ to stage content not ready to be published
- How to schedule content to go live
- How to reference other content and make sure it stays in sync

And again, the list goes on, especially if working with non-developers or you need to localize the content.

The good news is pretty much every one of the current generation of headless CMSes does all this, and does it well. It then becomes finding what their UX and DX differences are, and choosing one. Heck, you can even be like me and keep writing in Markdown (for now, anyway) and move all of the content management bits to the CMS. Where it always should have been.

This blog post is a great example. I wrote this whole post on my phone, sitting in my backyard. Without a CMS, I would have needed to get a copy of my codebase, copy my blog post entry template, edit it, write, deal with Git from my phone, then either run everything on my computer later or rely on CI to make sure nothing I did broke any of my "rules". With my CMS, I had form fields and a text box. Revisions were automatically saved and I can pick back up anywhere. I know what's missing and what's not. It's great.

## The great decomplecting

So what has this done for my codebase? Well, I now have a separate codebase for my CMS that I need to manage, but it's now only focused on one thing. Less net complexity for my content. I like it. I also mostly don't need to touch it again, so that's a one-time complexity sink.

For my codebase I've gone from dozens and dozens of files to, like, 10? A handful of components and a couple of layouts. It's so much easier for me to grok my codebase now and see what connects where and how. Piles and piles of complexity removed. I love it. And, because my content isn't tightly coupled to my code, I _also_ mostly don't need to touch it, either! From one tight coupled system where I need to touch everything to do anything to two loosely coupled systems that I basically don't need to touch to make any content changes.

---

So I'm all in on the new generation of headless CMSes. For me, they solve almost all of the problems I have with managing individual Markdown files and, ultimately, make it easier for me to both write new content and maintain my site's codebase. If you've been thinking about it, especially if you've got a JAMStack site, you should consider the switch, too.
