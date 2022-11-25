export default {
  name: 'recipe',
  title: 'Recipe',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Title',
      type: 'string',
    },
    {
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96,
      },
    },
    {
      name: 'mainImage',
      title: 'Main image',
      type: 'image',
      options: {
        hotspot: true,
      },
    },
    {
      name: 'yield',
      title: 'Yield',
      type: 'string',
    },
    {
      name: 'difficulty',
      title: 'Difficulty',
      type: 'string',
      options: {
        list: [
          { title: 'Easy', value: 'easy' },
          { title: 'Medium', value: 'medium' },
          { title: 'Hard', value: 'hard' },
        ],
      },
    },
    {
      name: 'instructions',
      title: 'Instructions',
      type: 'array',
      of: [
        {
          name: 'instruction',
          title: 'Instruction',
          type: 'object',
          fields: [
            {
              name: 'time',
              title: 'Time',
              type: 'object',
              fields: [
                {
                  name: 'active',
                  title: 'Active',
                  type: 'string',
                },
                {
                  name: 'inactive',
                  title: 'Inactive',
                  type: 'string',
                },
                {
                  name: 'rest',
                  title: 'Rest',
                  type: 'string',
                },
              ],
            },
            {
              name: 'equipment',
              title: 'Equipment',
              type: 'array',
              of: [
                {
                  name: 'equipmentItem',
                  title: 'Equipment Item',
                  type: 'string',
                },
              ],
            },
            {
              name: 'ingredients',
              title: 'Ingredients',
              type: 'array',
              of: [
                {
                  name: 'ingredient',
                  title: 'Ingredient',
                  type: 'object',
                  fields: [
                    {
                      name: 'ingredient_name',
                      title: 'Ingredient name',
                      type: 'string',
                    },
                    {
                      name: 'amount',
                      title: 'Amount',
                      type: 'string',
                    },
                  ],
                },
              ],
            },
            {
              name: 'procedure',
              title: 'Procedure',
              type: 'array',
              of: [
                {
                  name: 'step',
                  title: 'Step',
                  type: 'string',
                },
              ],
            },
          ],
        },
      ],
    },
    {
      name: 'body',
      title: 'Body',
      type: 'markdown',
    },
    {
      name: 'categories',
      title: 'Categories',
      type: 'array',
      of: [{ type: 'reference', to: { type: 'category' } }],
    },
    {
      name: 'published',
      title: 'Published',
      type: 'date',
    },
  ],

  preview: {
    select: {
      title: 'title',
      author: 'author.name',
      media: 'mainImage',
    },
    prepare(selection) {
      const { author } = selection;
      return Object.assign({}, selection, {
        subtitle: author && `by ${author}`,
      });
    },
  },
};
