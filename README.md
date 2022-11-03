# Snugug [![Build and Deploy](https://github.com/Snugug/blog/actions/workflows/build-deploy.yml/badge.svg)](https://github.com/Snugug/blog/actions/workflows/build-deploy.yml)

My personal site, [snugug.com](https://snugug.com), built with [Astro](https://astro.build/) and [Sanity](https://www.sanity.io/). Components in [Svelte](https://svelte.dev/), styling by [Sass](https://sass-lang.com/), service worker powered by [Workbox](https://developer.chrome.com/docs/workbox/).

## PR Titles:

PR titles should be formatted as follows:

```
{emoji}({section}) {title}
```

Where `emoji` and `title` are required, and `section` is optional.

| Emoji | Meaning             |
| :---: | :------------------ |
|  🐎   | Improve performance |
|  🐛   | Fix bug             |
|  🆕   | Add new feature     |
|  📝   | Update docs         |
|  ♻️   | Refactor            |
|  📌   | Pin dependencies    |
|  💎   | Improve code style  |

| Section | Meaning                                                |
| :-----: | :----------------------------------------------------- |
| `site`  | Pertaining to the site (HTML, CSS, JS) served to users |
| `build` | Pertaining to the build system, including CI           |
| `test`  | Pertaining to tests, including linting                 |
