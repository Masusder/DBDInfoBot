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
    commandLocalizationHelper,
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
        .setNameLocalizations(commandLocalizationHelper('list_command.name'))
        .setDescription(i18next.t('list_command.description', { lng: 'en' }))
        .setDescriptionLocalizations(commandLocalizationHelper('list_command.description'))
        // The reason why I'm going to use subcommand and not string option
        // is to have support for individual choices for each subcommand
        .addSubcommand(subcommand =>
            subcommand
                .setName('builds')
                .setNameLocalizations(commandLocalizationHelper('list_command.builds_subcommand.name'))
                .setDescription(i18next.t('list_command.builds_subcommand.description', { lng: 'en' }))
                .setDescriptionLocalizations(commandLocalizationHelper('list_command.builds_subcommand.description'))
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
                .setNameLocalizations(commandLocalizationHelper('list_command.cosmetics_subcommand.name'))
                .setDescription(i18next.t('list_command.cosmetics_subcommand.description', { lng: 'en' }))
                .setDescriptionLocalizations(commandLocalizationHelper('list_command.cosmetics_subcommand.description'))
                .addStringOption(option =>
                    option
                        .setName('character')
                        .setNameLocalizations(commandLocalizationHelper('list_command.cosmetics_subcommand.options.character.name'))
                        .setDescription(i18next.t('list_command.cosmetics_subcommand.options.character.description', { lng: 'en' }))
                        .setDescriptionLocalizations(commandLocalizationHelper('list_command.cosmetics_subcommand.options.character.description'))
                        .setAutocomplete(true)
                        .setRequired(false)
                )
                .addStringOption(option =>
                    option
                        .setName('rarity')
                        .setNameLocalizations(commandLocalizationHelper('list_command.cosmetics_subcommand.options.rarity.name'))
                        .setDescription(i18next.t('list_command.cosmetics_subcommand.options.rarity.description', { lng: 'en' }))
                        .setDescriptionLocalizations(commandLocalizationHelper('list_command.cosmetics_subcommand.options.rarity.description'))
                        .setChoices(...rarityChoices)
                        .setRequired(false)
                )
                .addStringOption(option =>
                    option
                        .setName('type')
                        .setNameLocalizations(commandLocalizationHelper('list_command.cosmetics_subcommand.options.type.name'))
                        .setDescription(i18next.t('list_command.cosmetics_subcommand.options.type.description', { lng: 'en' }))
                        .setDescriptionLocalizations(commandLocalizationHelper('list_command.cosmetics_subcommand.options.type.description'))
                        .setChoices(...typeChoices)
                        .setRequired(false)
                )
                .addStringOption(option =>
                    option
                        .setName('inclusion_version')
                        .setNameLocalizations(commandLocalizationHelper('list_command.cosmetics_subcommand.options.inclusion_version.name'))
                        .setDescription(i18next.t('list_command.cosmetics_subcommand.options.inclusion_version.description', { lng: 'en' }))
                        .setDescriptionLocalizations(commandLocalizationHelper('list_command.cosmetics_subcommand.options.inclusion_version.description'))
                        .setAutocomplete(true)
                        .setRequired(false)
                )
                .addBooleanOption(option =>
                    option
                        .setName('purchasable')
                        .setNameLocalizations(commandLocalizationHelper('list_command.cosmetics_subcommand.options.purchasable.name'))
                        .setDescription(i18next.t('list_command.cosmetics_subcommand.options.purchasable.description', { lng: 'en' }))
                        .setDescriptionLocalizations(commandLocalizationHelper('list_command.cosmetics_subcommand.options.purchasable.description'))
                        .setRequired(false)
                )
                .addBooleanOption(option =>
                    option
                        .setName('linked')
                        .setNameLocalizations(commandLocalizationHelper('list_command.cosmetics_subcommand.options.linked.name'))
                        .setDescription(i18next.t('list_command.cosmetics_subcommand.options.linked.description', { lng: 'en' }))
                        .setDescriptionLocalizations(commandLocalizationHelper('list_command.cosmetics_subcommand.options.linked.description'))
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