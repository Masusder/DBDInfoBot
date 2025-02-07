import {
    ChannelType,
    NewsChannel
} from "discord.js";
import {
    Scraper,
    Tweet
} from '@the-convocation/twitter-scraper';
import Constants from "@constants";
import client from "../client";
import publishMessage from "@utils/discord/publishMessage";

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
 * @param {NewsChannel} channel - The Discord channel where the check is performed.
 * @param {string} tweetUrl - The tweet URL to check for in the channel.
 * @returns {Promise<boolean>} - A promise that resolves to `true` if the URL has been posted, `false` otherwise.
 * @throws {Error} If there is an error fetching the channel messages.
 *
 */
async function hasUrlBeenPosted(channel: NewsChannel, tweetUrl: string): Promise<boolean> {
    try {
        const messages = await channel.messages.fetch({ limit: 10 });
        const urlsInMessages = messages
            .map(message => {
                const matches = message.content.match(/https?:\/\/\S+/g);
                return matches ? matches : [];
            })
            .flat();

        return urlsInMessages.includes(tweetUrl);
    } catch (error) {
        console.error('Error fetching channel messages:', error);
        return false;
    }
}

/**
 * Logs into Twitter if not already logged in.
 *
 * @async
 * @returns {Promise<boolean>} - A promise that resolves to `true` if logged in.
 */
async function ensureLoggedIn(): Promise<boolean> {
    const isLoggedIn = await scraper.isLoggedIn();

    if (!isLoggedIn) {
        return loginToTwitter().then(() => true).catch(() => false);
    }

    return isLoggedIn;
}

/**
 * Converts a Twitter URL to an VXTwitter URL by replacing `twitter.com` with `vxtwitter.com`.
 * This is done to get better SEO on external platforms.
 *
 * @param {string} url - The original Twitter URL.
 * @returns {string} The converted VXTwitter URL.
 *
 * @example
 * convertToVxTwitter("https://twitter.com/user/status/12345");
 * // Returns: "https://vxtwitter.com/user/status/12345"
 */
function convertToVxTwitter(url: string): string {
    return url.replace('twitter.com', 'vxtwitter.com');
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
export async function getLatestTweetLink() {
    console.log(`Checking for new Tweets - ${new Date()}`);

    if (isFetchingTweets) {
        console.log('Skipping execution: Tweet fetching is already in progress.');
        return;
    }

    isFetchingTweets = true;

    try {
        const isLoggedIn = await ensureLoggedIn();
        if (!isLoggedIn) {
            console.error("Not logged in. Cannot fetch tweets.");
            return;
        }

        const tweetsAsyncGenerator: AsyncGenerator<Tweet> = scraper.getTweets('DeadbyDaylight', 1);
        const tweetResult = await tweetsAsyncGenerator.next();

        if (!tweetResult || tweetResult.done || !tweetResult.value) {
            console.log('No new tweets found.');
            return;
        }

        const latestTweet = tweetResult.value;
        const tweetUrl = latestTweet.permanentUrl;

        if (!tweetUrl) {
            console.warn("Tweet URL is undefined. Skipping this tweet.");
            return;
        }

        const vxTweetUrl = convertToVxTwitter(tweetUrl);

        if (vxTweetUrl === latestTweetLink) {
            console.log('No new tweets found. URL remains the same.');
            return;
        }

        const channel = client.channels.cache.get(Constants.DBDLEAKS_DBD_NEWS_CHANNEL_ID) as NewsChannel;
        if (!channel) {
            console.error('Text channel not found. Unable to send tweet.');
            return;
        }

        if (channel.type !== ChannelType.GuildAnnouncement) {
            console.error('Twitter News: Invalid channel type. Only Announcement Channel is supported.');
            return;
        }

        const urlAlreadyPosted = await hasUrlBeenPosted(channel, vxTweetUrl);
        if (urlAlreadyPosted) {
            console.log('This Tweet has already been posted.');
            return;
        }

        latestTweetLink = vxTweetUrl;

        const content = `<@&${Constants.DBDLEAKS_NEWS_NOTIFICATION_ROLE}>\n${vxTweetUrl}`;
        const message = await channel.send(content);

        publishMessage(message, channel).catch(error => {
            console.error(`Failed to publish message:`, error);
        });

        console.log('New tweet posted successfully.');
    } catch (error) {
        console.error('Error fetching or posting tweets:', error);
    } finally {
        isFetchingTweets = false;
    }
}