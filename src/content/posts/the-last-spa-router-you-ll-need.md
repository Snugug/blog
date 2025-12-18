---
title: "The Last SPA Router You'll Need"
published: '2024-12-23'
summary: "The Navigation API provides a standards-based way to build a client-side router that can be used with anything you desire to build your front-end in. I'll show you how I used it to rebuild the CMS for my photography site, and why the new Runes feature of Svelte 5, when combined with this, make for a truly killer combo."
---

I went through a number of iterations on how to manage my images over on [snugug.photography](https://snugug.photography). I started with doing everything in Lightroom (my desktop library manager of choice) and extracting the EXIF data at build time to grab everything I needed from there. This had a few problems, the biggest being that while I _could_ write titles, descriptions, and alt text in Lightroom, that it was incredibly cumbersome to do so. So I pivoted, and built a tiny Firebase app to help me.

This Firebase app does a couple of neat things: I drop a folder of images into a storage bucket, it reads those images, extracts and normalizes the EXIF data, and puts them into a database so I have a cache of that data. With database entries for everything, I can now manipulate the data a little easier and add site-specific metadata as I see fit. It also opens the ability to integrate external tools into my workflow, like the only thing approaching a good use for generative LLMs I've personally seen so far: writing alt text for images. To manage all of this, I found I needed a little content management system, and because it's a highly interactive system with deep user sessions, it's one of the few circumstances where a single page app (SPA) makes sense.

My first run at it was pretty simple; a single `client:only` component I threw into my Astro site that had all the logic stuffed in. It worked, it was a little messy, but it did the job. I had actually tried dividing it into sub components and building it "correctly", but I've both truly never liked any of the compromises most SPA routers make (namely being required to use their components to make navigation work, or hash navigation, or or surprise links are `div`s) and integrating an SPA route with subroutes into Astro in dev is a surprisingly unsolved pattern that was causing me issues. But I found the need to expand what my CMS was capable of, so I embarked on a rewrite.

Because this was only for me, I decided to try playing around with the [Navigation API](https://developer.mozilla.org/en-US/docs/Web/API/Navigation_API), an standards-based API specifically for managing all the tricky edge cases of trying to do client-side routing. It's available in Chromium based browsers, but has positive signals, and implementation work, from Safari and Firefox, and after using it for a morning, honestly, it can't come soon enough to them. For a basic URL based routing system like I've got, the flow is basically as follows:

1. Add a navigation event listener
2. Check to see if the destination URL should be owned by your router
3. If not, return, if so, set your view.

It's really only those three steps. Throw in "set initial view" and "render your view" for a total of 5 steps, and, with only a smidge of hyperbole, I can say that this is probably the simplest, easiest, client side router you'll ever use. And the exact same pattern, with almost the _exact same code_, can be used with _any_ framework (or without a framework!). It's really a game changer. Here's what it looks like:

```js
// Get the initial path that's being loaded
let url = new URL(document.URL).pathname;

navigation.addEventListener('navigate', (e) => {
  // Get the path for the URL being navigated to
  url = new URL(e.destination.url).pathname;
  // If it's not covered by your SPA, return and it works as normal
  // For me, this means if it's not part of my admin path
  if (!url.startsWith('/admin')) return;

  // If you do want deal with it, intercept the event and call a handler to change your view. It can take an async function, important for dynamically loading your routes. I'll get back to that in a second.
  e.intercept({ handler: setView });
});
```

That's it! That's all the logic you need to set up your router! ~5 lines of vanilla, use anywhere with anything JavaScript. Write proper links with `a` tags, and this works, no special components necessary. You need to navigate programmatically? that's covered, too, with `navigation.navigate()`, passing in the URL or path you want to navigate to. It's so straight forward, so simple, so easy (and I really don't like using those words when describing tech) that writing a wrapping or helper library won't help ergonomics or understanding. It's an _excellent_ API, and hats off to the group that came up with it.

Now, you'll be asking, how does this work to actually change the view? Well, from here on out is going to be implementation specific, but the code for Svelte 5 is, again, very straight forward and you should be able to translate it into whatever tool you're using:

```ts
// This is a little Svelte 5, a little TypeScript.
// The first thing I'm doing is creating a variable called View that I'm telling Svelte is going to change (the $state Rune) and should be treated a Svelte component.
let View = $state() as Component;

async function setView() {
  // Then, write your logic! For me, I'm starting by splitting the pathname into pieces and removing the first piece, because that'll just be the leading slash and adds noise.
  const parts = url.split('/');
  parts.shift();

  // Then, I'm looking to see if the user is logged in
  if (!user) {
    // This is the secret sauce dynamic loading patterns, AKA a standard module import. Get the component, set it as the View.
    // Svelte 5's new Rune based state management means I can set this directly and Svelte knows it needs to run its magic. Different state managers and different frameworks will do this slightly differently, but the logic is the same.
    const { default: m } = await import('./admin/Login.svelte');
    View = m;
  } else if (parts.length === 1) {
    // On my index page, in my case, load all of my albums
    const { default: m } = await import('./admin/Albums.svelte');
    View = m;
  } else if (parts.length === 2) {
    // The logic you use here is entirely up to you. It can be more fancy than this, but it can also be this simple. I know that if I've got two items, I'm looking for an album. I've got another state manager called store that's shared between components, so I'm going to store the album from the URL in there, and the Album component will pick that up to load the correct album. I could have also done this in the Album component directly! The world is your oyster.
    const { default: m } = await import('./admin/Album.svelte');
    store.album = parts[1];
    View = m;
  } else if (parts.length === 3) {
    // Second verse, same as the first. If I've got three parts, I'm going to store the album and the image in my global store for future reference
    const { default: m } = await import('./admin/Image.svelte');
    store.album = parts[1];
    store.image = parts[2];
    View = m;
  }
}

// The final thing you need to do is call serView when your app runs to get the right view in place. In Svelte 5, the way to do this is through the $effect Rune, but you could call it on DOMContentLoaded, onMount in previous versions of Svelte, or whatever similar lifecycle event your framework has
$effect(() => {
  setView();
});
```

That's it! That's the whole JS of the router! A few lines of vanilla JS and some blink-and-you'll-miss-it integrations with a state manager. And with a modern bundler, like Vite, these `import` routes will be code split (which is why I'm not using a single, dynamic import statement here), giving you the holy grail (from a performance perspective) of SPA routers–a code-split, asynchronous routing system with 0 external dependencies that only weighs bytes, even before the gzipped and minimized size laundering that we use to describe library impact nowadays. And, like I previously said, it's universal, bring it with you to any tool, any framework you're using, and never learn another router again, because here we #UseThePlatform.

Oh, there's one last bit you need to do: actually render your component. While this will vary from framework to framework, implementation to implementation, one of the other reason I'm particularly happy with Svelte 5 here is, because we've told Svelte that View is stat that will change, that gets boiled down to this:

```html
<View />
```
