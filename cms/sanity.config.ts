import { defineConfig } from 'sanity';
import { deskTool } from 'sanity/desk';
import { schemaTypes } from './schemas';
import { markdownSchema } from 'sanity-plugin-markdown';

console.log(import.meta.env);

const projectId = import.meta.env?.SANITY_STUDIO_PROJECT || '';

export default defineConfig({
  name: 'default',
  title: 'Snugug',

  projectId,
  dataset: 'production',

  plugins: [deskTool(), markdownSchema()],

  schema: {
    types: schemaTypes,
  },
});
