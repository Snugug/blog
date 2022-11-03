import sanity from '@sanity/client';

const project = import.meta.env?.SANITY_PROJECT || process.env.SANITY_PROJECT;
const token = import.meta.env?.SANITY_TOKEN || process.env.SANITY_TOKEN;

const config = {
  projectId: project,
  dataset: 'production',
  apiVersion: '2022-10-29',
  useCdn: false, // `false` if you want to ensure fresh data
};

if (token) {
  config.token = token;
}

export const client = sanity(config);
