import { createTable } from './lib/database.js';
import { retrieveTweets } from './lib/archive.js';

createTable();
await retrieveTweets();

// import { Twitter } from './lib/twitter.js';

// const twitter = new Twitter();

// await twitter.init();

// const tweets = twitter.tweets;

// console.log(tweets[0]);
