import i18next from "i18next";
import { SlashCommandBuilder } from "@discordjs/builders";
import {
    AutocompleteInteraction,
    ChatInputCommandInteraction,
    Locale
} from "discord.js";
import {
    handleCosmeticListCommandAutocompleteInteraction,
    handleCosmeticListCommandInteraction
} from "@commands/listSubCommands/cosmetics";
import { Rarities } from "@data/Rarities";
import {
    getTranslation,
    mapDiscordLocaleToDbdLang
} from "@utils/localizationUtils";
import { CosmeticTypes } from "@data/CosmeticTypes";
import { BuildCategories } from "@data/BuildCategories";
import {
    handleBuildsListCommandAutocompleteInteraction,
    handleBuildsListCommandInteraction
} from "@commands/listSubCommands/builds";

const rarityChoices = Object.keys(Rarities)
    .filter(rarity => rarity !== "N/A")
    .map(rarity => {
        const localizedName = Rarities[rarity].localizedName;

        const name_localizations: Record<string, string> = {};
        Object.values(Locale).forEach(locale => {
            name_localizations[locale] = i18next.t(localizedName, {
                lng: mapDiscordLocaleToDbdLang(locale),
                ns: 'general'
            });
        });

        return {
            name: i18next.t(localizedName, { lng: 'en', ns: 'general' }),
            name_localizations,
            value: rarity
        };
    });

const typeChoices = Object.keys(CosmeticTypes)
    .map(type => {
        const localizedName = CosmeticTypes[type];

        const name_localizations: Record<string, string> = {};
        Object.values(Locale).forEach(locale => {
            name_localizations[locale] = i18next.t(localizedName, {
                lng: mapDiscordLocaleToDbdLang(locale),
                ns: 'general'
            });
        });

        return {
            name: i18next.t(localizedName, { lng: 'en', ns: 'general' }),
            name_localizations,
            value: type
        };
    });

