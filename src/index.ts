import { Client, Events, GatewayIntentBits } from 'discord.js';
import {
    initializeCosmeticCache,
    initializeCharactersCache, initializePerksCache
} from './services';
import {
    startTweetJob,
    startCacheManagerJob
} from "./jobs/";
import interactionCreate from "./interactions/interactionCreate";
import dotenv from 'dotenv';
import { bulkProcessInitialization } from "./jobs/cacheManagerJob";

dotenv.config();

// Create a new client instance
const client: Client<boolean> = new Client({ intents: [GatewayIntentBits.Guilds] });
const DISCORD_TOKEN: string | undefined = process.env.DISCORD_TOKEN;

client.once(Events.ClientReady, async readyClient => {
    console.log(`Logged in as ${readyClient.user.tag}`);

    await bulkProcessInitialization();

    // Set cron-job to refresh cached data every hour
    await startCacheManagerJob();

    // Set cron-job to check for new tweets every 60 seconds
    // Don't run during development
    if (process.env.BRANCH !== 'dev') {
        await startTweetJob(client);
    }
});

client.on(Events.InteractionCreate, async interaction => {
    await interactionCreate(interaction);
});

// Log in to Discord with your client's token
// noinspection JSIgnoredPromiseFromCall
client.login(DISCORD_TOKEN);