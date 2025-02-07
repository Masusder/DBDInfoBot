import { startTweetJob } from "./tweetJob";
import { startShrineJob } from "./shrineJob";
import { startNewsJob } from "./newsJob";
import { startBundleJob } from "./bundleJob";

async function initializeCronJobs() {
    // Don't run during development
    if (process.env.BRANCH !== 'dev') {
        // Check for new tweets every 60 seconds
        await startTweetJob();
        // Check for new Shrine
        await startShrineJob();
        // Check for in-game news
        await startNewsJob();
        // Check for in-game bundles
        await startBundleJob();
    }
}

export default initializeCronJobs;