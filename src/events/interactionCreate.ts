import { Client, Interaction } from 'discord.js';
import { handleButtonInteraction } from './buttonInteractionHandler';
import {
    execute as executeCosmetic,
    autocomplete as autocompleteCosmetic
} from '../commands/cosmeticCommand';
import {
    execute as executeCosmeticList
} from "../commands/cosmeticListCommand";

export default async (client: Client, interaction: Interaction) => {
    switch (true) {
        case interaction.isChatInputCommand() && interaction.commandName === 'cosmetic':
            await executeCosmetic(interaction);
            break;

        case interaction.isAutocomplete() && interaction.commandName === 'cosmetic':
            autocompleteCosmetic(interaction);
            break;

        // case interaction.isChatInputCommand() && interaction.commandName === 'cosmetic_list':
        //     await executeCosmeticList(interaction);
        //     break;

        case interaction.isButton():
            await handleButtonInteraction(interaction);
            break;

        default:
            console.warn('Unhandled interaction type or command:', interaction);
            break;
    }
};