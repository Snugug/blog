import Sentiment from 'sentiment';
// import { parseDomain } from 'parse-domain';
import eleventyImg from '@11ty/eleventy-img';
import { transform as twitterLink } from '@tweetback/canonical';
import { config } from '../config.js';

const ELEVENTY_IMG_OPTIONS = {
  widths: [null],
  formats: ['jpeg'],
  outputDir: config.outputDir,
  urlPath: config.urlPath,
  cacheDuration: '*',
  filenameFormat: function (id, src, width, format, options) {
    return `${id}.${format}`;
  },
};

const sentiment = new Sentiment();

/**
 * Determines if tweet is the original post
 * @param {object} tweet
 * @return {boolean}
 */
// function isOriginalPost(tweet) {
//   return !isRetweet(tweet) && !isMention(tweet) && !isReply(tweet);
// }

/**
 * Determines if tweet is a reply
 * @param {object} tweet
 * @return {boolean}
 */
function isReply(tweet) {
  return !!tweet.in_reply_to_status_id;
}

/**
 * Determines if tweet is a retweet
 * @param {object} tweet
 * @return {boolean}
 */
function isRetweet(tweet) {
  return (
    tweet &&
    (tweet.full_text.startsWith('RT ') ||
      // alternate version of manual old school retweet
      tweet.full_text.startsWith('RT: '))
  );
}

/**
 * Determines if tweet is a mention
 * @param {object} tweet
 * @return {boolean}
 */
function isMention(tweet) {
  return (
    !isReply(tweet) &&
    tweet.full_text.trim().startsWith('@') &&
    !tweet.full_text.trim().startsWith('@font-face ')
  );
}

/**
 * Get links from URLs
 * @param {object} tweet
 * @return {object[]}
 * @example
 * getLinks(tweet)
 * // => [{host: 'https://example.com', origin: 'https://example.com, domain: 'example.com'}]
 */
// function getLinkUrls(tweet) {
//   const links = [];

//   if (tweet.entities && tweet.entities.urls) {
//     for (const url of tweet.entities.urls) {
//       try {
//         const urlObj = new URL(url.expanded_url);
//         const parsedDomain = parseDomain(urlObj.host);
//         links.push({
//           host: urlObj.host,
//           origin: urlObj.origin,
//           domain: `${parsedDomain.domain}.${parsedDomain.tld}`,
//         });
//       } catch (e) {
//         console.log(e);
//       }
//     }
//   }

//   return links;
// }

/**
 * Gets tweet text sentiment
 * @param {object} tweet
 * @return {number}
 */
function getSentiment(tweet) {
  return sentiment.analyze(tweet.full_text).score;
}

/**
 * Gets URL objects for tweet
 * @param {object} url
 * @return {object}
 */
function getUrlObject(url) {
  let displayUrl = url.expanded_url;
  let className = 'tweet-url';
  let targetUrl = url.expanded_url;

  // Links to my tweets
  if (displayUrl.startsWith(`https://twitter.com/${config.username}/status/`)) {
    targetUrl = `/${url.expanded_url.substr(
      `https://twitter.com/${config.username}/status/`.length,
    )}`;
  }

  // Links to other tweets
  if (
    displayUrl.startsWith('https://twitter.com') &&
    displayUrl.indexOf('/status/') > -1
  ) {
    displayUrl = displayUrl.substring('https://twitter.com/'.length);
    displayUrl = displayUrl.replace('/status/', '/');
    // displayUrl = displayUrl.replace(/(\d+)/, function(match) {
    // 	return "" + (match.length > 6 ? "…" : "") + match.substr(-6);
    // });
    className = 'tweet-username';
  } else {
    if (displayUrl.startsWith('http://')) {
      displayUrl = displayUrl.substring('http://'.length);
    }
    if (displayUrl.startsWith('https://')) {
      displayUrl = displayUrl.substring('https://'.length);
    }
    if (displayUrl.startsWith('www.')) {
      displayUrl = displayUrl.substring('www.'.length);
    }
  }

  displayUrl = displayUrl.replace(/\/$/, '');
  return {
    displayUrl,
    className,
    targetUrl,
  };
}

/**
 *
 * @param {object} tweet
 * @return {string}
 */
async function normalizeTweetText(tweet) {
  let text = tweet.full_text;

  const medias = [];

  // linkify urls
  if (tweet.entities) {
    for (const url of tweet.entities.urls) {
      // || url.expanded_url.indexOf(`/${tweet.id}/video/`) > -1) {
      if (url.expanded_url.indexOf(`/${tweet.id}/photo/`) > -1) {
        text = text.replace(url.url, '');
      } else {
        let { targetUrl, displayUrl } = getUrlObject(url);
        targetUrl = twitterLink(targetUrl);
        const displayUrlMarkdown = `[${displayUrl}](${targetUrl})`;
        text = text.replace(url.url, displayUrlMarkdown);

        if (
          targetUrl.startsWith('https://') &&
          !targetUrl.startsWith('https://twitter.com/')
        ) {
          medias.push({
            type: 'link',
            url: targetUrl,
          });
          // medias.push(
          //   `<a href="${targetUrl}"><img src="https://v1.opengraph.11ty.dev/${encodeURIComponent(
          //     targetUrl,
          //   )}/small/" alt="OpenGraph image for ${displayUrl}" loading="lazy" decoding="async" width="375" height="197" class="tweet-media tweet-media-og"></a>`,
          // );
        }
      }
    }

    for (const mention of tweet.entities.user_mentions) {
      const usernameMatch = new RegExp(`@${mention.screen_name}`, 'i');
      text = text.replace(
        usernameMatch,
        `[@${mention.screen_name}](${twitterLink(
          `https://twitter.com/${mention.screen_name}/`,
        )})`,
      );
    }
  }

  if (tweet.extended_entities) {
    for (const media of tweet.extended_entities.media) {
      if (media.type === 'photo') {
        // remove photo URL
        text = text.replace(media.url, '');

        // TODO the await use here on eleventyImg could be improved
        try {
          const stats = await eleventyImg(
            media.media_url_https,
            ELEVENTY_IMG_OPTIONS,
          );
          const imgRef = stats.jpeg[0];
          medias.push({
            type: 'image',
            url: imgRef.url,
            downloaded: true,
            width: imgRef.width,
            height: imgRef.height,
            alt:
              media.alt_text ||
              `Twitter doesn't include alt text from images in their API`,
          });
        } catch (e) {
          // console.log('Image request error', e.message);
          medias.push({
            type: 'image',
            url: media.media_url_https,
            downloaded: false,
          });
        }
      } else if (media.type === 'animated_gif' || media.type === 'video') {
        if (media.video_info && media.video_info.variants) {
          text = text.replace(media.url, '');

          const remoteVideoUrl = media.video_info.variants[0].url;

          try {
            const stats = await eleventyImg(
              media.media_url_https,
              ELEVENTY_IMG_OPTIONS,
            );
            const imgRef = stats.jpeg[0];
            medias.push({
              type: 'video',
              loop: media.type === 'animated_gif',
              src: remoteVideoUrl,
              poster: imgRef.url,
            });
          } catch (e) {
            // console.log('Video request error', e.message);
            medias.push({
              type: 'link',
              url: remoteVideoUrl,
            });
          }
        }
      }
    }
  }

  return {
    text,
    media: medias,
  };
}

