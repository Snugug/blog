import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';

export async function GET(context) {
  const posts = await getCollection('posts', ({ data }) => !data.archived);
  const recipes = await getCollection('recipes');

  const postItems = posts.map((post) => ({
    title: post.data.title,
    link: `musings/${post.id}`,
    pubDate: post.data.published,
    description: post.data.summary,
  }));

  const recipeItems = recipes.map((recipe) => ({
    title: recipe.data.title,
    link: `cookbook/${recipe.id}`,
    pubDate: recipe.data.published || new Date(),
  }));

  const items = [...postItems, ...recipeItems].sort(
    (a, b) => b.pubDate.getTime() - a.pubDate.getTime(),
  );

  return rss({
    title: 'Snugug',
    description: `Sam's personal blog: recipes and musings`,
    site: context.site,
    items,
    stylesheet: '/rss.xsl',
  });
}
