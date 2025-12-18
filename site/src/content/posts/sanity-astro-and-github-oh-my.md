---
title: 'Sanity, Astro, and GitHub Oh My!'
published: '2022-11-25'
summary: 'Why I chose Sanity and Astro for my site rebuild, and how I got continuous deployment working for both using GitHub Actions from a monorepo-like setup.'
categories:
  - 'Web Development'
---

Following my realization that I no longer want to deal with [flat Markdown files](/musings/return-of-the-cms/), I decided I wanted to rebuild my site. I had a few requirements for doing so: I needed the ability to manage fairly complex content models (my recipes are weirdly complicated to model), I needed migration to be quick because I didn't want to spend a bunch of time on it, and I needed to be able to generate pages from API calls. This lead me on a journey to totally rebasing my site's stack.

## Content management

I've got a long history with content management systems; I got my start, as a career, as a back-end developer, as a front-end developer, as a content strategist, as public speaker, and as a project leader in [Drupal](https://drupal.org/). My first four jobs were all doing work in and around content management. When I left NBCUniversal for IBM, I did so in no small part to expand my knowledge outside of CMS-driven sites, only to work on building an early Node.js headless CMS we called [Punchcard](https://github.com/punchcard-cms). By the time I left, I was once a again working on a Drupal powered website. Needless to say, I have a lot of _feelings_ about content management systems.

