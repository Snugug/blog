const { defineConfig } = require('vite');
const { eleventyPlugin } = require('vite-plugin-eleventy');
const { posthtmlPlugin } = require('vite-plugin-posthtml');
const { imgPlugin } = require('vite-plugin-img');
const { default: imageminPlugin } = require('vite-plugin-imagemin');
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
    // rollupOptions: {
    //   output: [
    //     {
    //       assetFileNames: 'assets/[name].[ext]',
    //       chunkFileNames: 'assets/[name].js',
    //       entryFileNames: 'assets/[name].js',
    //     },
    //   ],
    // },
  },
  plugins: [
    eleventyPlugin(),
    imgPlugin(),
    posthtmlPlugin({
      plugins: [
        require('posthtml-minifier')({
          collapseBooleanAttributes: true,
          collapseInlineTagWhitespace: true,
          collapseWhitespace: true,
          minifyCSS: true,
          minifyJS: true,
        }),
      ],
    }),
    imageminPlugin(),
  ],
});
