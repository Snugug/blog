import FullBlock from './inputs/FullBlock';
import Code from './inputs/Code';
import DefinitionList from './inputs/DefinitionList';
import Break from './inputs/Break';
import Message from './inputs/Message';

export default {
  name: 'post',
  title: 'Post',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'published',
      title: 'Published',
      type: 'date',
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'updated',
      title: 'Updated',
      type: 'date',
    },
    {
      name: 'summary',
      title: 'Summary',
      type: 'text',
      options: {
        rows: 2,
      },
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'body',
      title: 'Body',
      type: 'markdown',
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'body2',
      title: 'Body',
      type: 'array',
      of: [FullBlock, Code, Break, { type: 'image' }, DefinitionList, Message],
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'categories',
      title: 'Categories',
      type: 'array',
      of: [{ type: 'reference', to: { type: 'category' } }],
    },
    {
      name: 'archived',
      title: 'Archived',
      type: 'boolean',
    },
  ],
};
