---
title: Utilities and Libraries and Frameworks. Oh My!
template: _layout.html
summary: >
  Instead of spending so much time getting caught up in what we (or the authors) call a tool, let's focus instead on the complexity a tool brings to our work (or requires from us)
draft: true
---

Easily one of the most influential talks that I've ever seen, Rich Hickey's [Simple Made Easy](http://www.infoq.com/presentations/Simple-Made-Easy) ([transcript](https://github.com/matthiasn/talk-transcripts/blob/master/Hickey_Rich/SimpleMadeEasy.md), [slides](http://www.slideshare.net/evandrix/simple-made-easy), you really should just take an hour and watch the talk before you continue) talks about the virtues of simplicity over just easiness. The talk starts with an appeal to authority, specifically by defining simple and easy, and the assertion from [Edsger Dijkstra](https://en.wikipedia.org/wiki/Edsger_W._Dijkstra) that _"Simplicity is prerequisite for reliability"_.

* **Simple** - From _sim- plex_, having one fold or braid. The opposite of **complex** which has multiple folds or braids. Simple things focus on one role, task, concept, or dimension at a time. That doesn't mean there's only one instance or operation, but rather that there is no interleaving of roles/tasks/concepts/etc… Whether something is simple or not is _objective_.
* **Easy** - From _ease < aise < adjacens_, to lie near. The opposite of **hard** which is far from. Easy things are near at hand (our hard drives, tools sets, package managers), near to our understanding or skill set, and near to our capabilities. Whether something is easy or not is _relative to each individual_.

Rich asserts that more often than not as developers, we focus on the experience of using a something rather than the long-term results of using that something. Specifically, he asserts that we should be less concerned with the a programmer's convenience or the ability to replace a programmer (or if you will, hire a new programmer with specific knowledge) than it is the long-term quality, correctness, and ability to maintain, change, and debug what we create.

For small projects with only a handful users and/or developers, this isn't really a problem. However, I have seen time and time again, project and project again, team and team again, company and company again, that when long-term quality, maintenance, and change aren't active and high-priority considerations when choosing something to use (let's call those somethings _tools_), and instead a tool is chosen primarily because it's convenient or shiny and chrome, it becomes near impossible to guarantee those long-term considerations. So, this assertion rings true for me.

![Shiny and Chrome](/images/utilities-libraries-frameworks-oh-my/shiny-and-chrome.gif)

These long-term considerations is where simplicity and ease come back in. Human capabilities are pretty much set; there is a hard upper limit to the number of things we're reliability able to keep straight in our heads at once. Once things start to be intertwined, once complexity is introduced, we need to consider those intertwined things together, thus working to undermine our understanding and ability to reliability reason about the whole thing. Being able to change our work, from upgrading to replacing to enhancing to debugging, all require us to be able to reason about our work. The more complex our work is, and the more complex the tools we use to do our work are, the harder it will be for us to reason about our work, and thus the harder it will be to actually change our work.

Tools generally require us to do one of two things, either **complect** with them or **compose** with them, in order to work with them. When we _complect_ with something, we are _interleaving or entwining_ with it; complecting is literally the source of complexity. When we _compose_ with something, we are _placing it together_ with other things in our project, connected but not entangled with. Composition is the key to ensuring that we'll be able to guarantee our long-term considerations are met.

As an example, let's imagine, as Rich does, two castles; one is knitted, the other is built out of Lego. The two castles sit on your desk at work, defending your snacks from your coworkers. After a few weeks, you decide that you'd like to switch out the main turret. With the Lego castle, it's fairly straight forward. Because Lego is designed to be composed, you would pop off the old turret and replace it with the new turret, seamlessly. The knitted castle, on the other hand, is a different story. Because knitting is by definition complecting yarn together, you're going to need to undo a lot of work to get that turret out, potentially even resorting to cutting, and getting the new turret on will be anything but seamless.

With this in mind, he recommends we should focus on tools that provide modularity through composition as opposed to complecting. Tools should focus on providing simple interfaces designed to be composed together.

> Your sensibilites equating simplicity with ease and familiarity are wrong. Develop sensibilites around entanglement

![Lions and Tigers and Bears. Oh My!](https://www.youtube.com/watch?v=NecK4MwOfeI '4x3')

So, what does it mean to
