import cron from 'node-cron';
import { Client } from 'discord.js';
import { getLatestTweetLink, loginToTwitter } from '../integrations/twitter-scraper';

export async function startTweetJob(client: Client) {
    loginToTwitter().then(() => {
        cron.schedule('* * * * *', async () => {
            await getLatestTweetLink(client);
        });
    });
}