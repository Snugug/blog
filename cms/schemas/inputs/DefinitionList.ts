export default {
  name: 'deflist',
  title: 'Definition List',
  type: 'object',
  fields: [
    {
      name: 'terms',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            {
              name: 'term',
              title: 'Term',
              type: 'string',
            },
            {
              name: 'definition',
              title: 'Definition',
              type: 'string',
            },
          ],
        },
      ],
    },
  ],
};
