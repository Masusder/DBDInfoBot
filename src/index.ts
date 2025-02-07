import { Events } from 'discord.js';
import { registerFont } from "canvas";
import { startCacheAnalytics } from "./cache";
import interactionCreate from "./interactions/interactionCreate";
import initializeCronJobs from "./jobs";
import initI18next from "./locales/i18n";
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

    // Register Roboto font for Canvas library
    registerFont('./src/resources/Roboto-Black.ttf', { family: 'Roboto' }); // DBDCoreFont.uasset

    client.once(Events.ClientReady, async(readyClient) => {
        console.log(`Logged in as ${readyClient.user.tag}`);

        await initializeCronJobs();
        startCacheAnalytics();
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