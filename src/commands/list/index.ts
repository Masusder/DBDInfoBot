import i18next from "i18next";
import { SlashCommandBuilder } from "@discordjs/builders";
import {
    AutocompleteInteraction,
    ChatInputCommandInteraction,
    Locale
} from "discord.js";
import { ELocaleNamespace } from "@tps/enums/ELocaleNamespace";
import {
    handleCosmeticListCommandAutocompleteInteraction,
    handleCosmeticListCommandInteraction
} from "@commands/list/cosmetics";
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
} from "@commands/list/builds";
import {
    handleAddonListCommandInteraction,
    handleAddonsListCommandAutocompleteInteraction
} from "@commands/list/addons";

const rarityChoices = Object.keys(Rarities)
    .filter(rarity => rarity !== "N/A")
    .map(rarity => {
        const localizedName = Rarities[rarity].localizedName;

        const name_localizations: Record<string, string> = {};
        Object.values(Locale).forEach(locale => {
            name_localizations[locale] = i18next.t(localizedName, {
                lng: mapDiscordLocaleToDbdLang(locale),
                ns: ELocaleNamespace.General
            });
        });

        return {
            name: i18next.t(localizedName, { lng: 'en', ns: ELocaleNamespace.General }),
            name_localizations,
            value: rarity
        };
    });

const typeChoices = Object.keys(CosmeticTypes)
    .map(type => {
        const localizedName = CosmeticTypes[type].localizedName;

        const name_localizations: Record<string, string> = {};
        Object.values(Locale).forEach(locale => {
            name_localizations[locale] = i18next.t(localizedName, {
                lng: mapDiscordLocaleToDbdLang(locale),
                ns: ELocaleNamespace.General
            });
        });

        return {
            name: i18next.t(localizedName, { lng: 'en', ns: ELocaleNamespace.General }),
            name_localizations,
            value: type
        };
    });

