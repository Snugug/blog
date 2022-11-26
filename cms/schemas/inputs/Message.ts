import SmallBlock from './SmallBlock';

export default {
  type: 'object',
  name: 'message',
  title: 'Message',
  fields: [
    {
      name: 'severity',
      title: 'Severity',
      type: 'string',
      initialValue: 'info',
      options: {
        list: [
          { title: 'Info', value: 'info' },
          { title: 'Warning', value: 'warning' },
          { title: 'Error', value: 'error' },
        ],
      },
    },
    SmallBlock,
  ],
};
