import { Client, TextChannel } from "discord.js";
import { Scraper, Tweet } from '@the-convocation/twitter-scraper';
import Constants from "./constants";

const scraper = new Scraper();

let latestTweetLink: string = '';
let isFetchingTweets = false;

/**
 * Logs into Twitter using credentials stored in environment variables (.env file).
 * This function uses the `scraper.login` method to perform the login.
 *
 * @async
 * @function loginToTwitter
 * @throws {Error} If there is an issue logging into Twitter.
 *
 * @example
 * loginToTwitter()
 *    .then(() => console.log('Logged in successfully'))
 *    .catch(error => console.error('Login failed:', error));
 */
export async function loginToTwitter() {
    const username = process.env['TWITTER_USERNAME'] as string;
    const password = process.env['TWITTER_PASSWORD'] as string;
    const email = process.env['TWITTER_EMAIL'] as string;

    if (!username || !password || !email) {
        throw new Error("Missing environment variables.");
    }

    try {
        await scraper.login(username, password, email);
        console.log('Login to Twitter was successful.');
    } catch (error) {
        console.error('Error logging to Twitter:', error);
    }
}

/**
 * Checks if a tweet URL has already been posted in the specified Discord channel.
 *
 * @async
 * @param {TextChannel} channel - The Discord channel where the check is performed.
 * @param {string} tweetUrl - The tweet URL to check for in the channel.
 * @returns {Promise<boolean>} - A promise that resolves to `true` if the URL has been posted, `false` otherwise.
 * @throws {Error} If there is an error fetching the channel messages.
 *
 */
async function hasUrlBeenPosted(channel: TextChannel, tweetUrl: string): Promise<boolean> {
    try {
        const messages = await channel.messages.fetch({ limit: 10 });
        const urlsInMessages = messages.map(message => message.content);

        return urlsInMessages.includes(tweetUrl);
    } catch (error) {
        console.error('Error fetching channel messages:', error);
        return false;
    }
}

/**
 * Logs into Twitter if not already logged in.
 */
async function ensureLoggedIn() {
    const isLoggedIn = await scraper.isLoggedIn();

    if (!isLoggedIn) {
        await loginToTwitter();
    }
}

/**
 * Converts a Twitter URL to an FXTwitter URL by replacing `twitter.com` with `fxtwitter.com`.
 * This is done to get better SEO on external platforms.
 *
 * @param {string} url - The original Twitter URL.
 * @returns {string} The converted FXTwitter URL.
 *
 * @example
 * convertToFxTwitter("https://twitter.com/user/status/12345");
 * // Returns: "https://fxtwitter.com/user/status/12345"
 */
function convertToFxTwitter(url: string): string {
    return url.replace('twitter.com', 'fxtwitter.com');
}

/**
 * Fetches the latest tweet link from a Dead by Daylight Twitter account and posts it to a Discord channel
 * if it hasn't been posted already.
 *
 * @async
 * @function getLatestTweetLink
 * @throws {Error} If there is an error fetching the tweets or posting to Discord.
 *
 * @example
 * setInterval(getLatestTweetLink, 60000);
 * // This will check for new tweets every 60 seconds.
 */
export async function getLatestTweetLink(client: Client) {
    console.log(`Checking for new Tweets - ${new Date()}`);

    if (isFetchingTweets) {
        console.log('Skipping execution: Tweet fetching is already in progress.');
        return;
    }

    isFetchingTweets = true;

    try {
        await ensureLoggedIn();
        const tweetsAsyncGenerator: AsyncGenerator<Tweet> = scraper.getTweets('DeadbyDaylight', 1);

        const { value: latestTweet, done } = await tweetsAsyncGenerator.next();

        if (!done && latestTweet) {
            const tweetUrl = latestTweet.permanentUrl;

            if (!tweetUrl) {
                console.error("Tweet URL was undefined. Skipping this tweet.");
                return;
            }

            const fxTweetUrl: string = convertToFxTwitter(tweetUrl);
            if (fxTweetUrl !== latestTweetLink) {
                latestTweetLink = fxTweetUrl;
                const channel = client.channels.cache.get(Constants.DBDLEAKS_DBD_NEWS_CHANNEL_ID) as TextChannel;
                if (channel) {
                    const urlAlreadyPosted: boolean = await hasUrlBeenPosted(channel, fxTweetUrl);

                    if (!urlAlreadyPosted) {
                        await channel.send(fxTweetUrl);
                    } else {
                        console.log('This Tweet has already been posted.')
                    }
                } else {
                    console.error('Not found specified text channel. Unable to send tweet.');
                }
            } else {
                console.log('All good. Tweet URL remains the same.');
            }
        } else {
            console.error('No new tweets found.');
        }
    } catch (error) {
        console.error('Error fetching tweets:', error);
    } finally {
        isFetchingTweets = false;
    }
}