import { Twitter } from './lib/twitter.js';

const twitter = new Twitter();

await twitter.init();

export default twitter;
