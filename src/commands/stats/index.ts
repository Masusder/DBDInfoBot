import { SlashCommandBuilder } from '@discordjs/builders';
import { ChatInputCommandInteraction } from "discord.js";
import i18next from "i18next";
import { handlePersonalStatsCommandInteraction } from "@commands/stats/personal";
import { commandLocalizationHelper } from "@utils/localizationUtils";
import { handleGlobalStatsCommandInteraction } from "@commands/stats/global";

export const data = i18next.isInitialized
    ? new SlashCommandBuilder()
        .setName('stats')
        .setNameLocalizations(commandLocalizationHelper('stats_command.name'))
        .setDescription(i18next.t('stats_command.description', { lng: 'en' }))
        .setDescriptionLocalizations(commandLocalizationHelper('stats_command.description'))
        .setContexts([0,1,2])
        .setIntegrationTypes([0,1])
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

    switch (subcommand) {
        case 'global':
            await handleGlobalStatsCommandInteraction(interaction);
            break;
        case 'personal':
            await handlePersonalStatsCommandInteraction(interaction);
            break;
        default:
            break;
    }
}