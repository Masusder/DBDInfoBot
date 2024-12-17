import cron from 'node-cron';
import { getLatestTweetLink, loginToTwitter } from '../integrations/twitterScraper';

export async function startTweetJob() {
    loginToTwitter().then(() => {
        cron.schedule('* * * * *', async () => {
            await getLatestTweetLink();
        });
    });
}