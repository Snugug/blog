---
title: Performance Sketches
date: 2015-06-24
summary: >
  Creating and enforcing performance budgets are hard to begin with, but getting everyone to understand the impact of their choices on the performance of a project can be doubly so. Having a way to "sketch" performance can help onboard new team members to the concept of performance budgets.
---

Performance is a complex dance between browsers, devices, networks, technology, marketing, branding, content strategy, and visual design. It's no wonder, then, that often it gets left to the end of a project to actually work out. Creating and enforcing performance budgets are hard to begin with, but getting everyone to understand the impact of their choices on the performance of a project can be doubly so. Designing in browser (either by actually designing there, or getting there quickly, iterating there, and deciding there) can help with this as it brings performance to the forefront of the project and provides a way to test ideas from the beginning. But, there still needs to be a way to "sketch" a project's performance before we get in browser. Having a way to "sketch" performance can help onboard new team members to the concept of [performance budgets](http://timkadlec.com/2013/01/setting-a-performance-budget/) earlier and allow teams to have a way of discussing performance while whiteboarding and sketching themselves, an invaluable part of the iteration process.

When talking about performance, both [download and on-page performance](http://pointnorth.io/#performance) are essential in understanding the overall performance of a project. Download performance is much easier to quantify than on-page performance; the former being simply size and network speed whereas the later is both of those things plus execution time and device power. As such, when sketching performance, items that mostly don't affect on-page performance are going to resemble only their download size, whereas items that do affect on-page performance are going to resemble their download size multiplied by a factor to represent that affect.

Performance sketching starts with a point goal. The project's performance budget [speed index](https://sites.google.com/a/webpagetest.org/docs/using-webpagetest/metrics/speed-index) goals will be the point goal for the performance sketches. Testing with [Web Page Test](http://www.webpagetest.org/), the two speed index goals I start all projects with are **Chrome/Cable connection at 1000** and **Motorola E (mobile device)/Regular 3G connection at 3000**. These two speed index goals provide good bookends from slow devices/connections to fast devices/connections in markets where 3G mobile bandwidth is highly available. So, the point goals would be 1000 for large screen views and 3000 for small screen views.

Once point goals are decided upon, the next step is to actually sketch out the cost for ideas. What follows is by no means a comprehensive list of common design and development patterns and the cost to assign to them. If the total cost is greater than a project's point goal, that is [not ideal](https://github.com/munificent/vigil) and work should be done to fix that. None of the items below are mutually exclusive; for instance, if a project uses a CSS framework and needs custom styling on top of the CSS framework, both items must be counted. If there are multiple unique items on a page, for instance multiple images, each each unique item must be counted individually. Items can (and should) be combined to sketch out a [component](http://pointnorth.io/#components). When sketching non-desktop displays, the total cost should be multiplied by **4**.

- Initial HTML (whole page): **20 points**
- Custom styling (whole page): **40 points**
- CSS Framework (Bootstrap, Foundation, etc…. Styling only): **150 points**
- Full-width high res image (divide point total for different sized images): **250 points**
- Individual custom font weight/style: **60 points**
- Simple SVG: **5 points**
- Complex SVG: **15 points**
- Icon: **2 points** (each individual unique icon must be counted, repeated icons don't need to be)
- HTML5 Video (>= 25 seconds): **250 points**
- HTML5 Video (< 25 seconds): **50 points**
- JavaScript DOM manipulation framework (jQuery, Zepto, etc…): **340 points**
- JavaScript MVC framework (Angular, React, etc…): **625 points**
- Interaction requiring JavaScript (per component): **20 points**
- Layout requiring JavaScript (per component): **100 points**
- Movement requiring JavaScript (per component): **200 points**
- Action triggered on scroll (per component): **400 points**
- Repeated component with new content: **1/2 total component cost** (content counted separately)

Initial HTML is going to be required once for all pages. This can be increased/decreased based on how much content is actually being displayed (single page sites, for instance, should cost more). Custom styling, likewise, will be required once for all pages and may increase based on how much one-off styling there is (current cost is based on a [systems-based design approach](http://daverupert.com/2013/04/responsive-deliverables/)). The rest of the suggestions more or less provide the building blocks for coming up with the cost of a project, but can also be combined to determine the cost for individual components. For instance, a carousel containing 4 items may have a cost breakdown of:

- 4 quarter-width high res images: **250 points**
- Interaction requiring JavaScript: **20 points**
- Layout requiring JavaScript: **100 points**
- Movement requiring JavaScript: **200 points**

All told, a single carousel component would cost **320 points** with **250 points** for content for a total cost of **570 points**. Subsequent carousels would cost an additional **160** points plus **250 points** for content or a total of **410 points**.

This should hopefully provide some common ground for designers, developers, PMs, and product owners to talk about performance from the beginning of the project instead of waiting until everything is coded up to discuss it. Of course, these performance sketches aren't law, and actual testing will be needed to ensure what is produced meets the final performance budget, and your numbers may vary. For a much more comprehensive dive in to designing with performance in mind, I highly recommend reading what [Lara Hogan](http://larahogan.me/) has written on the subject. Now go [make the web faster](https://developers.google.com/speed/).
