import { Client, Events, GatewayIntentBits } from 'discord.js';
import {
    execute as executeCosmetic,
    autocomplete as autocompleteCosmetic
} from './commands/cosmeticCommand';
import { initializeCosmeticCache } from './services/cosmeticService';
import { getLatestTweetLink, loginToTwitter } from "./twitter-scraper";
import { handleButtonInteraction } from "./events/buttonInteractionHandler";
import dotenv from 'dotenv';
import cron from 'node-cron';

dotenv.config();

// Create a new client instance
const client: Client<boolean> = new Client({ intents: [GatewayIntentBits.Guilds] });
const DISCORD_TOKEN: string | undefined = process.env.DISCORD_TOKEN;

client.once(Events.ClientReady, async readyClient => {
    console.log(`Logged in as ${readyClient.user.tag}`);

    await initializeCosmeticCache();

    // Set cron-job to check for new tweets every 60 seconds
    // Don't run during development
    if (process.env.BRANCH !== 'dev') {
        loginToTwitter().then(() => {
            cron.schedule('* * * * *', async () => {
                await getLatestTweetLink(client);
            });
        });
    }
});

client.on('interactionCreate', async interaction => {
    if (interaction.isChatInputCommand() && interaction.commandName === 'cosmetic') {
        await executeCosmetic(interaction);
    } else if (interaction.isAutocomplete() && interaction.commandName === 'cosmetic') {
        await autocompleteCosmetic(interaction);
    }

    if (interaction.isButton()) {
        await handleButtonInteraction(interaction);
    }
});

// Log in to Discord with your client's token
// noinspection JSIgnoredPromiseFromCall
client.login(DISCORD_TOKEN);