const buildCategories = Object.entries(BuildCategories).map(([value, name]) => {
    const name_localizations: Record<string, string> = {};
    Object.values(Locale).forEach(locale => {
        name_localizations[locale] = i18next.t(name, {
            lng: mapDiscordLocaleToDbdLang(locale),
            ns: ELocaleNamespace.General
        });
    });

    return {
        name: i18next.t(name, { lng: 'en', ns: ELocaleNamespace.General }),
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
        .setContexts([0,1,2])
        .setIntegrationTypes([0,1])
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
                        .setNameLocalizations(commandLocalizationHelper('list_command.builds_subcommand.options.role.name'))
                        .setDescription(i18next.t('list_command.builds_subcommand.options.role.description', { lng: 'en' }))
                        .setDescriptionLocalizations(commandLocalizationHelper('list_command.builds_subcommand.options.role.description'))
                        .setRequired(true)
                        .addChoices(
                            {
                                name: i18next.t('list_command.builds_subcommand.options.role.choices.killer', { lng: 'en' }),
                                name_localizations: commandLocalizationHelper('list_command.builds_subcommand.options.role.choices.killer'),
                                value: 'Killer'
                            },
                            {
                                name: i18next.t('list_command.builds_subcommand.options.role.choices.survivor', { lng: 'en' }),
                                name_localizations: commandLocalizationHelper('list_command.builds_subcommand.options.role.choices.survivor'),
                                value: 'Survivor'
                            }
                        )
                )
                .addNumberOption(option =>
                    option
                        .setName('page')
                        .setNameLocalizations(commandLocalizationHelper('list_command.builds_subcommand.options.page.name'))
                        .setDescription(i18next.t('list_command.builds_subcommand.options.page.description', { lng: 'en' }))
                        .setDescriptionLocalizations(commandLocalizationHelper('list_command.builds_subcommand.options.page.description'))
                        .setRequired(false)
                        .setMinValue(1)
                        .setMaxValue(9999)
                )
                .addStringOption(option =>
                    option
                        .setName('title')
                        .setNameLocalizations(commandLocalizationHelper('list_command.builds_subcommand.options.title.name'))
                        .setDescription(i18next.t('list_command.builds_subcommand.options.title.description', { lng: 'en' }))
                        .setDescriptionLocalizations(commandLocalizationHelper('list_command.builds_subcommand.options.title.description'))
                        .setRequired(false)
                )
                .addStringOption(option =>
                    option
                        .setName('category')
                        .setNameLocalizations(commandLocalizationHelper('list_command.builds_subcommand.options.category.name'))
                        .setDescription(i18next.t('list_command.builds_subcommand.options.category.description', { lng: 'en' }))
                        .setDescriptionLocalizations(commandLocalizationHelper('list_command.builds_subcommand.options.category.description'))
                        .setRequired(false)
                        .addChoices(...buildCategories)
                )
                .addStringOption(option =>
                    option
                        .setName('character')
                        .setNameLocalizations(commandLocalizationHelper('list_command.builds_subcommand.options.character.name'))
                        .setDescription(i18next.t('list_command.builds_subcommand.options.character.description', { lng: 'en' }))
                        .setDescriptionLocalizations(commandLocalizationHelper('list_command.builds_subcommand.options.character.description'))
                        .setRequired(false)
                        .setAutocomplete(true)
                )
                .addStringOption(option =>
                    option
                        .setName('version')
                        .setNameLocalizations(commandLocalizationHelper('list_command.builds_subcommand.options.version.name'))
                        .setDescription(i18next.t('list_command.builds_subcommand.options.version.description', { lng: 'en' }))
                        .setDescriptionLocalizations(commandLocalizationHelper('list_command.builds_subcommand.options.version.description'))
                        .setRequired(false)
                        .setAutocomplete(true)
                )
                .addNumberOption(option =>
                    option
                        .setName('rating')
                        .setNameLocalizations(commandLocalizationHelper('list_command.builds_subcommand.options.rating.name'))
                        .setDescription(i18next.t('list_command.builds_subcommand.options.rating.description', { lng: 'en' }))
                        .setDescriptionLocalizations(commandLocalizationHelper('list_command.builds_subcommand.options.rating.description'))
                        .setRequired(false)
                        .addChoices(
                            {
                                name: i18next.t('list_command.builds_subcommand.options.rating.choices.one_star', { lng: 'en' }),
                                name_localizations: commandLocalizationHelper('list_command.builds_subcommand.options.rating.choices.one_star'),
                                value: 1
                            },
                            {
                                name: i18next.t('list_command.builds_subcommand.options.rating.choices.two_stars', { lng: 'en' }),
                                name_localizations: commandLocalizationHelper('list_command.builds_subcommand.options.rating.choices.two_stars'),
                                value: 2
                            },
                            {
                                name: i18next.t('list_command.builds_subcommand.options.rating.choices.three_stars', { lng: 'en' }),
                                name_localizations: commandLocalizationHelper('list_command.builds_subcommand.options.rating.choices.three_stars'),
                                value: 3
                            },
                            {
                                name: i18next.t('list_command.builds_subcommand.options.rating.choices.four_stars', { lng: 'en' }),
                                name_localizations: commandLocalizationHelper('list_command.builds_subcommand.options.rating.choices.four_stars'),
                                value: 4
                            },
                            {
                                name: i18next.t('list_command.builds_subcommand.options.rating.choices.five_stars', { lng: 'en' }),
                                name_localizations: commandLocalizationHelper('list_command.builds_subcommand.options.rating.choices.five_stars'),
                                value: 5
                            }
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
                        .setName('role')
                        .setNameLocalizations(commandLocalizationHelper('list_command.cosmetics_subcommand.options.role.name'))
                        .setDescription(i18next.t('list_command.cosmetics_subcommand.options.role.description', { lng: 'en' }))
                        .setDescriptionLocalizations(commandLocalizationHelper('list_command.cosmetics_subcommand.options.role.description'))
                        .setChoices(
                            {
                                name: i18next.t('roles.killer', { lng: 'en', ns: ELocaleNamespace.General }),
                                name_localizations: commandLocalizationHelper('roles.killer', ELocaleNamespace.General),
                                value: 'Killer'
                            },
                            {
                                name: i18next.t('roles.survivor', { lng: 'en', ns: ELocaleNamespace.General }),
                                name_localizations: commandLocalizationHelper('roles.survivor', ELocaleNamespace.General),
                                value: 'Survivor'
                            },
                            {
                                name: i18next.t('roles.none', { lng: 'en', ns: ELocaleNamespace.General }),
                                name_localizations: commandLocalizationHelper('roles.none', ELocaleNamespace.General),
                                value: 'None'
                            }
                        )
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
                .addBooleanOption(option =>
                    option
                        .setName('on_sale')
                        .setNameLocalizations(commandLocalizationHelper('list_command.cosmetics_subcommand.options.on_sale.name'))
                        .setDescription(i18next.t('list_command.cosmetics_subcommand.options.on_sale.description', { lng: 'en' }))
                        .setDescriptionLocalizations(commandLocalizationHelper('list_command.cosmetics_subcommand.options.on_sale.description'))
                        .setRequired(false)
                )
                .addBooleanOption(option =>
                    option
                        .setName('limited')
                        .setNameLocalizations(commandLocalizationHelper('list_command.cosmetics_subcommand.options.limited.name'))
                        .setDescription(i18next.t('list_command.cosmetics_subcommand.options.limited.description', { lng: 'en' }))
                        .setDescriptionLocalizations(commandLocalizationHelper('list_command.cosmetics_subcommand.options.limited.description'))
                        .setRequired(false)
                )
                .addStringOption(option =>
                    option
                        .setName('search')
                        .setNameLocalizations(commandLocalizationHelper('list_command.cosmetics_subcommand.options.search.name'))
                        .setDescription(i18next.t('list_command.cosmetics_subcommand.options.search.description', { lng: 'en' }))
                        .setDescriptionLocalizations(commandLocalizationHelper('list_command.cosmetics_subcommand.options.search.description'))
                        .setAutocomplete(false)
                        .setRequired(false)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('addons')
                .setNameLocalizations(commandLocalizationHelper('list_command.addons_subcommand.name'))
                .setDescription(i18next.t('list_command.addons_subcommand.description', { lng: 'en' }))
                .setDescriptionLocalizations(commandLocalizationHelper('list_command.addons_subcommand.description'))
                .addStringOption(option =>
                    option
                        .setName('character')
                        .setNameLocalizations(commandLocalizationHelper('list_command.addons_subcommand.options.character.name'))
                        .setDescription(i18next.t('list_command.addons_subcommand.options.character.description', { lng: 'en' }))
                        .setDescriptionLocalizations(commandLocalizationHelper('list_command.addons_subcommand.options.character.description'))
                        .setAutocomplete(true)
                        .setRequired(false)
                )
                .addStringOption(option =>
                    option
                        .setName('rarity')
                        .setNameLocalizations(commandLocalizationHelper('list_command.addons_subcommand.options.rarity.name'))
                        .setDescription(i18next.t('list_command.addons_subcommand.options.rarity.description', { lng: 'en' }))
                        .setDescriptionLocalizations(commandLocalizationHelper('list_command.addons_subcommand.options.rarity.description'))
                        .setChoices(...rarityChoices)
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
        case 'addons':
            await handleAddonListCommandInteraction(interaction);
            break;
        default:
            await interaction.reply(getTranslation('list_command.unknown_subcommand', locale, ELocaleNamespace.Errors));
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
        case 'addons':
            await handleAddonsListCommandAutocompleteInteraction(interaction);
            break;
        default:
            break;
    }
}