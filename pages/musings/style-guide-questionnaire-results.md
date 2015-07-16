---
title: Style Guide Questionnaire REsults
template: _layout.html
published: May 1, 2014
updated: May 1, 2014
summary: >
  On April 21, I put up a questionnaire asking for feedback on how and why people use Style Guide systems. Here is the feedback I collected.
---
On April 21, I put up a questionnaire asking for feedback on how and why people use Style Guide systems. The questionnaire contained a series of multiple choice and open ended questions. After having received 36 responses and having had responses taper off, I have closed the questionnaire and collated the results below. These are not meant to be scientific results, just the results I received.

## Overview

Overall, style guides are liked as they provide a single place to view all of the different patterns that make up a  project. Having this kind of workflow encourages assembling rather than deconstruction and promotes consistency and cohesion across a project. Users do not like style guides that are overly strict, especially in terms of naming conventions and syntax and are hard to customize. Customization of the final style guide a style guide system produces is very important to many users. Style guide systems should be easy to configure and not require rube-goldberg-esque setup or config as well as being easy to extend.

Style guides are not without their criticism. While building modular components is generally agreed to be A Good Thing™, modularity can make it hard for stakeholders to see the bigger picture of what is being built; the design can become too abstract. It can also be daunting to find a specific pattern in a large system and can lead to maintenance problems. Generally, maintenance and enforcement was brought up as an issue especially when a component changes. Users also note that most style guide systems take style guide system specific training to use effectively.

When building style guides using HTML, it is liked that it encourages modular thinking and provides a great workflow between disciplines, getting non-coders involved in the development process. Users find it especially easy to prototype and refine ideas with a separation of HTML, CSS, and JavaScript. HTML based style guides were criticized as being difficult to set up and generally relying upon a specific build tool.

When generating style guides from comments in the CSS (or preprocessed CSS), it is preferred to write the comments in Markdown. Generating style guides from comments is generally liked as it keeps the documentation of the styling close to the styling itself. Comment based style guides were criticized as being inflexible and difficult to use, require strict comment syntaxes to use properly and generally only being able to show a single permutation of an HTML example.

Based on how users describe their workflows, likes, and dislikes, users who like writing HTML files to define a component use style guides as tools to do design with. On the other hand, users who like to define their components through comments in their CSS use style guides as a way to document their CSS. There is a subtle but important distinction here; the former appear to be using style guide systems to actively design with as well as a cross-discipline (including client) facing visual communication tool, whereas the later appear to be using them more as a visual documentation tool aimed at fellow developers.

## Must Have Features

The list of must-have features for a style guide system. Only features with more than one response are included. Respondents were allowed to pick multiple options, plus had an `other` option.

* Component HTML Preview: 35
* Component Color Guide: 28
* Component CSS Preview: 22
* Component Annotations: 20
* Component JS Preview: 19
* Style Tile: 18
* Component Preprocessor Preview (i.e. Sass view): 12
* Viewport Tester (think ish. by Brad Frost): 11
* Component Review Workflow: 3


## Systems Used

The following is the list of style guide systems that the respondents said they use. Only systems with more than one response are included. Respondents were allowed to pick one, plus had an `other` option.

* KSS: 12
* Pattern Lab: 7
* Custom: 6
* Hologram: 3
* None: 3

## Component Definitions

The following shows how respondents prefer to define the HTML for their components. Respondents were allowed to pick one, plus had an `other` option. The responses for `HTML Partial` and `HTML Partial Grouped by Folder` are combined into `As HTML Partial` and the responses for `Full HTML Page` and `Full HTML Page with All Related Components` are combined into `Inside Full HTML Page`.

* Inside CSS: 19
* As HTML Partial: 14
* Inside Full HTML Page: 3

## Style Guide Language

The language the respondents would prefer the style guide system to be written in. Only languages with more than one response are included. Respondents were allowed to pick one, plus had an `other` option.

* Node with Task Runner (Grunt/Gulp): 15
* No Preference: 9
* PHP: 4
* Ruby: 2
