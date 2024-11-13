import i18next from "i18next";
import { SlashCommandBuilder } from "@discordjs/builders";
import {
    AutocompleteInteraction,
    ChatInputCommandInteraction
} from "discord.js";
import {
    handleCosmeticListCommandAutocompleteInteraction,
    handleCosmeticListCommandInteraction
} from "@commands/listSubCommands/cosmetics";

export const data = i18next.isInitialized
    ? new SlashCommandBuilder()
        .setName('list')
        .setNameLocalizations({
            'en-US': i18next.t('list_command.name', { lng: 'en' }),
            'en-GB': i18next.t('list_command.name', { lng: 'en' }),
            'de': i18next.t('list_command.name', { lng: 'de' }),
            'es-ES': i18next.t('list_command.name', { lng: 'es' }),
            'es-419': i18next.t('list_command.name', { lng: 'es-MX' }),
            'fr': i18next.t('list_command.name', { lng: 'fr' }),
            'it': i18next.t('list_command.name', { lng: 'it' }),
            'ja': i18next.t('list_command.name', { lng: 'ja' }),
            'ko': i18next.t('list_command.name', { lng: 'ko' }),
            'pl': i18next.t('list_command.name', { lng: 'pl' }),
            'pt-BR': i18next.t('list_command.name', { lng: 'pt-BR' }),
            'ru': i18next.t('list_command.name', { lng: 'ru' }),
            'th': i18next.t('list_command.name', { lng: 'th' }),
            'tr': i18next.t('list_command.name', { lng: 'tr' }),
            'zh-CN': i18next.t('list_command.name', { lng: 'zh-Hans' }),
            'zh-TW': i18next.t('list_command.name', { lng: 'zh-Hant' })
        })
        .setDescription(i18next.t('list_command.description', { lng: 'en' }))
        .setDescriptionLocalizations({
            'en-US': i18next.t('list_command.description', { lng: 'en' }),
            'en-GB': i18next.t('list_command.description', { lng: 'en' }),
            'de': i18next.t('list_command.description', { lng: 'de' }),
            'es-ES': i18next.t('list_command.description', { lng: 'es' }),
            'es-419': i18next.t('list_command.description', { lng: 'es-MX' }),
            'fr': i18next.t('list_command.description', { lng: 'fr' }),
            'it': i18next.t('list_command.description', { lng: 'it' }),
            'ja': i18next.t('list_command.description', { lng: 'ja' }),
            'ko': i18next.t('list_command.description', { lng: 'ko' }),
            'pl': i18next.t('list_command.description', { lng: 'pl' }),
            'pt-BR': i18next.t('list_command.description', { lng: 'pt-BR' }),
            'ru': i18next.t('list_command.description', { lng: 'ru' }),
            'th': i18next.t('list_command.description', { lng: 'th' }),
            'tr': i18next.t('list_command.description', { lng: 'tr' }),
            'zh-CN': i18next.t('list_command.description', { lng: 'zh-Hans' }),
            'zh-TW': i18next.t('list_command.description', { lng: 'zh-Hant' })
        })
        // The reason why I'm going to use subcommand and not string option
        // is to have support for individual choices for each subcommand
        .addSubcommand(subcommand =>
            subcommand
                .setName('cosmetics')
                .setNameLocalizations({
                    'en-US': i18next.t('list_command.cosmetics_subcommand.name', { lng: 'en' }),
                    'en-GB': i18next.t('list_command.cosmetics_subcommand.name', { lng: 'en' }),
                    'de': i18next.t('list_command.cosmetics_subcommand.name', { lng: 'de' }),
                    'es-ES': i18next.t('list_command.cosmetics_subcommand.name', { lng: 'es' }),
                    'es-419': i18next.t('list_command.cosmetics_subcommand.name', { lng: 'es-MX' }),
                    'fr': i18next.t('list_command.cosmetics_subcommand.name', { lng: 'fr' }),
                    'it': i18next.t('list_command.cosmetics_subcommand.name', { lng: 'it' }),
                    'ja': i18next.t('list_command.cosmetics_subcommand.name', { lng: 'ja' }),
                    'ko': i18next.t('list_command.cosmetics_subcommand.name', { lng: 'ko' }),
                    'pl': i18next.t('list_command.cosmetics_subcommand.name', { lng: 'pl' }),
                    'pt-BR': i18next.t('list_command.cosmetics_subcommand.name', { lng: 'pt-BR' }),
                    'ru': i18next.t('list_command.cosmetics_subcommand.name', { lng: 'ru' }),
                    'th': i18next.t('list_command.cosmetics_subcommand.name', { lng: 'th' }),
                    'tr': i18next.t('list_command.cosmetics_subcommand.name', { lng: 'tr' }),
                    'zh-CN': i18next.t('list_command.cosmetics_subcommand.name', { lng: 'zh-Hans' }),
                    'zh-TW': i18next.t('list_command.cosmetics_subcommand.name', { lng: 'zh-Hant' })
                })
                .setDescription(i18next.t('list_command.cosmetics_subcommand.description', { lng: 'en' }))
                .setDescriptionLocalizations({
                    'en-US': i18next.t('list_command.cosmetics_subcommand.description', { lng: 'en' }),
                    'en-GB': i18next.t('list_command.cosmetics_subcommand.description', { lng: 'en' }),
                    'de': i18next.t('list_command.cosmetics_subcommand.description', { lng: 'de' }),
                    'es-ES': i18next.t('list_command.cosmetics_subcommand.description', { lng: 'es' }),
                    'es-419': i18next.t('list_command.cosmetics_subcommand.description', { lng: 'es-MX' }),
                    'fr': i18next.t('list_command.cosmetics_subcommand.description', { lng: 'fr' }),
                    'it': i18next.t('list_command.cosmetics_subcommand.description', { lng: 'it' }),
                    'ja': i18next.t('list_command.cosmetics_subcommand.description', { lng: 'ja' }),
                    'ko': i18next.t('list_command.cosmetics_subcommand.description', { lng: 'ko' }),
                    'pl': i18next.t('list_command.cosmetics_subcommand.description', { lng: 'pl' }),
                    'pt-BR': i18next.t('list_command.cosmetics_subcommand.description', { lng: 'pt-BR' }),
                    'ru': i18next.t('list_command.cosmetics_subcommand.description', { lng: 'ru' }),
                    'th': i18next.t('list_command.cosmetics_subcommand.description', { lng: 'th' }),
                    'tr': i18next.t('list_command.cosmetics_subcommand.description', { lng: 'tr' }),
                    'zh-CN': i18next.t('list_command.cosmetics_subcommand.description', { lng: 'zh-Hans' }),
                    'zh-TW': i18next.t('list_command.cosmetics_subcommand.description', { lng: 'zh-Hant' })
                })
                .addStringOption(option =>
                    option
                        .setName('character')
                        .setNameLocalizations({
                            'en-US': i18next.t('list_command.cosmetics_subcommand.options.character.name', { lng: 'en' }),
                            'en-GB': i18next.t('list_command.cosmetics_subcommand.options.character.name', { lng: 'en' }),
                            'de': i18next.t('list_command.cosmetics_subcommand.options.character.name', { lng: 'de' }),
                            'es-ES': i18next.t('list_command.cosmetics_subcommand.options.character.name', { lng: 'es' }),
                            'es-419': i18next.t('list_command.cosmetics_subcommand.options.character.name', { lng: 'es-MX' }),
                            'fr': i18next.t('list_command.cosmetics_subcommand.options.character.name', { lng: 'fr' }),
                            'it': i18next.t('list_command.cosmetics_subcommand.options.character.name', { lng: 'it' }),
                            'ja': i18next.t('list_command.cosmetics_subcommand.options.character.name', { lng: 'ja' }),
                            'ko': i18next.t('list_command.cosmetics_subcommand.options.character.name', { lng: 'ko' }),
                            'pl': i18next.t('list_command.cosmetics_subcommand.options.character.name', { lng: 'pl' }),
                            'pt-BR': i18next.t('list_command.cosmetics_subcommand.options.character.name', { lng: 'pt-BR' }),
                            'ru': i18next.t('list_command.cosmetics_subcommand.options.character.name', { lng: 'ru' }),
                            'th': i18next.t('list_command.cosmetics_subcommand.options.character.name', { lng: 'th' }),
                            'tr': i18next.t('list_command.cosmetics_subcommand.options.character.name', { lng: 'tr' }),
                            'zh-CN': i18next.t('list_command.cosmetics_subcommand.options.character.name', { lng: 'zh-Hans' }),
                            'zh-TW': i18next.t('list_command.cosmetics_subcommand.options.character.name', { lng: 'zh-Hant' })
                        })
                        .setDescription('Name of the character.')
                        .setDescriptionLocalizations({
                            'en-US': i18next.t('list_command.cosmetics_subcommand.options.character.description', { lng: 'en' }),
                            'en-GB': i18next.t('list_command.cosmetics_subcommand.options.character.description', { lng: 'en' }),
                            'de': i18next.t('list_command.cosmetics_subcommand.options.character.description', { lng: 'de' }),
                            'es-ES': i18next.t('list_command.cosmetics_subcommand.options.character.description', { lng: 'es' }),
                            'es-419': i18next.t('list_command.cosmetics_subcommand.options.character.description', { lng: 'es-MX' }),
                            'fr': i18next.t('list_command.cosmetics_subcommand.options.character.description', { lng: 'fr' }),
                            'it': i18next.t('list_command.cosmetics_subcommand.options.character.description', { lng: 'it' }),
                            'ja': i18next.t('list_command.cosmetics_subcommand.options.character.description', { lng: 'ja' }),
                            'ko': i18next.t('list_command.cosmetics_subcommand.options.character.description', { lng: 'ko' }),
                            'pl': i18next.t('list_command.cosmetics_subcommand.options.character.description', { lng: 'pl' }),
                            'pt-BR': i18next.t('list_command.cosmetics_subcommand.options.character.description', { lng: 'pt-BR' }),
                            'ru': i18next.t('list_command.cosmetics_subcommand.options.character.description', { lng: 'ru' }),
                            'th': i18next.t('list_command.cosmetics_subcommand.options.character.description', { lng: 'th' }),
                            'tr': i18next.t('list_command.cosmetics_subcommand.options.character.description', { lng: 'tr' }),
                            'zh-CN': i18next.t('list_command.cosmetics_subcommand.options.character.description', { lng: 'zh-Hans' }),
                            'zh-TW': i18next.t('list_command.cosmetics_subcommand.options.character.description', { lng: 'zh-Hant' })
                        })
                        .setAutocomplete(true)
                        .setRequired(true)
                )
        ) : undefined;

export async function execute(interaction: ChatInputCommandInteraction) {
    const subcommand = interaction.options.getSubcommand();

    switch (subcommand) {
        case 'cosmetics':
            await handleCosmeticListCommandInteraction(interaction);
            break;
        default:
            await interaction.reply('Unknown subcommand.');
    }
}

export async function autocomplete(interaction: AutocompleteInteraction) {
    const subcommand = interaction.options.getSubcommand();

    switch (subcommand) {
        case 'cosmetics':
            await handleCosmeticListCommandAutocompleteInteraction(interaction);
            break;
        default:
            break;
    }
}