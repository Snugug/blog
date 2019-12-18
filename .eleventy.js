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

function collectionReducer(length) {
  return (acc, current, i) => {
    if (i < length) {
      acc.push(current);
    }

    return acc;
  };
}

module.exports = function(eleventy) {
  const config = scaffold(eleventy);

  eleventy.addFilter('cleanPaginationHome', index => {
    return index === 0 ? '' : index + 1;
  });

  eleventy.addCollection('homepage', collection => {
    const posts = collection
      .getFilteredByTag('post')
      .reverse()
      .reduce(collectionReducer(5), []);
    const cookbook = collection
      .getFilteredByTag('recipe')
      .reverse()
      .reduce(collectionReducer(5), []);

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

  return config;
};