Like I mentioned in [Return of the CMS](/musings/return-of-the-cms/), the current field of headless CMSes ticks a lot of CMS boxes for me. After looking at a bunch of them and talking with a few other people, I decided to try my hand at migrating my content to [Sanity](https://sanity.io/). There's a bunch I really like about Sanity: content modeling is super solid, including the ability to model complex, repeatable, and repeatable complex fields and it's super customizable. It even has one of my "pet peev" features that I find missing from most content management systems: differentiating between fields that are required to publish and those required to save (in Sanity, fields marked "required" are required for publishing, but it's data model makes none strictly required to save, which is good enough for my needs). So I went to work. I also really like the idea of [PortableText](https://github.com/portabletext/portabletext), a JSON spec for defining structured block content that can be used for everything from WYSIWYG editors to HTML, Markdown, and more, although I confess I haven't implemented it yet.

I dove in to see what I could do. I made a few test posts using their blog template as a starting point. It worked well. I ran it locally and poked around with the API; by default it's got its own query language called [GROQ](https://www.sanity.io/docs/how-queries-work) which works well enough; they also offer GraphQL but I never really loved that so I haven't enabled that yet. After an initial proof of concept, I moved all my content types into it, and was happy.

When I initially built out my instance, I had used v2. Sanity v3 is [coming soon](https://www.sanity.io/blog/sanity-studio-v3-developer-preview) and is currently in release candidate. Whereas v2 feels very much like a fully cusom tack, v3 has been totally rebuilt, runs [Vite](https://vitejs.dev/) (which I love) and now feels like a regular webapp. Some plugins (like the markdown editor I'm writing this in) are still a work-in-progress, but I like the codebase so much more I'm mostly OK with it. So, content codebse sorted, now my front-end.

## Site codebase

My previous site was built on [Eleventy](https://11ty.dev/) and I was mostly happy with that for a long time. But the more I used it, the more some rough edges started to annoy me. I don't have much JavaScript on my site, but I've got some, and I've got a lot of CSS and even with my [solution for 11ty and Vite](/musings/eleventy-plus-vite/), they still feel like two separate things trying to compete for ownership of my `dev` script. I've also lost patience with the templating solutions provided; work on my [health tracking app](/musings/a-beginners-guide-to-diabetes/#tracking-my-health) with [Svelte](https://svelte.dev/) has made me realize just how much is missing from those systems. Then there's page generation. I've done a lot of work figuring out how to scale this in 11ty and I don't love the overriding of pagination to accomplish this. Finally, while I really love 11ty's data cascade, once I remove my flat Markdown files, a lot of their utility goes away. So started exploring other options.

I looked at a bunch of other static site generators (SSGs), with a focus on low to zero JS output and support for modern templating options. I eventually settled on [Astro](https://astro.build/); like 11ty it's aggressive about not outputting JavaScript, even for non-Astro components, and it deeply integrates with Vite, which I also really like (although I wish link and script tags would get compiled like they do for standard Vite builds). But it was my experience when I started integrating the content API that I really decided it was worth a full rebuild.

Unlike 11ty, page generation in Astro is done based on folder structure, but file names can have params in them, which feels much more like building routes in a dynamic server. This, to me, feels really natural when coupled with an API. A lot of the struggle I had with managing layouts and cascading data and generating pages disappears with this paradigm. Adding in modern component frameworks for handling reusable UI (instead of Nunjucks macros or shortcodes) also made me more productive, to the point where I was able not only to rebuild my site in a weekend, but do a top-to-bottom refresh of it while adding new features (hello RSS feed and sitemap) to boot!

With Sanity and Astro, I think I've finally found a winning combo for me blogging more and doing a better job at maintaining my website. The only thing I needed to figure out was continuous deployment now that my content and my site are disconnected.

## Continuous deployment

I've loved [GitHub Actions](https://github.com/features/actions) for a long time, but their documentation is a little obtuse and testing is hard and mostly done live, so it took me a while to figure out how to combine all of the above into a nice package.

The first, and most important bit, was finding the [`repository_dispatch`](https://docs.github.com/en/actions/using-workflows/events-that-trigger-workflows#repository_dispatch) workflow trigger that lets GitHub Actions run off of a webhook call! Perfect, I thought, as Sanity can be configured to send webhooks when content deploys! Except, and rightfully so, the webhook that GitHub actions requires is pretty secured; it requires a a beta fine-grained GitHub access token with read and write code access and has a max 1-year lifespan, and the structure of the webhook needs to be very specific. Unfortunately, this means Sanity can't just call the action directly, you need something in the middle. A serverless function would be great here, but I wound up going with [Pipedream](https://pipedream.com/). Even now, I don't know why specific dispatch names don't work, but a generic one does, so that's still a work-in-progress, but it works, so that's what matters!

The second thing I needed to do was figure out how to keep my CMS codebase and my site codebase together in the same repo, because I didn't want to maintain them in different places. To do this, I leaned on the [`paths`](https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions#onpushpull_requestpull_request_targetpathspaths-ignore) workflow push filter, letting me run different GitHub Actions depending on whether code was pushed to my CMS or to my site. While experimenting with this, I also found that if you have multiple GitHub Actions with jobs with the same id (like `test-build`) and make that required for a protected branch, it'll work regardless of which Action runs! This means I can protect my main branch regardless of if I'm working on my CMS or my site!

To keep everything secure, I use a combo of `.env` files locally with my Sanity project and a Sanity API token for reading content for my site, and have GitHub Secrets to supply those during my GitHub Actions build. To deploy my Sanity studio, I do the same, but have a separate deploy token that gets injected during my Action run. The only thing that was a little annoying is the environment variables when working with Sanity is that the required names are specific, so you can't choose the names you want and pass them in where you want. That's easy to overcome, though.

---

I'm super excited about this new setup and workflow, and am making plans for how to expand on it to allow for previews using Astro's server-side render (SSR) mode. I also have been playing with [pnpm](https://pnpm.io/) and migrated my codebase to that, too, with this, and I'm really loving that, too. The only gotcha here was getting [Husky](https://typicode.github.io/husky/#/) to work right, the `prepare` script needs to run from the site root and the hooks need to `cd` to the folder they're in. If you want to see how the above shakes out, here's some deep links to my [site source](https://github.com/Snugug/blog/tree/e85221063403074088e6ddeb804d88648d88d29e) as it looks at time of publishing:

- GitHub Actions
  - [Site build/deploy](https://github.com/Snugug/blog/blob/e85221063403074088e6ddeb804d88648d88d29e/.github/workflows/tbd-site.yml)
  - [CMS build/deploy](https://github.com/Snugug/blog/blob/e85221063403074088e6ddeb804d88648d88d29e/.github/workflows/tbd-cms.yml)
- Codebases
  - [CMS](https://github.com/Snugug/blog/tree/e85221063403074088e6ddeb804d88648d88d29e/cms)
  - [Site](https://github.com/Snugug/blog/tree/e85221063403074088e6ddeb804d88648d88d29e/site)
- Husky
  - [Husky prepare for CMS](https://github.com/Snugug/blog/blob/e85221063403074088e6ddeb804d88648d88d29e/cms/package.json#L15)
  - [`pre-commit` hook](https://github.com/Snugug/blog/blob/e85221063403074088e6ddeb804d88648d88d29e/cms/.husky/pre-commit)
