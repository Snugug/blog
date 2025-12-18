import sqlite3 from 'sqlite3';
import { join } from 'path';
import process from 'process';

/**
 * Database for reuse in other areas
 */
export const db = new (sqlite3.verbose().Database)(
  join(process.cwd(), 'lib/tweetback/lib/tweets.db'),
);

/**
 *
 * @param {string} dateArg Date arg
 * @return {string} Transformed string
 */
function getDateString(dateArg) {
  const date = new Date(dateArg);
  const dateStr = date.toISOString().replace(/[T]/, ' ').replace(/Z/, '');
  return dateStr;
}

/**
 * Creates table if it doesn't exist
 */
export function createTable() {
  db.serialize(() => {
    db.run(
      'CREATE TABLE IF NOT EXISTS tweets (id_str TEXT PRIMARY KEY ASC, created_at TEXT, in_reply_to_status_id_str TEXT, in_reply_to_screen_name TEXT, full_text TEXT, json TEXT, api_version TEXT, hidden INTEGER)',
    );
  });
}

/**
 * if the tweet does not exist in the DB, resolves a promise with the tweet ID
 * @param {object} tweet
 * @return {string} tweet ID
 */
export function checkInDatabase(tweet) {
  // save tweet to db
  return new Promise(function (resolve, reject) {
    db.get(
      'SELECT * FROM tweets WHERE id_str = ?',
      { 1: tweet.id },
      function (err, row) {
        if (err) {
          reject(new Error(`Error on .get() ${err}`));
        } else if (row) {
          resolve(false);
        } else {
          resolve(tweet);
        }
      },
    );
  });
}

/**
 * Saves to database
 * @param {Object} tweet
 */
export function saveToDatabaseApiV1(tweet) {
  const API_VERSION = 1;

  db.parallelize(function () {
    const stmt = db.prepare(
      'INSERT OR IGNORE INTO tweets VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    );
    stmt.run(
      tweet.id,
      getDateString(tweet.date),
      tweet.reply.toTweetId,
      tweet.reply.to,
      tweet.text,
      JSON.stringify(tweet),
      API_VERSION,
      '',
    );
    stmt.finalize();
  });
}

/**
 * Logs total number of tweets
 */
export async function archiveCount() {
  return new Promise(function (resolve) {
    db.each('SELECT COUNT(*) AS count FROM tweets', function (err, row) {
      resolve(row?.count || 0);
    });
  });
}
