import { SlashCommandBuilder } from '@discordjs/builders';
import {
    AutocompleteInteraction,
    ChatInputCommandInteraction
} from 'discord.js';
import i18next from "i18next";

import {
    handleItemCommandAutocompleteInteraction,
    handleItemCommandInteraction
} from "@commands/info/item";
import {
    handleOfferingCommandAutocompleteInteraction,
    handleOfferingCommandInteraction
} from "@commands/info/offering";
import {
    handleBuildCommandAutocompleteInteraction,
    handleBuildCommandInteraction
} from "@commands/info/build";
import { commandLocalizationHelper } from "@utils/localizationUtils";
import {
    handleCollectionCommandAutocompleteInteraction,
    handleCollectionCommandInteraction
} from "@commands/info/collection";
import {
    handlePerkCommandAutocompleteInteraction,
    handlePerkCommandInteraction
} from "@commands/info/perk";
import {
    handleAddonCommandAutocompleteInteraction,
    handleAddonCommandInteraction
} from "@commands/info/addon";
import {
    handleCharacterCommandAutocompleteInteraction,
    handleCharacterCommandInteraction
} from "@commands/info/character";
import {
    handleCosmeticCommandAutocompleteInteraction,
    handleCosmeticCommandInteraction
} from "@commands/info/cosmetic";
import {
    handleRiftCommandAutocompleteInteraction,
    handleRiftCommandInteraction
} from "@commands/info/rift";

export const data = i18next.isInitialized
    ? new SlashCommandBuilder()
        .setName('info')
        .setNameLocalizations(commandLocalizationHelper('info_command.name'))
        .setDescription(i18next.t('info_command.description', { lng: 'en' }))
        .setDescriptionLocalizations(commandLocalizationHelper('info_command.description'))
        .setContexts([0,1,2])
        .setIntegrationTypes([0,1])
        .addStringOption(option =>
            option.setName('type')
                .setNameLocalizations(commandLocalizationHelper('info_command.options.type.name'))
                .setDescription(i18next.t('info_command.options.type.description', { lng: 'en' }))
                .setDescriptionLocalizations(commandLocalizationHelper('info_command.options.type.description'))
                .setRequired(true)
                .setChoices(
                    {
                        name: i18next.t('info_command.options.type.choices.perk', { lng: 'en' }),
                        name_localizations: commandLocalizationHelper('info_command.options.type.choices.perk'),
                        value: 'perk'
                    },
                    {
                        name: i18next.t('info_command.options.type.choices.addon', { lng: 'en' }),
                        name_localizations: commandLocalizationHelper('info_command.options.type.choices.addon'),
                        value: 'addon'
                    },
                    {
                        name: i18next.t('info_command.options.type.choices.item', { lng: 'en' }),
                        name_localizations: commandLocalizationHelper('info_command.options.type.choices.item'),
                        value: 'item'
                    },
                    {
                        name: i18next.t('info_command.options.type.choices.offering', { lng: 'en' }),
                        name_localizations: commandLocalizationHelper('info_command.options.type.choices.offering'),
                        value: 'offering'
                    },
                    {
                        name: i18next.t('info_command.options.type.choices.character', { lng: 'en' }),
                        name_localizations: commandLocalizationHelper('info_command.options.type.choices.character'),
                        value: 'character'
                    },
                    {
                        name: i18next.t('info_command.options.type.choices.cosmetic', { lng: 'en' }),
                        name_localizations: commandLocalizationHelper('info_command.options.type.choices.cosmetic'),
                        value: 'cosmetic'
                    },
                    {
                        name: i18next.t('info_command.options.type.choices.build', { lng: 'en' }),
                        name_localizations: commandLocalizationHelper('info_command.options.type.choices.build'),
                        value: 'build'
                    },
                    {
                        name: i18next.t('info_command.options.type.choices.collection', { lng: 'en' }),
                        name_localizations: commandLocalizationHelper('info_command.options.type.choices.collection'),
                        value: 'collection'
                    },
                    {
                        name: i18next.t('info_command.options.type.choices.rift', { lng: 'en' }),
                        name_localizations: commandLocalizationHelper('info_command.options.type.choices.rift'),
                        value: 'rift'
                    }
                )
        )
        .addStringOption(option =>
            option.setName('name')
                .setNameLocalizations(commandLocalizationHelper('info_command.options.name.name'))
                .setDescription(i18next.t('info_command.options.name.description', { lng: 'en' }))
                .setDescriptionLocalizations(commandLocalizationHelper('info_command.options.name.description'))
                .setRequired(true)
                .setAutocomplete(true)
        ) : undefined;

export async function execute(interaction: ChatInputCommandInteraction) {
    const type = interaction.options.getString('type');

    switch (type) {
        case 'perk':
            await handlePerkCommandInteraction(interaction);
            break;
        case 'addon':
            await handleAddonCommandInteraction(interaction);
            break;
        case 'item':
            await handleItemCommandInteraction(interaction);
            break;
        case 'offering':
            await handleOfferingCommandInteraction(interaction);
            break;
        case 'character':
            await handleCharacterCommandInteraction(interaction);
            break;
        case 'cosmetic':
            await handleCosmeticCommandInteraction(interaction);
            break;
        case 'build':
            await handleBuildCommandInteraction(interaction);
            break;
        case 'collection':
            await handleCollectionCommandInteraction(interaction);
            break;
        case 'rift':
            await handleRiftCommandInteraction(interaction);
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
        case 'addon':
            await handleAddonCommandAutocompleteInteraction(interaction);
            break;
        case 'item':
            await handleItemCommandAutocompleteInteraction(interaction);
            break;
        case 'offering':
            await handleOfferingCommandAutocompleteInteraction(interaction);
            break;
        case 'character':
            await handleCharacterCommandAutocompleteInteraction(interaction);
            break;
        case 'cosmetic':
            await handleCosmeticCommandAutocompleteInteraction(interaction);
            break;
        case 'build':
            await handleBuildCommandAutocompleteInteraction(interaction);
            break;
        case 'collection':
            await handleCollectionCommandAutocompleteInteraction(interaction);
            break;
        case 'rift':
            await handleRiftCommandAutocompleteInteraction(interaction);
            break;
        default:
            break;
    }
}

// endregion