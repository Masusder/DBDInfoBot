import { SlashCommandBuilder } from '@discordjs/builders';
import {
    AutocompleteInteraction,
    ChatInputCommandInteraction
} from 'discord.js';
import {
    handlePerkCommandAutocompleteInteraction,
    handlePerkCommandInteraction
} from "./infoCommandComponents/perk";
import i18next from "i18next";

export const data = i18next.isInitialized
    ? new SlashCommandBuilder()
    .setName('info')
    .setNameLocalizations({
        'en-US': i18next.t('info_command.name', { lng: 'en' }),
        'en-GB': i18next.t('info_command.name', { lng: 'en' }),
        'de': i18next.t('info_command.name', { lng: 'de' }),
        'es-ES': i18next.t('info_command.name', { lng: 'es' }),
        'es-419': i18next.t('info_command.name', { lng: 'es-MX' }),
        'fr': i18next.t('info_command.name', { lng: 'fr' }),
        'it': i18next.t('info_command.name', { lng: 'it' }),
        'ja': i18next.t('info_command.name', { lng: 'ja' }),
        'ko': i18next.t('info_command.name', { lng: 'ko' }),
        'pl': i18next.t('info_command.name', { lng: 'pl' }),
        'pt-BR': i18next.t('info_command.name', { lng: 'pt-BR' }),
        'ru': i18next.t('info_command.name', { lng: 'ru' }),
        'th': i18next.t('info_command.name', { lng: 'th' }),
        'tr': i18next.t('info_command.name', { lng: 'tr' }),
        'zh-CN': i18next.t('info_command.name', { lng: 'zh-Hans' }),
        'zh-TW': i18next.t('info_command.name', { lng: 'zh-Hant' })
    })
    .setDescription(i18next.t('info_command.description', { lng: 'en' }))
    .setDescriptionLocalizations({
        'en-US': i18next.t('info_command.description', { lng: 'en' }),
        'en-GB': i18next.t('info_command.description', { lng: 'en' }),
        'de': i18next.t('info_command.description', { lng: 'de' }),
        'es-ES': i18next.t('info_command.description', { lng: 'es' }),
        'es-419': i18next.t('info_command.description', { lng: 'es-MX' }),
        'fr': i18next.t('info_command.description', { lng: 'fr' }),
        'it': i18next.t('info_command.description', { lng: 'it' }),
        'ja': i18next.t('info_command.description', { lng: 'ja' }),
        'ko': i18next.t('info_command.description', { lng: 'ko' }),
        'pl': i18next.t('info_command.description', { lng: 'pl' }),
        'pt-BR': i18next.t('info_command.description', { lng: 'pt-BR' }),
        'ru': i18next.t('info_command.description', { lng: 'ru' }),
        'th': i18next.t('info_command.description', { lng: 'th' }),
        'tr': i18next.t('info_command.description', { lng: 'tr' }),
        'zh-CN': i18next.t('info_command.description', { lng: 'zh-Hans' }),
        'zh-TW': i18next.t('info_command.description', { lng: 'zh-Hant' })
    })
    .addStringOption(option =>
        option.setName('type')
            .setNameLocalizations({
                'en-US': i18next.t('info_command.options.type.name', { lng: 'en' }),
                'en-GB': i18next.t('info_command.options.type.name', { lng: 'en' }),
                'de': i18next.t('info_command.options.type.name', { lng: 'de' }),
                'es-ES': i18next.t('info_command.options.type.name', { lng: 'es' }),
                'es-419': i18next.t('info_command.options.type.name', { lng: 'es-MX' }),
                'fr': i18next.t('info_command.options.type.name', { lng: 'fr' }),
                'it': i18next.t('info_command.options.type.name', { lng: 'it' }),
                'ja': i18next.t('info_command.options.type.name', { lng: 'ja' }),
                'ko': i18next.t('info_command.options.type.name', { lng: 'ko' }),
                'pl': i18next.t('info_command.options.type.name', { lng: 'pl' }),
                'pt-BR': i18next.t('info_command.options.type.name', { lng: 'pt-BR' }),
                'ru': i18next.t('info_command.options.type.name', { lng: 'ru' }),
                'th': i18next.t('info_command.options.type.name', { lng: 'th' }),
                'tr': i18next.t('info_command.options.type.name', { lng: 'tr' }),
                'zh-CN': i18next.t('info_command.options.type.name', { lng: 'zh-Hans' }),
                'zh-TW': i18next.t('info_command.options.type.name', { lng: 'zh-Hant' })
            })
            .setDescription(i18next.t('info_command.options.type.description', { lng: 'en' }))
            .setDescriptionLocalizations({
                'en-US': i18next.t('info_command.options.type.description', { lng: 'en' }),
                'en-GB': i18next.t('info_command.options.type.description', { lng: 'en' }),
                'de': i18next.t('info_command.options.type.description', { lng: 'de' }),
                'es-ES': i18next.t('info_command.options.type.description', { lng: 'es' }),
                'es-419': i18next.t('info_command.options.type.description', { lng: 'es-MX' }),
                'fr': i18next.t('info_command.options.type.description', { lng: 'fr' }),
                'it': i18next.t('info_command.options.type.description', { lng: 'it' }),
                'ja': i18next.t('info_command.options.type.description', { lng: 'ja' }),
                'ko': i18next.t('info_command.options.type.description', { lng: 'ko' }),
                'pl': i18next.t('info_command.options.type.description', { lng: 'pl' }),
                'pt-BR': i18next.t('info_command.options.type.description', { lng: 'pt-BR' }),
                'ru': i18next.t('info_command.options.type.description', { lng: 'ru' }),
                'th': i18next.t('info_command.options.type.description', { lng: 'th' }),
                'tr': i18next.t('info_command.options.type.description', { lng: 'tr' }),
                'zh-CN': i18next.t('info_command.options.type.description', { lng: 'zh-Hans' }),
                'zh-TW': i18next.t('info_command.options.type.description', { lng: 'zh-Hant' })
            })
            .setRequired(true)
            .addChoices(
                {
                    name: i18next.t('info_command.options.type.choices.perk', { lng: 'en' }),
                    name_localizations: {
                        'en-US': i18next.t('info_command.options.type.choices.perk', { lng: 'en' }),
                        'en-GB': i18next.t('info_command.options.type.choices.perk', { lng: 'en' }),
                        'de': i18next.t('info_command.options.type.choices.perk', { lng: 'de' }),
                        'es-ES': i18next.t('info_command.options.type.choices.perk', { lng: 'es' }),
                        'es-419': i18next.t('info_command.options.type.choices.perk', { lng: 'es-MX' }),
                        'fr': i18next.t('info_command.options.type.choices.perk', { lng: 'fr' }),
                        'it': i18next.t('info_command.options.type.choices.perk', { lng: 'it' }),
                        'ja': i18next.t('info_command.options.type.choices.perk', { lng: 'ja' }),
                        'ko': i18next.t('info_command.options.type.choices.perk', { lng: 'ko' }),
                        'pl': i18next.t('info_command.options.type.choices.perk', { lng: 'pl' }),
                        'pt-BR': i18next.t('info_command.options.type.choices.perk', { lng: 'pt-BR' }),
                        'ru': i18next.t('info_command.options.type.choices.perk', { lng: 'ru' }),
                        'th': i18next.t('info_command.options.type.choices.perk', { lng: 'th' }),
                        'tr': i18next.t('info_command.options.type.choices.perk', { lng: 'tr' }),
                        'zh-CN': i18next.t('info_command.options.type.choices.perk', { lng: 'zh-Hans' }),
                        'zh-TW': i18next.t('info_command.options.type.choices.perk', { lng: 'zh-Hant' })
                    },
                    value: 'perk'
                },
                {
                    name: i18next.t('info_command.options.type.choices.addon', { lng: 'en' }),
                    name_localizations: {
                        'en-US': i18next.t('info_command.options.type.choices.addon', { lng: 'en' }),
                        'en-GB': i18next.t('info_command.options.type.choices.addon', { lng: 'en' }),
                        'de': i18next.t('info_command.options.type.choices.addon', { lng: 'de' }),
                        'es-ES': i18next.t('info_command.options.type.choices.addon', { lng: 'es' }),
                        'es-419': i18next.t('info_command.options.type.choices.addon', { lng: 'es-MX' }),
                        'fr': i18next.t('info_command.options.type.choices.addon', { lng: 'fr' }),
                        'it': i18next.t('info_command.options.type.choices.addon', { lng: 'it' }),
                        'ja': i18next.t('info_command.options.type.choices.addon', { lng: 'ja' }),
                        'ko': i18next.t('info_command.options.type.choices.addon', { lng: 'ko' }),
                        'pl': i18next.t('info_command.options.type.choices.addon', { lng: 'pl' }),
                        'pt-BR': i18next.t('info_command.options.type.choices.addon', { lng: 'pt-BR' }),
                        'ru': i18next.t('info_command.options.type.choices.addon', { lng: 'ru' }),
                        'th': i18next.t('info_command.options.type.choices.addon', { lng: 'th' }),
                        'tr': i18next.t('info_command.options.type.choices.addon', { lng: 'tr' }),
                        'zh-CN': i18next.t('info_command.options.type.choices.addon', { lng: 'zh-Hans' }),
                        'zh-TW': i18next.t('info_command.options.type.choices.addon', { lng: 'zh-Hant' })
                    },
                    value: 'addon'
                }
            )
    )
    .addStringOption(option =>
        option.setName('name')
            .setNameLocalizations({
                'en-US': i18next.t('info_command.options.name.name', { lng: 'en' }),
                'en-GB': i18next.t('info_command.options.name.name', { lng: 'en' }),
                'de': i18next.t('info_command.options.name.name', { lng: 'de' }),
                'es-ES': i18next.t('info_command.options.name.name', { lng: 'es' }),
                'es-419': i18next.t('info_command.options.name.name', { lng: 'es-MX' }),
                'fr': i18next.t('info_command.options.name.name', { lng: 'fr' }),
                'it': i18next.t('info_command.options.name.name', { lng: 'it' }),
                'ja': i18next.t('info_command.options.name.name', { lng: 'ja' }),
                'ko': i18next.t('info_command.options.name.name', { lng: 'ko' }),
                'pl': i18next.t('info_command.options.name.name', { lng: 'pl' }),
                'pt-BR': i18next.t('info_command.options.name.name', { lng: 'pt-BR' }),
                'ru': i18next.t('info_command.options.name.name', { lng: 'ru' }),
                'th': i18next.t('info_command.options.name.name', { lng: 'th' }),
                'tr': i18next.t('info_command.options.name.name', { lng: 'tr' }),
                'zh-CN': i18next.t('info_command.options.name.name', { lng: 'zh-Hans' }),
                'zh-TW': i18next.t('info_command.options.name.name', { lng: 'zh-Hant' })
            })
            .setDescription(i18next.t('info_command.options.name.description', { lng: 'en' }))
            .setDescriptionLocalizations({
                'en-US': i18next.t('info_command.options.name.description', { lng: 'en' }),
                'en-GB': i18next.t('info_command.options.name.description', { lng: 'en' }),
                'de': i18next.t('info_command.options.name.description', { lng: 'de' }),
                'es-ES': i18next.t('info_command.options.name.description', { lng: 'es' }),
                'es-419': i18next.t('info_command.options.name.description', { lng: 'es-MX' }),
                'fr': i18next.t('info_command.options.name.description', { lng: 'fr' }),
                'it': i18next.t('info_command.options.name.description', { lng: 'it' }),
                'ja': i18next.t('info_command.options.name.description', { lng: 'ja' }),
                'ko': i18next.t('info_command.options.name.description', { lng: 'ko' }),
                'pl': i18next.t('info_command.options.name.description', { lng: 'pl' }),
                'pt-BR': i18next.t('info_command.options.name.description', { lng: 'pt-BR' }),
                'ru': i18next.t('info_command.options.name.description', { lng: 'ru' }),
                'th': i18next.t('info_command.options.name.description', { lng: 'th' }),
                'tr': i18next.t('info_command.options.name.description', { lng: 'tr' }),
                'zh-CN': i18next.t('info_command.options.name.description', { lng: 'zh-Hans' }),
                'zh-TW': i18next.t('info_command.options.name.description', { lng: 'zh-Hant' })
            })
            .setRequired(true)
            .setAutocomplete(true)
    ) : undefined;

export async function execute(interaction: ChatInputCommandInteraction) {
    const type = interaction.options.getString('type');

    switch (type) {
        case 'perk':
            await handlePerkCommandInteraction(interaction);
            break;
        default:
            await interaction.reply('Unknown command type.');
    }
}

// region Autocomplete
export async function autocomplete(interaction: AutocompleteInteraction) {
    const type = interaction.options.getString('type');

    switch (type) {
        case 'perk':
            await handlePerkCommandAutocompleteInteraction(interaction);
            break;
        default:
            break;
    }
}

// endregion