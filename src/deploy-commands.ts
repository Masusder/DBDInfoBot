import { REST, Routes } from 'discord.js';
import initI18next from "./i18n";
import i18next from "i18next";
import * as dotenv from 'dotenv';

dotenv.config();

async function deployCommands() {
    try {
        console.log('Loaded translations:', i18next.store.data);

        console.log('Started refreshing application (/) commands.');

        // Command imports are lazy loaded
        // Because we need to serialize the commands after i18next initialization
        const { data: cosmeticCommand } = await import('@commands/cosmeticCommand');
        const { data: cosmeticListCommand } = await import('@commands/cosmeticListCommand');
        const { data: buildListCommand } = await import('@commands/buildListCommand');
        const { data: infoCommand } = await import('@commands/infoCommand');
        const { data: shrineCommand} = await import('@commands/shrineCommand');

        const commands = [
            cosmeticCommand.toJSON(),
            cosmeticListCommand.toJSON(),
            buildListCommand.toJSON(),
            infoCommand?.toJSON(),
            shrineCommand?.toJSON()
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

(async () => {
    await initializeAndDeploy();
})();