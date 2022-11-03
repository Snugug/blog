import rss from '@astrojs/rss';
import { client } from '$lib/sanity.js';

const query =
  '*[(_type == "post" || _type == "recipe") && archived != true && !(_id in path("drafts.**"))] | order(published desc) {title, "link": slug.current, "type": _type, "pubDate": published, "description": summary}';

const items = (await client.fetch(query)).map((i) => {
  const item = { ...i };
  if (item.type === 'post') {
    item.link = `musings/${item.link}`;
  } else if (item.type === 'recipe') {
    item.link = `cookbook/${item.link}`;
    delete item.description;
  }

  delete item.type;

  return item;
});

export const get = () =>
  rss({
    title: 'Snugug',
    description: `Sam's personal blog: recipes and musings`,
    site: 'https://snugug.com',
    items,
    stylesheet: '/rss.xsl',
  });