/**
 * takes a db row, returns the tweet json
 * @param {object} json Database row
 * @return {object}
 */
function normalizeTweetObject(json) {
  if (json?.api_version === '2') {
    const replies = (json.referenced_tweets || []).filter(
      (entry) => entry.type === 'replied_to',
    );
    const replyTweetId = replies.length ? replies[0].id : null;

    const obj = {};
    obj.date = new Date(Date.parse(json.created_at));
    obj.id = json.id;
    obj.id_str = json.id;
    // should always be a string
    obj.full_text = json.text || '';
    obj.truncated = false;
    obj.retweet_count = json.public_metrics.retweet_count;
    obj.favorite_count = json.public_metrics.like_count;
    obj.quote_count = json.public_metrics.quote_count;
    obj.reply_count = json.public_metrics.reply_count;
    obj.in_reply_to_status_id = replyTweetId;
    obj.in_reply_to_status_id_str = replyTweetId;
    obj.in_reply_to_user_id = json.in_reply_to_user_id;
    obj.in_reply_to_user_id_str = json.in_reply_to_user_id;
    obj.in_reply_to_screen_name = json?.in_reply_to_screen_name; // use the db row instead of the json
    obj.entities = json.entities || {};

    if (json.entities && json.entities.urls) {
      obj.entities.urls = json.entities.urls;
    } else {
      obj.entities.urls = [];
    }

    if (json.entities && json.entities.mentions) {
      obj.entities.user_mentions = json.entities.mentions.map((entry) => {
        entry.screen_name = entry.username;
        return entry;
      });
    } else {
      obj.entities.user_mentions = [];
    }

    // Normalized before inserted in to the DB (see tweet-to-db.js)
    obj.extended_entities = json.extended_entities;

    return obj;
  }

  json.date = new Date(json.created_at);
  // should always be a string
  json.entities = json.entities || {};
  json.entities.urls = json.entities.urls || [];
  json.entities.user_mentions = json.entities.user_mentions || [];
  json.full_text = json.full_text || '';
  return json;
}

/**
 * Normalizes tweet
 * @param {object} rawTweet
 * @return {object}
 */
export async function parseTweet(rawTweet) {
  if (!rawTweet) return;
  const tweet = normalizeTweetObject(rawTweet);
  const sentiment = getSentiment(tweet);
  const normalizedText = await normalizeTweetText(tweet);

  return Object.assign(
    {
      id: tweet.id_str,
      sentiment,
      date: new Date(tweet.date),
      reply: {
        to: tweet.in_reply_to_screen_name,
        toId: tweet.in_reply_to_user_id_str,
        toTweetId: tweet.in_reply_to_status_id_str,
        isReply: isReply(tweet),
      },
      retweet: isRetweet(tweet),
      mention: isMention(tweet),
      shares:
        parseInt(tweet.retweet_count, 10) +
        (tweet.quote_count ? tweet.quote_count : 0),
      favorites: parseInt(tweet.favorite_count, 10),
    },
    normalizedText,
  );
}
