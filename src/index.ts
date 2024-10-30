import { Client, Events, GatewayIntentBits } from 'discord.js';
import {
    initializeCosmeticCache,
    initializeCharactersCache
} from './services';
import {
    startTweetJob,
    startCacheManagerJob
} from "./jobs/";
import interactionCreate from "./events/interactionCreate";
import dotenv from 'dotenv';

dotenv.config();

// Create a new client instance
const client: Client<boolean> = new Client({ intents: [GatewayIntentBits.Guilds] });
const DISCORD_TOKEN: string | undefined = process.env.DISCORD_TOKEN;

client.once(Events.ClientReady, async readyClient => {
    console.log(`Logged in as ${readyClient.user.tag}`);

    await initializeCosmeticCache();
    await initializeCharactersCache();

    // Set cron-job to refresh cached data every hour
    await startCacheManagerJob();

    // Set cron-job to check for new tweets every 60 seconds
    // Don't run during development
    if (process.env.BRANCH !== 'dev') {
        await startTweetJob(client);
    }
});

client.on(Events.InteractionCreate, async interaction => {
    await interactionCreate(client, interaction);
});

// Log in to Discord with your client's token
// noinspection JSIgnoredPromiseFromCall
client.login(DISCORD_TOKEN);