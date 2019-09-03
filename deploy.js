const pages = require('gh-pages');

pages.publish('.www', {
  repo: `https://${process.env.GH_TOKEN}@github.com/Snugug/blog.git`,
  silent: true,
});
