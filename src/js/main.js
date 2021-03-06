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

import { log } from './lib/log';

// import 'lunr';

CSS.paintWorklet.addModule('/js/houdini/triangles.js');

// const idx = lunr(function() {
//   /* eslint-disable no-invalid-this */
//   this.field('title');
//   this.field('body');

//   this.add({
//     title: 'Twelfth-Night',
//     body: 'If music be the food of love, play on: Give me excess of it…',
//     author: 'William Shakespeare',
//     id: '1',
//   });
// });

// console.log(idx.search('love'));

// eslint-disable-next-line no-constant-condition
if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      log('Service Worker registered! 😎');
      log(registration);
    } catch (e) {
      log('Registration failed 😫');
      log(e);
    }
  });
}