const buildCategories = Object.entries(BuildCategories).map(([value, name]) => {
    const name_localizations: Record<string, string> = {};
    Object.values(Locale).forEach(locale => {
        name_localizations[locale] = i18next.t(name, {
            lng: mapDiscordLocaleToDbdLang(locale),
            ns: 'general'
        });
    });

    return {
        name: i18next.t(name, { lng: 'en', ns: 'general' }),
        name_localizations,
        value
    };
});

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
                .setName('builds')
                .setNameLocalizations({
                    'en-US': i18next.t('list_command.builds_subcommand.name', { lng: 'en' }),
                    'en-GB': i18next.t('list_command.builds_subcommand.name', { lng: 'en' }),
                    'de': i18next.t('list_command.builds_subcommand.name', { lng: 'de' }),
                    'es-ES': i18next.t('list_command.builds_subcommand.name', { lng: 'es' }),
                    'es-419': i18next.t('list_command.builds_subcommand.name', { lng: 'es-MX' }),
                    'fr': i18next.t('list_command.builds_subcommand.name', { lng: 'fr' }),
                    'it': i18next.t('list_command.builds_subcommand.name', { lng: 'it' }),
                    'ja': i18next.t('list_command.builds_subcommand.name', { lng: 'ja' }),
                    'ko': i18next.t('list_command.builds_subcommand.name', { lng: 'ko' }),
                    'pl': i18next.t('list_command.builds_subcommand.name', { lng: 'pl' }),
                    'pt-BR': i18next.t('list_command.builds_subcommand.name', { lng: 'pt-BR' }),
                    'ru': i18next.t('list_command.builds_subcommand.name', { lng: 'ru' }),
                    'th': i18next.t('list_command.builds_subcommand.name', { lng: 'th' }),
                    'tr': i18next.t('list_command.builds_subcommand.name', { lng: 'tr' }),
                    'zh-CN': i18next.t('list_command.builds_subcommand.name', { lng: 'zh-Hans' }),
                    'zh-TW': i18next.t('list_command.builds_subcommand.name', { lng: 'zh-Hant' })
                })
                .setDescription(i18next.t('list_command.builds_subcommand.description', { lng: 'en' }))
                .setDescriptionLocalizations({
                    'en-US': i18next.t('list_command.builds_subcommand.description', { lng: 'en' }),
                    'en-GB': i18next.t('list_command.builds_subcommand.description', { lng: 'en' }),
                    'de': i18next.t('list_command.builds_subcommand.description', { lng: 'de' }),
                    'es-ES': i18next.t('list_command.builds_subcommand.description', { lng: 'es' }),
                    'es-419': i18next.t('list_command.builds_subcommand.description', { lng: 'es-MX' }),
                    'fr': i18next.t('list_command.builds_subcommand.description', { lng: 'fr' }),
                    'it': i18next.t('list_command.builds_subcommand.description', { lng: 'it' }),
                    'ja': i18next.t('list_command.builds_subcommand.description', { lng: 'ja' }),
                    'ko': i18next.t('list_command.builds_subcommand.description', { lng: 'ko' }),
                    'pl': i18next.t('list_command.builds_subcommand.description', { lng: 'pl' }),
                    'pt-BR': i18next.t('list_command.builds_subcommand.description', { lng: 'pt-BR' }),
                    'ru': i18next.t('list_command.builds_subcommand.description', { lng: 'ru' }),
                    'th': i18next.t('list_command.builds_subcommand.description', { lng: 'th' }),
                    'tr': i18next.t('list_command.builds_subcommand.description', { lng: 'tr' }),
                    'zh-CN': i18next.t('list_command.builds_subcommand.description', { lng: 'zh-Hans' }),
                    'zh-TW': i18next.t('list_command.builds_subcommand.description', { lng: 'zh-Hant' })
                })
                .addStringOption(option =>
                    option
                        .setName('role')
                        .setDescription('Role for the build')
                        .setRequired(true)
                        .addChoices(
                            { name: 'Killer', value: 'Killer' },
                            { name: 'Survivor', value: 'Survivor' }
                        )
                )
                .addNumberOption(option =>
                    option
                        .setName('page')
                        .setDescription('Page number (default is 1)')
                        .setRequired(false)
                        .setMinValue(1)
                        .setMaxValue(9999)
                )
                .addStringOption(option =>
                    option
                        .setName('title')
                        .setDescription('Title of the build')
                        .setRequired(false)
                )
                .addStringOption(option =>
                    option
                        .setName('category')
                        .setDescription('Category of the build')
                        .setRequired(false)
                        .addChoices(...buildCategories)
                )
                .addStringOption(option =>
                    option
                        .setName('character')
                        .setDescription('Character for the build')
                        .setRequired(false)
                        .setAutocomplete(true)
                )
                .addStringOption(option =>
                    option
                        .setName('version')
                        .setDescription('Game version for the build')
                        .setRequired(false)
                        .setAutocomplete(true)
                )
                .addNumberOption(option =>
                    option
                        .setName('rating')
                        .setDescription('Minimum rating for the build')
                        .setRequired(false)
                        .addChoices(
                            { name: "One Star", value: 1 },
                            { name: "Two Stars", value: 2 },
                            { name: "Three Stars", value: 3 },
                            { name: "Four Stars", value: 4 },
                            { name: "Five Stars", value: 5 }
                        )
                )
        )
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
                        .setDescription(i18next.t('list_command.cosmetics_subcommand.options.character.description', { lng: 'en' }))
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
                        .setRequired(false)
                )
                .addStringOption(option =>
                    option
                        .setName('rarity')
                        .setNameLocalizations({
                            'en-US': i18next.t('list_command.cosmetics_subcommand.options.rarity.name', { lng: 'en' }),
                            'en-GB': i18next.t('list_command.cosmetics_subcommand.options.rarity.name', { lng: 'en' }),
                            'de': i18next.t('list_command.cosmetics_subcommand.options.rarity.name', { lng: 'de' }),
                            'es-ES': i18next.t('list_command.cosmetics_subcommand.options.rarity.name', { lng: 'es' }),
                            'es-419': i18next.t('list_command.cosmetics_subcommand.options.rarity.name', { lng: 'es-MX' }),
                            'fr': i18next.t('list_command.cosmetics_subcommand.options.rarity.name', { lng: 'fr' }),
                            'it': i18next.t('list_command.cosmetics_subcommand.options.rarity.name', { lng: 'it' }),
                            'ja': i18next.t('list_command.cosmetics_subcommand.options.rarity.name', { lng: 'ja' }),
                            'ko': i18next.t('list_command.cosmetics_subcommand.options.rarity.name', { lng: 'ko' }),
                            'pl': i18next.t('list_command.cosmetics_subcommand.options.rarity.name', { lng: 'pl' }),
                            'pt-BR': i18next.t('list_command.cosmetics_subcommand.options.rarity.name', { lng: 'pt-BR' }),
                            'ru': i18next.t('list_command.cosmetics_subcommand.options.rarity.name', { lng: 'ru' }),
                            'th': i18next.t('list_command.cosmetics_subcommand.options.rarity.name', { lng: 'th' }),
                            'tr': i18next.t('list_command.cosmetics_subcommand.options.rarity.name', { lng: 'tr' }),
                            'zh-CN': i18next.t('list_command.cosmetics_subcommand.options.rarity.name', { lng: 'zh-Hans' }),
                            'zh-TW': i18next.t('list_command.cosmetics_subcommand.options.rarity.name', { lng: 'zh-Hant' })
                        })
                        .setDescription(i18next.t('list_command.cosmetics_subcommand.options.rarity.description', { lng: 'en' }))
                        .setDescriptionLocalizations({
                            'en-US': i18next.t('list_command.cosmetics_subcommand.options.rarity.description', { lng: 'en' }),
                            'en-GB': i18next.t('list_command.cosmetics_subcommand.options.rarity.description', { lng: 'en' }),
                            'de': i18next.t('list_command.cosmetics_subcommand.options.rarity.description', { lng: 'de' }),
                            'es-ES': i18next.t('list_command.cosmetics_subcommand.options.rarity.description', { lng: 'es' }),
                            'es-419': i18next.t('list_command.cosmetics_subcommand.options.rarity.description', { lng: 'es-MX' }),
                            'fr': i18next.t('list_command.cosmetics_subcommand.options.rarity.description', { lng: 'fr' }),
                            'it': i18next.t('list_command.cosmetics_subcommand.options.rarity.description', { lng: 'it' }),
                            'ja': i18next.t('list_command.cosmetics_subcommand.options.rarity.description', { lng: 'ja' }),
                            'ko': i18next.t('list_command.cosmetics_subcommand.options.rarity.description', { lng: 'ko' }),
                            'pl': i18next.t('list_command.cosmetics_subcommand.options.rarity.description', { lng: 'pl' }),
                            'pt-BR': i18next.t('list_command.cosmetics_subcommand.options.rarity.description', { lng: 'pt-BR' }),
                            'ru': i18next.t('list_command.cosmetics_subcommand.options.rarity.description', { lng: 'ru' }),
                            'th': i18next.t('list_command.cosmetics_subcommand.options.rarity.description', { lng: 'th' }),
                            'tr': i18next.t('list_command.cosmetics_subcommand.options.rarity.description', { lng: 'tr' }),
                            'zh-CN': i18next.t('list_command.cosmetics_subcommand.options.rarity.description', { lng: 'zh-Hans' }),
                            'zh-TW': i18next.t('list_command.cosmetics_subcommand.options.rarity.description', { lng: 'zh-Hant' })
                        })
                        .setChoices(...rarityChoices)
                        .setRequired(false)
                )
                .addStringOption(option =>
                    option
                        .setName('type')
                        .setNameLocalizations({
                            'en-US': i18next.t('list_command.cosmetics_subcommand.options.type.name', { lng: 'en' }),
                            'en-GB': i18next.t('list_command.cosmetics_subcommand.options.type.name', { lng: 'en' }),
                            'de': i18next.t('list_command.cosmetics_subcommand.options.type.name', { lng: 'de' }),
                            'es-ES': i18next.t('list_command.cosmetics_subcommand.options.type.name', { lng: 'es' }),
                            'es-419': i18next.t('list_command.cosmetics_subcommand.options.type.name', { lng: 'es-MX' }),
                            'fr': i18next.t('list_command.cosmetics_subcommand.options.type.name', { lng: 'fr' }),
                            'it': i18next.t('list_command.cosmetics_subcommand.options.type.name', { lng: 'it' }),
                            'ja': i18next.t('list_command.cosmetics_subcommand.options.type.name', { lng: 'ja' }),
                            'ko': i18next.t('list_command.cosmetics_subcommand.options.type.name', { lng: 'ko' }),
                            'pl': i18next.t('list_command.cosmetics_subcommand.options.type.name', { lng: 'pl' }),
                            'pt-BR': i18next.t('list_command.cosmetics_subcommand.options.type.name', { lng: 'pt-BR' }),
                            'ru': i18next.t('list_command.cosmetics_subcommand.options.type.name', { lng: 'ru' }),
                            'th': i18next.t('list_command.cosmetics_subcommand.options.type.name', { lng: 'th' }),
                            'tr': i18next.t('list_command.cosmetics_subcommand.options.type.name', { lng: 'tr' }),
                            'zh-CN': i18next.t('list_command.cosmetics_subcommand.options.type.name', { lng: 'zh-Hans' }),
                            'zh-TW': i18next.t('list_command.cosmetics_subcommand.options.type.name', { lng: 'zh-Hant' })
                        })
                        .setDescription(i18next.t('list_command.cosmetics_subcommand.options.type.description', { lng: 'en' }))
                        .setDescriptionLocalizations({
                            'en-US': i18next.t('list_command.cosmetics_subcommand.options.type.description', { lng: 'en' }),
                            'en-GB': i18next.t('list_command.cosmetics_subcommand.options.type.description', { lng: 'en' }),
                            'de': i18next.t('list_command.cosmetics_subcommand.options.type.description', { lng: 'de' }),
                            'es-ES': i18next.t('list_command.cosmetics_subcommand.options.type.description', { lng: 'es' }),
                            'es-419': i18next.t('list_command.cosmetics_subcommand.options.type.description', { lng: 'es-MX' }),
                            'fr': i18next.t('list_command.cosmetics_subcommand.options.type.description', { lng: 'fr' }),
                            'it': i18next.t('list_command.cosmetics_subcommand.options.type.description', { lng: 'it' }),
                            'ja': i18next.t('list_command.cosmetics_subcommand.options.type.description', { lng: 'ja' }),
                            'ko': i18next.t('list_command.cosmetics_subcommand.options.type.description', { lng: 'ko' }),
                            'pl': i18next.t('list_command.cosmetics_subcommand.options.type.description', { lng: 'pl' }),
                            'pt-BR': i18next.t('list_command.cosmetics_subcommand.options.type.description', { lng: 'pt-BR' }),
                            'ru': i18next.t('list_command.cosmetics_subcommand.options.type.description', { lng: 'ru' }),
                            'th': i18next.t('list_command.cosmetics_subcommand.options.type.description', { lng: 'th' }),
                            'tr': i18next.t('list_command.cosmetics_subcommand.options.type.description', { lng: 'tr' }),
                            'zh-CN': i18next.t('list_command.cosmetics_subcommand.options.type.description', { lng: 'zh-Hans' }),
                            'zh-TW': i18next.t('list_command.cosmetics_subcommand.options.type.description', { lng: 'zh-Hant' })
                        })
                        .setChoices(...typeChoices)
                        .setRequired(false)
                )
                .addStringOption(option =>
                    option
                        .setName('inclusion_version')
                        .setNameLocalizations({
                            'en-US': i18next.t('list_command.cosmetics_subcommand.options.inclusion_version.name', { lng: 'en' }),
                            'en-GB': i18next.t('list_command.cosmetics_subcommand.options.inclusion_version.name', { lng: 'en' }),
                            'de': i18next.t('list_command.cosmetics_subcommand.options.inclusion_version.name', { lng: 'de' }),
                            'es-ES': i18next.t('list_command.cosmetics_subcommand.options.inclusion_version.name', { lng: 'es' }),
                            'es-419': i18next.t('list_command.cosmetics_subcommand.options.inclusion_version.name', { lng: 'es-MX' }),
                            'fr': i18next.t('list_command.cosmetics_subcommand.options.inclusion_version.name', { lng: 'fr' }),
                            'it': i18next.t('list_command.cosmetics_subcommand.options.inclusion_version.name', { lng: 'it' }),
                            'ja': i18next.t('list_command.cosmetics_subcommand.options.inclusion_version.name', { lng: 'ja' }),
                            'ko': i18next.t('list_command.cosmetics_subcommand.options.inclusion_version.name', { lng: 'ko' }),
                            'pl': i18next.t('list_command.cosmetics_subcommand.options.inclusion_version.name', { lng: 'pl' }),
                            'pt-BR': i18next.t('list_command.cosmetics_subcommand.options.inclusion_version.name', { lng: 'pt-BR' }),
                            'ru': i18next.t('list_command.cosmetics_subcommand.options.inclusion_version.name', { lng: 'ru' }),
                            'th': i18next.t('list_command.cosmetics_subcommand.options.inclusion_version.name', { lng: 'th' }),
                            'tr': i18next.t('list_command.cosmetics_subcommand.options.inclusion_version.name', { lng: 'tr' }),
                            'zh-CN': i18next.t('list_command.cosmetics_subcommand.options.inclusion_version.name', { lng: 'zh-Hans' }),
                            'zh-TW': i18next.t('list_command.cosmetics_subcommand.options.inclusion_version.name', { lng: 'zh-Hant' })
                        })
                        .setDescription(i18next.t('list_command.cosmetics_subcommand.options.inclusion_version.description', { lng: 'en' }))
                        .setDescriptionLocalizations({
                            'en-US': i18next.t('list_command.cosmetics_subcommand.options.inclusion_version.description', { lng: 'en' }),
                            'en-GB': i18next.t('list_command.cosmetics_subcommand.options.inclusion_version.description', { lng: 'en' }),
                            'de': i18next.t('list_command.cosmetics_subcommand.options.inclusion_version.description', { lng: 'de' }),
                            'es-ES': i18next.t('list_command.cosmetics_subcommand.options.inclusion_version.description', { lng: 'es' }),
                            'es-419': i18next.t('list_command.cosmetics_subcommand.options.inclusion_version.description', { lng: 'es-MX' }),
                            'fr': i18next.t('list_command.cosmetics_subcommand.options.inclusion_version.description', { lng: 'fr' }),
                            'it': i18next.t('list_command.cosmetics_subcommand.options.inclusion_version.description', { lng: 'it' }),
                            'ja': i18next.t('list_command.cosmetics_subcommand.options.inclusion_version.description', { lng: 'ja' }),
                            'ko': i18next.t('list_command.cosmetics_subcommand.options.inclusion_version.description', { lng: 'ko' }),
                            'pl': i18next.t('list_command.cosmetics_subcommand.options.inclusion_version.description', { lng: 'pl' }),
                            'pt-BR': i18next.t('list_command.cosmetics_subcommand.options.inclusion_version.description', { lng: 'pt-BR' }),
                            'ru': i18next.t('list_command.cosmetics_subcommand.options.inclusion_version.description', { lng: 'ru' }),
                            'th': i18next.t('list_command.cosmetics_subcommand.options.inclusion_version.description', { lng: 'th' }),
                            'tr': i18next.t('list_command.cosmetics_subcommand.options.inclusion_version.description', { lng: 'tr' }),
                            'zh-CN': i18next.t('list_command.cosmetics_subcommand.options.inclusion_version.description', { lng: 'zh-Hans' }),
                            'zh-TW': i18next.t('list_command.cosmetics_subcommand.options.inclusion_version.description', { lng: 'zh-Hant' })
                        })
                        .setAutocomplete(true)
                        .setRequired(false)
                )
                .addBooleanOption(option =>
                    option
                        .setName('purchasable')
                        .setNameLocalizations({
                            'en-US': i18next.t('list_command.cosmetics_subcommand.options.purchasable.name', { lng: 'en' }),
                            'en-GB': i18next.t('list_command.cosmetics_subcommand.options.purchasable.name', { lng: 'en' }),
                            'de': i18next.t('list_command.cosmetics_subcommand.options.purchasable.name', { lng: 'de' }),
                            'es-ES': i18next.t('list_command.cosmetics_subcommand.options.purchasable.name', { lng: 'es' }),
                            'es-419': i18next.t('list_command.cosmetics_subcommand.options.purchasable.name', { lng: 'es-MX' }),
                            'fr': i18next.t('list_command.cosmetics_subcommand.options.purchasable.name', { lng: 'fr' }),
                            'it': i18next.t('list_command.cosmetics_subcommand.options.purchasable.name', { lng: 'it' }),
                            'ja': i18next.t('list_command.cosmetics_subcommand.options.purchasable.name', { lng: 'ja' }),
                            'ko': i18next.t('list_command.cosmetics_subcommand.options.purchasable.name', { lng: 'ko' }),
                            'pl': i18next.t('list_command.cosmetics_subcommand.options.purchasable.name', { lng: 'pl' }),
                            'pt-BR': i18next.t('list_command.cosmetics_subcommand.options.purchasable.name', { lng: 'pt-BR' }),
                            'ru': i18next.t('list_command.cosmetics_subcommand.options.purchasable.name', { lng: 'ru' }),
                            'th': i18next.t('list_command.cosmetics_subcommand.options.purchasable.name', { lng: 'th' }),
                            'tr': i18next.t('list_command.cosmetics_subcommand.options.purchasable.name', { lng: 'tr' }),
                            'zh-CN': i18next.t('list_command.cosmetics_subcommand.options.purchasable.name', { lng: 'zh-Hans' }),
                            'zh-TW': i18next.t('list_command.cosmetics_subcommand.options.purchasable.name', { lng: 'zh-Hant' })
                        })
                        .setDescription(i18next.t('list_command.cosmetics_subcommand.options.purchasable.description', { lng: 'en' }))
                        .setDescriptionLocalizations({
                            'en-US': i18next.t('list_command.cosmetics_subcommand.options.purchasable.description', { lng: 'en' }),
                            'en-GB': i18next.t('list_command.cosmetics_subcommand.options.purchasable.description', { lng: 'en' }),
                            'de': i18next.t('list_command.cosmetics_subcommand.options.purchasable.description', { lng: 'de' }),
                            'es-ES': i18next.t('list_command.cosmetics_subcommand.options.purchasable.description', { lng: 'es' }),
                            'es-419': i18next.t('list_command.cosmetics_subcommand.options.purchasable.description', { lng: 'es-MX' }),
                            'fr': i18next.t('list_command.cosmetics_subcommand.options.purchasable.description', { lng: 'fr' }),
                            'it': i18next.t('list_command.cosmetics_subcommand.options.purchasable.description', { lng: 'it' }),
                            'ja': i18next.t('list_command.cosmetics_subcommand.options.purchasable.description', { lng: 'ja' }),
                            'ko': i18next.t('list_command.cosmetics_subcommand.options.purchasable.description', { lng: 'ko' }),
                            'pl': i18next.t('list_command.cosmetics_subcommand.options.purchasable.description', { lng: 'pl' }),
                            'pt-BR': i18next.t('list_command.cosmetics_subcommand.options.purchasable.description', { lng: 'pt-BR' }),
                            'ru': i18next.t('list_command.cosmetics_subcommand.options.purchasable.description', { lng: 'ru' }),
                            'th': i18next.t('list_command.cosmetics_subcommand.options.purchasable.description', { lng: 'th' }),
                            'tr': i18next.t('list_command.cosmetics_subcommand.options.purchasable.description', { lng: 'tr' }),
                            'zh-CN': i18next.t('list_command.cosmetics_subcommand.options.purchasable.description', { lng: 'zh-Hans' }),
                            'zh-TW': i18next.t('list_command.cosmetics_subcommand.options.purchasable.description', { lng: 'zh-Hant' })
                        })
                        .setRequired(false)
                )
                .addBooleanOption(option =>
                    option
                        .setName('linked')
                        .setNameLocalizations({
                            'en-US': i18next.t('list_command.cosmetics_subcommand.options.linked.name', { lng: 'en' }),
                            'en-GB': i18next.t('list_command.cosmetics_subcommand.options.linked.name', { lng: 'en' }),
                            'de': i18next.t('list_command.cosmetics_subcommand.options.linked.name', { lng: 'de' }),
                            'es-ES': i18next.t('list_command.cosmetics_subcommand.options.linked.name', { lng: 'es' }),
                            'es-419': i18next.t('list_command.cosmetics_subcommand.options.linked.name', { lng: 'es-MX' }),
                            'fr': i18next.t('list_command.cosmetics_subcommand.options.linked.name', { lng: 'fr' }),
                            'it': i18next.t('list_command.cosmetics_subcommand.options.linked.name', { lng: 'it' }),
                            'ja': i18next.t('list_command.cosmetics_subcommand.options.linked.name', { lng: 'ja' }),
                            'ko': i18next.t('list_command.cosmetics_subcommand.options.linked.name', { lng: 'ko' }),
                            'pl': i18next.t('list_command.cosmetics_subcommand.options.linked.name', { lng: 'pl' }),
                            'pt-BR': i18next.t('list_command.cosmetics_subcommand.options.linked.name', { lng: 'pt-BR' }),
                            'ru': i18next.t('list_command.cosmetics_subcommand.options.linked.name', { lng: 'ru' }),
                            'th': i18next.t('list_command.cosmetics_subcommand.options.linked.name', { lng: 'th' }),
                            'tr': i18next.t('list_command.cosmetics_subcommand.options.linked.name', { lng: 'tr' }),
                            'zh-CN': i18next.t('list_command.cosmetics_subcommand.options.linked.name', { lng: 'zh-Hans' }),
                            'zh-TW': i18next.t('list_command.cosmetics_subcommand.options.linked.name', { lng: 'zh-Hant' })
                        })
                        .setDescription(i18next.t('list_command.cosmetics_subcommand.options.linked.description', { lng: 'en' }))
                        .setDescriptionLocalizations({
                            'en-US': i18next.t('list_command.cosmetics_subcommand.options.linked.description', { lng: 'en' }),
                            'en-GB': i18next.t('list_command.cosmetics_subcommand.options.linked.description', { lng: 'en' }),
                            'de': i18next.t('list_command.cosmetics_subcommand.options.linked.description', { lng: 'de' }),
                            'es-ES': i18next.t('list_command.cosmetics_subcommand.options.linked.description', { lng: 'es' }),
                            'es-419': i18next.t('list_command.cosmetics_subcommand.options.linked.description', { lng: 'es-MX' }),
                            'fr': i18next.t('list_command.cosmetics_subcommand.options.linked.description', { lng: 'fr' }),
                            'it': i18next.t('list_command.cosmetics_subcommand.options.linked.description', { lng: 'it' }),
                            'ja': i18next.t('list_command.cosmetics_subcommand.options.linked.description', { lng: 'ja' }),
                            'ko': i18next.t('list_command.cosmetics_subcommand.options.linked.description', { lng: 'ko' }),
                            'pl': i18next.t('list_command.cosmetics_subcommand.options.linked.description', { lng: 'pl' }),
                            'pt-BR': i18next.t('list_command.cosmetics_subcommand.options.linked.description', { lng: 'pt-BR' }),
                            'ru': i18next.t('list_command.cosmetics_subcommand.options.linked.description', { lng: 'ru' }),
                            'th': i18next.t('list_command.cosmetics_subcommand.options.linked.description', { lng: 'th' }),
                            'tr': i18next.t('list_command.cosmetics_subcommand.options.linked.description', { lng: 'tr' }),
                            'zh-CN': i18next.t('list_command.cosmetics_subcommand.options.linked.description', { lng: 'zh-Hans' }),
                            'zh-TW': i18next.t('list_command.cosmetics_subcommand.options.linked.description', { lng: 'zh-Hant' })
                        })
                        .setRequired(false)
                )
        ) : undefined;

export async function execute(interaction: ChatInputCommandInteraction) {
    const subcommand = interaction.options.getSubcommand();
    const locale = interaction.locale;

    switch (subcommand) {
        case 'cosmetics':
            await handleCosmeticListCommandInteraction(interaction);
            break;
        case 'builds':
            await handleBuildsListCommandInteraction(interaction);
            break;
        default:
            await interaction.reply(getTranslation('list_command.unknown_subcommand', locale, 'errors'));
    }
}

export async function autocomplete(interaction: AutocompleteInteraction) {
    const subcommand = interaction.options.getSubcommand();

    switch (subcommand) {
        case 'cosmetics':
            await handleCosmeticListCommandAutocompleteInteraction(interaction);
            break;
        case 'builds':
            await handleBuildsListCommandAutocompleteInteraction(interaction);
            break;
        default:
            break;
    }
}