import { defineConfig } from 'astro/config';
import { VitePWA as pwa } from 'vite-plugin-pwa';
import { markdown } from './lib/markdown';

// https://astro.build/config
import svelte from '@astrojs/svelte';

// https://astro.build/config
import sitemap from '@astrojs/sitemap';

import { fileURLToPath } from 'node:url';
import path from 'node:path';
import collections from './lib/collections-plugin';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// https://astro.build/config
export default defineConfig({
  site: 'https://snugug.com',
  integrations: [svelte(), sitemap(), collections()],
  markdown,
  vite: {
    // Workers use dynamic import() for code-splitting (storage adapter lazy loading),
    // which requires ES module format instead of the default IIFE
    worker: { format: 'es' },
    plugins: [
      pwa({
        strategies: 'injectManifest',
        srcDir: 'src',
        filename: 'sw.js',
        injectRegister: 'inline',
        injectManifest: {
          globPatterns: ['fonts/**/*'],
        },
        manifest: {
          name: 'Snugug',
          short_name: 'Snugug',
          description: "Sam's personal website",
          theme_color: '#008673',
          background_color: '#008673',
          display: 'standalone',
          scope: '/',
          start_url: '/',
          icons: [
            {
              src: '/images/icons/icon72.png',
              sizes: '72x72',
              type: 'image/png',
            },
            {
              src: '/images/icons/icon96.png',
              sizes: '96x96',
              type: 'image/png',
            },
            {
              src: '/images/icons/icon128.png',
              sizes: '128x128',
              type: 'image/png',
            },
            {
              src: '/images/icons/icon144.png',
              sizes: '144x144',
              type: 'image/png',
            },
            {
              src: '/images/icons/icon152.png',
              sizes: '152x152',
              type: 'image/png',
            },
            {
              src: '/images/icons/icon192.png',
              sizes: '192x192',
              type: 'image/png',
            },
            {
              src: '/images/icons/icon384.png',
              sizes: '384x384',
              type: 'image/png',
            },
            {
              src: '/images/icons/icon512.png',
              sizes: '512x512',
              type: 'image/png',
            },
          ],
          splash_pages: null,
        },
      }),
    ],
  },
});
