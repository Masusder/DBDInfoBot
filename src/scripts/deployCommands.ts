import {
    REST,
    Routes
} from 'discord.js';
import initI18next from "../locales/i18n";
import i18next from "i18next";
import * as dotenv from 'dotenv';

dotenv.config();

async function deployCommands() {
    try {
        console.log('Loaded translations:', i18next.store.data);

        console.log('Started refreshing application (/) commands.');

        // Command imports are lazy loaded
        // Because we need to serialize the commands after i18next initialization
        const { data: infoCommand } = await import('@commands/infoCommand');
        const { data: shrineCommand } = await import('@commands/shrineCommand');
        const { data: listCommand } = await import('@commands/listCommand');
        const { data: newsCommand } = await import('@commands/newsCommand');
        const { data: statsCommand } = await import('@commands/statsCommand');

        const commands = [
            infoCommand?.toJSON(),
            shrineCommand?.toJSON(),
            listCommand?.toJSON(),
            newsCommand?.toJSON(),
            statsCommand?.toJSON()
        ];

        const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN!);

        // Register guild-specific commands for testing (faster updates), or global commands for general use
        const route = process.env.GUILD_ID
            ? Routes.applicationGuildCommands(process.env.DISCORD_CLIENT_ID!, process.env.GUILD_ID!)
            : Routes.applicationCommands(process.env.DISCORD_CLIENT_ID!);

        await rest.put(route, { body: commands });

        console.log('Successfully reloaded application (/) commands.');
    } catch (error) {
        console.error('Error deploying commands:', error);
    }
}

async function initializeAndDeploy() {
    try {
        await initI18next();
        await deployCommands();
    } catch (error) {
        console.error('Error during initialization or command deployment:', error);
    }
}

(async() => {
    await initializeAndDeploy();
})();