// Mastodon webfinger implementation
// From https://www.seanmcp.com/articles/use-your-domain-on-mastodon-with-astro/

// The Mastodon instance and user to alias
const INSTANCE = 'mas.to';
const USERNAME = 'snugug';

/**
 * This endpoint adds a webfinger JSON file as a catch-all alias for your Mastodon account. Any account (@username@domain) will render to this account (unfortunately there's no way in SSG mode to catch the query string and redirect or filter to the correct account)
 */
export async function get() {
  // Fetch the Mastodon user's profile
  const response = await fetch(
    `https://${INSTANCE}/.well-known/webfinger?resource=acct:${USERNAME}@${INSTANCE}`,
  );
  const data = await response.json();

  // Return the JSON file. Need to stringify it or it outputs as [object Object]
  return { body: JSON.stringify(data, null, 2) };
}
