---
title: 'Introducing Starchart Studio'
published: '2023-01-01'
summary: 'Introducing Starchart Studio, a component story tool for island architectures, powered by Astro'
---

As hinted at on [Mastodon](https://mas.to/@snugug/109600326798344614), I've gone ahead and releaesd the first preview version of [**Starchart Studio**](https://www.npmjs.com/package/starchart-studio) - a component story tool similar to [Storybook](https://storybook.js.org/) designed for island architectures and powered by [Astro](https://astro.build/).

Why yet another story tool? Good question!

When looking to integrate a tools like Storybook into a recent Astro project, I kept on running into hurdles or DX decisions I didn't love: most seem designed with SPA architectures in mind, support for various frameworks felt limited (usually React or Vue first), and none supported Astro components, which were going to make up a large portion of my Astro project. I wanted something that would work with anything I was likely to throw at it and didn't require tight coupling. So, as I'm likely to do, I made a thing.

## Solving only the hard stuff

Astro was a great starting place: it has built-in dynamic page and component rendering, a robust component model, support for lots of JS frameworks out-of-the-box, and is super flexible. Building a story tool on top of it was mostly defining a content model and DX patterns with very little novel code needing to be written. This left me with only really needing to "solve the hard stuff", aka Starchart's logic and DX. For that, I really only needed to figure out:

- How to generate both stand-alone previews and full-story pages for one story input (1 to n page generation with different layouts)
- How to list all components without asking the developer for duplicate work
- How to connect state to components in a dynamic way

### From one, many

The biggest "bit" of a story tool is having two or more views of the same story: the fully-featured story page and a stand-alone iframed page for the component to sit in isolation. I wanted to keep basic component stories to a single file, so I settled on [Astro's MDX integration](https://docs.astro.build/en/guides/integrations-guide/mdx/) as a base for stories. This allows developers to write Markdown documentation while also exporting an object with configuration, including a component that can be passed around and rendered. When [globbed](https://docs.astro.build/en/reference/api-reference/#markdown-files), they come with a bunch of useful properties, too, which can be used to build out robust systems if not used directly to generate pages.

One of properties is `file`. When combined with [`getStaticPaths`](https://docs.astro.build/en/reference/api-reference/#getstaticpaths) and dynamic params in filenames, you can create multiple related pages from a single input. Because this function is run server-side from Node, you can use Node built-ins without worry, like `path`. I grab the basename of the file, and generate two entries in `getStaticPaths`, one for the isolated component, and one for the fully-featured story page. I can even have different properties that get passed to those components (from `Astro.props`) from this, making it possible to further change exactly what's available on the page. This includes signaling if the page should be inline and, if so, choosing a different layout. The main `Starchart.astro` component basically exists to do just that:

```jsx
{
  story.inline ? (
    <InlineStory
      Component={story.Component}
      props={story.properties}
      slug={story.slug}
    />
  ) : (
    <BlockStory
      Component={story.Component}
      {...story.properties}
      chart={chart}
    />
  );
}
```

`chart`, in the above code sample, is actually the list of all components, and their URLs, ready to be made into nav of some sort. Getting this from an individual page is kinda tricky; `getStaticPaths` runs in isolation so it's hard to capture the glob and reuse it. When you use Starchart's `getStaticPaths` function, you're actually calling a method on a singleton class instance; that lets me save the results to a property and recall them during other function calls, which you make [to set up the story](<https://github.com/Snugug/starchart-studio/tree/e3157140b472929f4e8666944d75dbd3c05bb8d8#:~:text=const%20starchart%20%3D%20StarchartStudio.chart(Astro)%3B>). As a side note, a singleton class to hold state is a pattern I find myself using quite often when with JS modules.

### Dealing with state

With this basic setup and the built-in component model, I had prop-only components rendering! Inputs couldn't be changed, but I considered that a fair tradeoff considering they're designed to not be once loaded. But sometimes you have state, and that posed problems.

I knew developers would need to define functions to connect form updates to their state management of choice, but Astros' [`define:vars`](https://docs.astro.build/en/reference/directives-reference/#definevars) for passing variables into script tags stringifies everything, so no functions allowed. While I maybe could work around this with an `exec`, it was strike one. Next, the system works using [dynamic tags](https://docs.astro.build/en/core-concepts/astro-components/#dynamic-tags) to render the component, but dynamic tags can't be hydrated. This unfortunately took me a while of spinning to realize; as it's only mentioned under dynamic tags and not in the hydration docs, but I got there. That was strike two. One more and this whole thing collapses. But fortunately, Astro's component model, while a hinderance here, actually saved me.

See, Astro is all about mixing islands of interactivity with static content. This means that you can make a static Astro component that has hydrated components in it, and that works fine. Because that component doesn't need to be hydrated, _it_ can then be dynamically loaded. And thus, a simple, if slightly inelegant, solution emerged: hydrated components need to be wrapped in a static component. We'll pass you all the props you need to render your component, just swap the direct component call in your story for your wrapped one. This also provides a clear place to add Starchart-specific code for managing state and events without coupling it into your production component.

The last bit is pretty straight-forward: the isolated component lives in an iframe, so `postmessage` to send data across that border, with a couple of custom events and some developer-facing helper functions to manage it all for them, so they just need to write how their state changes when it comes it.

## Finishing touches and what's next

The last bit I added was a width slider to the preview area, inspired by Brad Frost's [ish.](https://bradfrost.com/blog/post/ish/). I absolutely loved ish. during my early responsive web design days, and with the rise of container queries, I feel like it's time to shine is once again here, but this time for components. I've started with a basic implementation, changing width, but I think I'd like to add height, too, and the size buttons: small-ish, medium-ish, large-ish, xl-ish, and of course, the disco mode.

I also want to add the ability to include variants for a component. I haven't quite figured out how to do that yet, but with my solution for building inline pages squared away, it'll probably be a variation (get it, _get it_) on that.

Finally, this needs some visual polish. I'll get to that.

And a website. Every good OSS project these days has a website.

## Putting it all together

With all of that, I've release version 0.2.1 (because no good initial release goes without an immediate point fix) of [Starchart Studio](https://www.npmjs.com/package/starchart-studio). The README has how to use it and the [repo](https://github.com/snugug/starchart-studio) has a working demo in the `src` directory. If you try it out, LMK!

<video src="https://media.mas.to/masto-public/media_attachments/files/109/600/305/812/185/840/original/c1be52a89c8f86ac.mp4" role="button" tabindex="0" aria-label="Screen recording of Astro-powered story tool in action. Starts with a card component, shows what props are available for the component, a description of the component, and a preview of the component in an iFrame, which is shown being resized on drag. Next switches to a counter component that shows both props and state, which is updated as the component is changed and when the state form item is changed." title="Screen recording of Astro-powered story tool in action. Starts with a card component, shows what props are available for the component, a description of the component, and a preview of the component in an iFrame, which is shown being resized on drag. Next switches to a counter component that shows both props and state, which is updated as the component is changed and when the state form item is changed." loop="" autoplay="" playsinline="" style="position: static; top: 0px; left: 0px;"></video>
