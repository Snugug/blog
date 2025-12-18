import { db } from './database.js';

/**
 * Database data source instance
 */
class DataSource {
  /**
   * Constructor to set up cache
   */
  constructor() {
    this.cache = {
      replies: {},
    };
  }

  /**
   *
   * @param {string} id Tweet ID
   * @return {object[]} Array of replies
   */
  async getRepliesToId(id) {
    if (!id) {
      return [];
    }

    // populate cache if it hasn’t yet.
    if (!this.cache.all) {
      await this.getAllTweets();
    }

    // full table scans for this was way too expensive, so we cache
    return this.cache.replies[id] ? Array.from(this.cache.replies[id]) : [];
  }

  /**
   *
   * @param {string} id
   * @return {object} Tweet object
   */
  async getTweetById(id) {
    if (!id) {
      return null;
    }
    // TODO get this from cache?

    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM tweets WHERE id_str = ?', { 1: id }, (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row ? this.normalizeTweetObject(row) : null);
        }
      });
    });
  }

  /**
   *
   * @return {object[]} Array of all tweets
   */
  async getAllTweets() {
    if (this.cache.all) {
      return this.cache.all;
    }
    if (this.cachedGetAllPromise) {
      return this.cachedGetAllPromise;
    }

    // This should only run once.
    this.cachedGetAllPromise = new Promise((resolve, reject) => {
      db.all('SELECT * FROM tweets', (err, rows) => {
        if (err) {
          reject(err);
        } else {
          const ret = rows
            .filter((row) => {
              if (row.hidden) {
                return false;
              }
              return true;
            })
            .map((row) => {
              const json = JSON.parse(row.json);
              json.date = new Date(json.date);
              if (json.in_reply_to_status_id_str) {
                if (!this.cache.replies[json.in_reply_to_status_id_str]) {
                  this.cache.replies[json.in_reply_to_status_id_str] =
                    new Set();
                }
                this.cache.replies[json.in_reply_to_status_id_str].add(json);
              }
              return json;
            });
          this.cache.all = ret;
          resolve(ret);
        }
      });
    });

    return this.cachedGetAllPromise;
  }
}

export const tweetData = new DataSource();
