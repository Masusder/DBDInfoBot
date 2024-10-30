import { Client, Interaction } from 'discord.js';
import { handleButtonInteraction } from './buttonInteractionHandler';
import {
    execute as executeCosmetic,
    autocomplete as autocompleteCosmetic
} from '../commands/cosmeticCommand';

export default async (client: Client, interaction: Interaction) => {
    if (interaction.isChatInputCommand() && interaction.commandName === 'cosmetic') {
        await executeCosmetic(interaction);
    } else if (interaction.isAutocomplete() && interaction.commandName === 'cosmetic') {
        await autocompleteCosmetic(interaction);
    }

    if (interaction.isButton()) {
        await handleButtonInteraction(interaction);
    }
};
