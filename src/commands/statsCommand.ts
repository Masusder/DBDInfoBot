import { SlashCommandBuilder } from '@discordjs/builders';
import {
    AutocompleteInteraction,
    ChatInputCommandInteraction
} from "discord.js";
import i18next from "i18next";
import { handlePersonalStatsCommandInteraction } from "@commands/statsSubCommands/personalStats.ts";
// import { handleGlobalStatsCommandInteraction } from "@commands/statsSubCommands/globalStats";


export const data = i18next.isInitialized
    ? new SlashCommandBuilder()
        .setName('stats')
        .setDescription('View Steam statistics (global or personal).')
        .addSubcommand((subcommand) =>
            subcommand
                .setName('global')
                .setDescription('View global statistics.')
        )
        .addSubcommand((subcommand) =>
            subcommand
                .setName('personal')
                .setDescription('View a summarized infographic of player statistics.')
                .addStringOption((option) =>
                    option
                        .setName('steam_id')
                        .setDescription('The Steam ID, username, or profile URL of the player whose statistics you want to view.')
                        .setRequired(true)
                )
        ) : undefined;

export async function execute(interaction: ChatInputCommandInteraction) {
    const subcommand = interaction.options.getSubcommand();
    const locale = interaction.locale;

    switch (subcommand) {
        // case 'global':
        //     await handleGlobalStatsCommandInteraction(interaction);
        //     break;
        case 'personal':
            await handlePersonalStatsCommandInteraction(interaction);
            break;
        default:
            //await interaction.reply(getTranslation('list_command.unknown_subcommand', locale, 'errors'));
            break;
    }
}