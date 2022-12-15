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
      this._tweets = (await tweetData.getAllTweets()).sort((a, b) =>
        a.date > b.date ? -1 : 1,
      );
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

  /**
   *
   * @param {string} id Tweet ID
   * @return {object[]} Array of replies
   */
  getReplies(id) {
    return this._tweets.filter(
      (tweet) =>
        tweet?.reply?.toTweetId === id && tweet?.reply?.isReply === true,
    );
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
