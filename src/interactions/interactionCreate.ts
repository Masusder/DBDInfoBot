import { Interaction } from 'discord.js';
import { handleButtonInteraction } from './buttonInteractionHandler';
import {
    execute as executeCosmetic,
    autocomplete as autocompleteCosmetic
} from '../commands/cosmeticCommand';
import {
    execute as executeCosmeticList,
    autocomplete as autocompleteCosmeticList
} from "../commands/cosmeticListCommand";
import {
    execute as executeBuildList,
    autocompleteCharacter as autocompleteCharacterBuildList,
    autocompleteInclusionVersion as autocompleteInclusionVersionBuildList
} from "../commands/buildListCommand";

export default async(interaction: Interaction) => {
    switch (true) {
        case interaction.isChatInputCommand() && interaction.commandName === 'cosmetic':
            await executeCosmetic(interaction);
            break;

        case interaction.isAutocomplete() && interaction.commandName === 'cosmetic':
            autocompleteCosmetic(interaction);
            break;

        case interaction.isAutocomplete() && interaction.commandName === 'cosmetic_list':
            await autocompleteCosmeticList(interaction);
            break;

        case interaction.isChatInputCommand() && interaction.commandName === 'cosmetic_list':
            await executeCosmeticList(interaction);
            break;

        case interaction.isChatInputCommand() && interaction.commandName === 'build_list':
            await executeBuildList(interaction);
            break;

        case interaction.isAutocomplete() && interaction.commandName === 'build_list':
            const focusedOption = interaction.options.getFocused(true);

            if (focusedOption.name === 'character') {
                await autocompleteCharacterBuildList(interaction);
            } else if (focusedOption.name === 'version') {
                await autocompleteInclusionVersionBuildList(interaction);
            }
            break;

        case interaction.isButton():
            if (!interaction.customId.startsWith('pagination')) {
                await handleButtonInteraction(interaction);
            }
            break;

        default:
            console.warn('Unhandled interaction type or command:', interaction);
            break;
    }
};