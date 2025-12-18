import {
  checkInDatabase,
  archiveCount,
  saveToDatabaseApiV1,
} from './database.js';
import cliProgress from 'cli-progress';
import { tweets } from '../tweets.js';
import { parseTweet } from './parser.js';

const shouldFilterOutCircleTweets = process.argv.includes('removecircletweets');

/**
 * Retrieve tweets from the database.
 */
export async function retrieveTweets() {
  const bar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
  let existingCount = 0;
  let missingCount = 0;
  let circleCount = 0;
  let circleTweets = 0;

  console.log('Tweets in archive: ', tweets.length);
  console.log('Tweets in database:', await archiveCount());
  console.log('\nChecking database...');

  bar.start(tweets.length, 0);

  /**
   * Determine if tweet is for circles
   * @param {object} tweet
   * @return {boolean}
   */
  function tweetIsForCircles(tweet) {
    return circleTweets.some(
      (circleTweet) => circleTweet.tweet.id_str === tweet.id_str,
    );
  }

  if (shouldFilterOutCircleTweets) {
    try {
      // I know this may be missing, so I'm disabling the linter.
      /* eslint-disable n/no-missing-import */
      const { circleTweets: circles } =
        await import('../twitter-circle-tweets.js');
      /* eslint-enable n/no-missing-import */
      circleTweets = circles;
    } catch (e) {
      console.log('No circle tweets found.');
    }
  }

  for (const { tweet } of tweets) {
    const t = await checkInDatabase(tweet);
    if (t === false) {
      existingCount++;
    } else if (shouldFilterOutCircleTweets && tweetIsForCircles(t)) {
      circleCount++;
    } else {
      missingCount++;
      const parsed = await parseTweet(t);
      saveToDatabaseApiV1(parsed);
    }

    bar.update(existingCount + missingCount + circleCount);
  }
  bar.stop();
  console.log(' Existing:', existingCount);
  console.log(' Missing: ', missingCount);
  if (shouldFilterOutCircleTweets) {
    console.log(' Circle:  ', circleCount);
  }
}
