/**
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const scaffold = require('static-site-scaffold/lib/11ty.config');

const cherrio = require('cheerio');
const path = require('path');
const imagemin = require('imagemin');
const imageminWebP = require('imagemin-webp');
const sharp = require('sharp');
const fs = require('fs-extra');
const replaceExt = require('replace-ext');

function collectionReducer(length) {
  return (acc, current, i) => {
    if (i < length) {
      acc.push(current);
    }

    return acc;
  };
}

const imagemap = {};

module.exports = function(eleventy) {
  const config = scaffold(eleventy);

  eleventy.addTransform('test', async (content, outputPath) => {
    if (outputPath.endsWith('.html')) {
      const $ = cherrio.load(content);
      const images = $(':not(picture) img').get();

      if (images.length) {
        for (let i = 0; i < images.length; i++) {
          const image = images[i];
          const src = $(image).attr('src');
          const respSizes = $(image).attr('sizes') || '100vw';
          const type = path.extname(src);
          if (type) {
            const sizes = [250, 400, 550, 700, 850, 1000, 1150, 1300];

            const file = fs.readFileSync(path.join('src', src));
            fs.ensureDirSync(path.join('public', path.dirname(src)));
            let optimize = true;

            if (Object.keys(imagemap).includes(src)) {
              optimize = !imagemap[src].equals(file);
            } else {
              imagemap[src] = file;
            }

            if (optimize) {
              await Promise.all(
                sizes.map(size =>
                  sharp(file)
                    .resize(size)
                    .toFile(replaceExt(path.join('public', src), `.${size}${type}`)),
                ),
              );

              await imagemin([path.join('public', path.dirname(src), `**/*${type}`)], {
                destination: path.join('public', path.dirname(src)),
                plugins: [imageminWebP()],
              });
            }

            const baseSrcset = sizes.map(s => `${replaceExt(src, `.${s}${type}`)} ${s}w`).join(', ');
            const webpSrcset = sizes.map(s => `${replaceExt(src, `.${s}.webp`)} ${s}w`).join(', ');

            const imgHTML = $.html(image);
            let img = `<picture>`;
            img += `<source srcset="${webpSrcset}" sizes="${respSizes}" type="image/webp">`;
            img += `<source srcset="${baseSrcset}" sizes="${respSizes}" type="image/${type.replace('.', '')}">`;
            img += `${imgHTML}</picture>`;
            $(image).replaceWith(img);
          }
        }

        return $.html();
      }
    }

    return content;
  });

  eleventy.setDataDeepMerge(true);

  eleventy.addFilter('cleanPaginationHome', index => {
    return index === 0 ? '' : index + 1;
  });

  eleventy.addCollection('homepage', collection => {
    const posts = collection
      .getFilteredByTag('post')
      .filter(c => !c.data.tags.includes('draft'))
      .reverse()
      .reduce(collectionReducer(5), []);
    const cookbook = collection
      .getFilteredByTag('recipe')
      .filter(c => !c.data.tags.includes('draft'))
      .reverse()
      .reduce(collectionReducer(6), []);

    return posts.concat(cookbook);
  });

  eleventy.addCollection('nav', collection => {
    return collection
      .getFilteredByTag('landing')
      .sort((a, b) => {
        if (a.data.title > b.data.title) return -1;
        if (a.data.title < b.data.title) return 1;
        return 0;
      })
      .reverse()
      .sort(a => {
        if (a.url === '/') return -1;
        return 0;
      });
  });

  eleventy.addCollection('archive', collection => {
    return collection.getFilteredByTag('post').filter(i => !i.data.tags.includes('draft'));
  });

  return config;
};
