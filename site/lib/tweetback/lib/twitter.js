// import { tweets } from './tweets.js';

// import { createTable } from './database.js';
// import { retrieveTweets } from './archive.js';
import { tweetData } from './tweets.js';

/**
 * Get Twitter stuff
 */
export class Twitter {
  /**
   * Constructor
   */
  constructor() {
    this._tweets = [];
  }

  /**
   * Import tweets
   */
  async init() {
    try {
      this._tweets = await tweetData.getAllTweets();
    } catch (e) {
      console.error(e);
    }
  }

  /**
   * Get tweets
   */
  get tweets() {
    return this._tweets;
  }

  // /**
  //  * Get individual tweet
  //  * @param {string} id id of tweet
  //  * @return {object}
  //  */
  // getTweet(id) {
  //   return getTweetById(id);
  // }

  // /**
  //  * Get replies to tweet
  //  * @param {string} id id of tweet
  //  * @return {object[]}
  //  */
  // getReplies(id) {
  //   return getRepliesToId(id);
  // }
}
