import { REST, Routes } from 'discord.js';
import * as dotenv from 'dotenv';
import { data as cosmeticCommand } from './commands/cosmeticCommand';
import { data as cosmeticListCommand } from './commands/cosmeticListCommand';
import { data as buildListCommand } from './commands/buildListCommand';

dotenv.config();

const commands = [
    cosmeticCommand.toJSON(),
    cosmeticListCommand.toJSON(),
    buildListCommand.toJSON()
];

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN!);

(async() => {
    try {
        console.log('Started refreshing application (/) commands.');

        // Register guild-specific commands for testing (faster updates), or global commands for general use
        const route = process.env.GUILD_ID
            ? Routes.applicationGuildCommands(process.env.DISCORD_CLIENT_ID!, process.env.GUILD_ID!)
            : Routes.applicationCommands(process.env.DISCORD_CLIENT_ID!);

        await rest.put(route, { body: commands });

        console.log('Successfully reloaded application (/) commands.');
    } catch (error) {
        console.error('Error deploying commands:', error);
    }
})();