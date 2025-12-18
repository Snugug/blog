---
title: 'Comparing Privacy-Focused Analytics Tools'
published: '2023-01-25'
summary: 'A head-to-head-to-head comparison of Cloudflare Web Analytics, Plausible, and Fathom, three privacy-preserving analytics solutions, after running each on my site for a week.'
---

For the past week or so, I've been experimenting with three (paid) privacy-preserving analytics solutions for my site: Cloudflare Web Analytics, Plausible, and Fathom. My needs are pretty simple: I just want a sense of how people are using my site. I don't need really need things like active users, flow through my site, or other tracking that would require uniquely identifying an individual as they go through my site. So, how do these three stack up? The tl;dr is I'm going to stick with Plausible. Here's why:

## Cloudflare Web Analytics

I really loved the idea of Cloudflare Web Analytics (CWA). My site is already proxied behind Cloudflare, so this felt like a no-brainer. I didn't even need to add anything to my site; it can track stuff from how it serves and adds a small bonus script for tracking a few additional items like Core Web Vitals and page load time (which I really like). Unfortunately, that's where what I like about CWA ends.

CWA has the basics: referrers, paths, browsers, OS, and device type, but is missing bounce rate and time on page, and doesn't support custom events. You're also unfortunately, you're limited to top 15 items for each category (except country, for some reason). I like being able to exclude items (like a landing page) from overall analytics, but the missing key analytics and the limited depth make the overall experience not great. There are two other problems I have with CWA: confusion between CWA and Cloudflare Analytics, and the accuracy of CWA.

Cloudflare offers traffic analytics if you proxy through them. It's got a ton of great information, but it uses nearly the same interface as their web analytics, generally is in the same menu area, but is _really_ not the same thing. When first getting set up, I constantly got confused between the two, and navigating between them is equally confusing because they're in different sections of near-identically looking areas of the Cloudflare site. This is a UX thing that can be solved, but it's not yet!

Finally, accuracy of CWA confuses me. Plausible and Fathom have the same number of total pageviews and near identical visitors (±2%), but CWA's pageviews are 34% higher than the other two, and visits are 110% higher. I have no idea why they're so much higher, but because it's the outlier of the three I lean towards the other two being more representative.

## Fathom and Plausible

Both Fathom and Plausible are pretty comparable to each other; both do all of the analytics you expect (visitors, views, time on site, bounce rate, etc…). Both support custom events, can be proxied to be served from your domain, have support for UTM campaigns, countries, and you can dive into individual items to see more. So it really comes down to small bits to choose one over the other, and for me this is where Plausible pulls away.

While both support sources and UTMs/campaigns, Plausible can (today) integrate with Google Search Console to see top search terms (although it doesn't look like search terms filter with other filters), which is great to have in one place. Plausible groups campaigns with sources, whereas Fathom keeps them separate. Overall, I like the Plausible interface better.

Next is pages. Both show visitors, pageviews, time on page, and page entries (although the last is a little different between the two). The places where Plausible pulls away for me are it shows exit pages, bounce rate, and has a "details" view that gives a big table view of all data (it has this for each view, but here's the first place it really shines). The one weird thing, which I don't have an answer for, is that Fathom's time on page is about 70% more than Plausible's, but because it doesn't have a details view its hard to track down where the differences between pages are as I need to go into each page individually.

Locations, the story is the same. Both show countries, but Plausible has regions and cities, too, plus a map view, which I particularly like. Once more with devices; both show device type and browser, but Plausible has a better breakdown (more options and describes the width they're using to bucket) and includes operating system, too.

Plausible also includes the ability to do some advanced filtering, so like CWA, you can exclude your landing page, or any number of other other things it tracks. I also like the overall UI a little bit more (different sections have different accent colors, referrers have favicons, it responds a little better). Plausible also offers an NPM module to directly bundle their code (which is pretty tiny) with your site code, removing the need to proxy it for better tracking.

There are some interesting intangibles for both. Fathom has optional uptime monitoring included and an affiliate program if you're into that kinda thing. Plausible is open source (APGLv3) and donate some of their revenue to environmental causes and open source.

---

After running these three for a week, I'm going to stick with Plausible. The pricing is right (for me), the features are right, and it's giving me the insights I'm interested in to improve my site. My next steps are to experiment with adding events, and maybe set up a public view for the analytics once I've given it some time to settle in.
