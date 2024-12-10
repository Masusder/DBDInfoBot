import { SlashCommandBuilder } from '@discordjs/builders';
import {
    AutocompleteInteraction,
    ChatInputCommandInteraction
} from "discord.js";
import i18next from "i18next";
import { handlePersonalStatsCommandInteraction } from "@commands/statsSubCommands/personalStats.ts";
import { commandLocalizationHelper } from "@utils/localizationUtils.ts";
// import { handleGlobalStatsCommandInteraction } from "@commands/statsSubCommands/globalStats";


export const data = i18next.isInitialized
    ? new SlashCommandBuilder()
        .setName('stats')
        .setNameLocalizations(commandLocalizationHelper('stats_command.name'))
        .setDescription(i18next.t('stats_command.description', { lng: 'en' }))
        .setDescriptionLocalizations(commandLocalizationHelper('stats_command.description'))
        .addSubcommand((subcommand) =>
            subcommand
                .setName('global')
                .setNameLocalizations(commandLocalizationHelper('stats_command.global_subcommand.name'))
                .setDescription(i18next.t('stats_command.global_subcommand.description', { lng: 'en' }))
                .setDescriptionLocalizations(commandLocalizationHelper('stats_command.global_subcommand.description'))
        )
        .addSubcommand((subcommand) =>
            subcommand
                .setName('personal')
                .setNameLocalizations(commandLocalizationHelper('stats_command.personal_subcommand.name'))
                .setDescription(i18next.t('stats_command.personal_subcommand.description', { lng: 'en' }))
                .setDescriptionLocalizations(commandLocalizationHelper('stats_command.personal_subcommand.description'))
                .addStringOption((option) =>
                    option
                        .setName('steam_id')
                        .setNameLocalizations(commandLocalizationHelper('stats_command.personal_subcommand.options.steam_id.name'))
                        .setDescription(i18next.t('stats_command.personal_subcommand.options.steam_id.description', { lng: 'en' }))
                        .setDescriptionLocalizations(commandLocalizationHelper('stats_command.personal_subcommand.options.steam_id.description'))
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
            break;
    }
}