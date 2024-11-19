import {
    Client,
    Events,
    GatewayIntentBits
} from 'discord.js';
import {
    startTweetJob,
    startShrineJob
} from "./jobs/";
import interactionCreate from "./interactions/interactionCreate";
import initI18next from "./i18n";
import dotenv from 'dotenv';

dotenv.config();

// Create a new client instance
const client: Client<boolean> = new Client({ intents: [GatewayIntentBits.Guilds] });
const DISCORD_TOKEN: string | undefined = process.env.DISCORD_TOKEN;

client.once(Events.ClientReady, async readyClient => {
    console.log(`Logged in as ${readyClient.user.tag}`);

    // Don't run during development
    if (process.env.BRANCH !== 'dev') {
        // Check for new tweets every 60 seconds
        await startTweetJob(client);
        // Check for new Shrine
        await startShrineJob(client);
    }
});

client.on(Events.InteractionCreate, async interaction => {
    await interactionCreate(interaction);
});

initI18next().then(() => {
    console.log('i18next setup complete');
}).catch((err) => {
    console.error('Error during i18next setup:', err);
});

// Log in to Discord with your client's token
// noinspection JSIgnoredPromiseFromCall
client.login(DISCORD_TOKEN);