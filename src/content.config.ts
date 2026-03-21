// Astro 5 Content Collection Configuration
// https://docs.astro.build/en/guides/content-collections/

import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

/**
 * Categories Collection
 * Simple taxonomy collection for categorizing posts and recipes
 */
const categories = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/categories' }),
  schema: z.object({
    title: z.string(),
    description: z.string().nullable().optional(),
  }),
});

/**
 * Pages Collection
 * Static pages like "About Me" and "Presentations"
 */
const pages = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/pages' }),
  schema: z.object({
    title: z.string(),
    summary: z.string(),
  }),
});

/**
 * Posts Collection
 * Blog posts with optional categories and archive status
 */
const posts = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/posts' }),
  schema: z.object({
    title: z.string().meta({
      title: 'Title',
      description: 'My Title',
    }),
    published: z.coerce.date().meta({
      title: 'Published',
      tab: ['dates', 'social'],
    }),
    updated: z.coerce
      .date()
      .optional()
      .meta({
        title: 'Updated',
        tab: ['dates'],
      }),
    summary: z
      .string()
      .max(350)
      .meta({
        title: 'Summary',
        description: 'Used in blog cards and for social media previews',
        tab: ['social'],
      }),
    categories: z.array(z.string()).optional(),
    archived: z.boolean().optional(),
  }),
});

/**
 * Recipes Collection
 * Structured recipe content with complex instruction data
 */
const recipes = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/recipes' }),
  schema: z.object({
    title: z.string(),
    published: z.coerce.date().optional(),
    yield: z.string().optional(),
    difficulty: z.enum(['easy', 'medium', 'hard']).optional(),
    image: z.string().optional(),
    categories: z.array(z.string()).optional(),
    instructions: z
      .array(
        z.object({
          time: z
            .object({
              active: z.string().optional(),
              inactive: z.string().optional(),
              rest: z.string().optional(),
            })
            .optional(),
          equipment: z.array(z.string()).optional(),
          ingredients: z
            .array(
              z.object({
                name: z.string(),
                amount: z.string(),
              }),
            )
            .optional(),
          procedure: z.array(z.string()).optional(),
        }),
      )
      .optional(),
  }),
});

export const collections = {
  categories,
  pages,
  posts,
  recipes,
};
