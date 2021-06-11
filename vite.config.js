const { defineConfig } = require('vite');
const { eleventyPlugin } = require('vite-plugin-eleventy');
const path = require('path');

module.exports = defineConfig({
  root: 'src',
  clearScreen: false,
  resolve: {
    alias: [
      {
        find: '$toolkit',
        replacement: path.join(__dirname, './node_modules/sass-toolkit/stylesheets/toolkit'),
      },
      {
        find: '$breakpoint',
        replacement: path.join(__dirname, './node_modules/breakpoint-sass/stylesheets/breakpoint'),
      },
      {
        find: '$letterform-shades',
        replacement: path.join(
          __dirname,
          './node_modules/letterform-shades/stylesheets/letterform-shades',
        ),
      },
    ],
  },
  server: {
    open: true,
  },
  build: {
    outDir: '../public',
    emptyDir: true,
  },
  plugins: [eleventyPlugin()],
});
