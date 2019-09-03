const pages = require('gh-pages');

const token = process.env.GH_TOKEN;

pages.publish(
  '.www',
  {
    repo: `https://${token}@github.com/Snugug/blog.git`,
    // silent: true,
  },
  err => {
    if (err) {
      const tokenRegex = new RegExp(token, 'gm');
      console.error(err.replace(tokenRegex, 'GH_TOKEN'));
      process.exit(2);
    }
  },
);
