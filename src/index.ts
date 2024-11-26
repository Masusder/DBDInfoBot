import { Events } from 'discord.js';
import {
    startTweetJob,
    startShrineJob
} from "./jobs/";
import interactionCreate from "./interactions/interactionCreate";
import initI18next from "./i18n";
import client from './client';
import dotenv from 'dotenv';

dotenv.config();

const DISCORD_TOKEN: string | undefined = process.env.DISCORD_TOKEN;

async function initializeClient() {
    // Initialize i18next first to set up the localization system
    try {
        await initI18next();
        console.log('i18next setup complete');
    } catch (err) {
        console.error('Error during i18next setup:', err);
        return; // If i18next fails, don't proceed with client initialization
    }

    client.once(Events.ClientReady, async(readyClient) => {
        console.log(`Logged in as ${readyClient.user.tag}`);

        // Don't run during development
        if (process.env.BRANCH !== 'dev') {
            // Check for new tweets every 60 seconds
            await startTweetJob(client);
            // Check for new Shrine
            await startShrineJob(client);
        }
    });

    // Handle interactions
    client.on(Events.InteractionCreate, async(interaction) => {
        await interactionCreate(interaction);
    });

    // Log in to Discord
    try {
        await client.login(DISCORD_TOKEN);
    } catch (err) {
        console.error('Error during client login:', err);
    }
}

// Execute the initialization
initializeClient().catch((err) => {
    console.error('Failed to initialize bot:', err);
});