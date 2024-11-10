import { Interaction, ChatInputCommandInteraction, AutocompleteInteraction } from 'discord.js';
import buttonInteractionCreate from './buttonInteractionCreate';
import {
    execute as executeCosmetic,
    debouncedAutocomplete as autocompleteCosmetic
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
import {
    execute as executeInfo,
    autocomplete as autocompleteInfo
} from "@commands/infoCommand"

interface CommandHandler {
    execute: (interaction: ChatInputCommandInteraction) => Promise<void>;
    autocomplete?: (interaction: AutocompleteInteraction) => Promise<void>;
}

const commandHandlers: Record<string, CommandHandler> = {
    cosmetic: {
        execute: async (interaction: ChatInputCommandInteraction) => {
            await executeCosmetic(interaction);
        },
        autocomplete: async (interaction: AutocompleteInteraction) => {
            await autocompleteCosmetic(interaction);
        }
    },
    cosmetics: {
        execute: async (interaction: ChatInputCommandInteraction) => {
            await executeCosmeticList(interaction);
        },
        autocomplete: async (interaction: AutocompleteInteraction) => {
            await autocompleteCosmeticList(interaction);
        }
    },
    builds: {
        execute: async (interaction: ChatInputCommandInteraction) => {
            await executeBuildList(interaction);
        },
        autocomplete: async (interaction: AutocompleteInteraction) => {
            const focusedOption = interaction.options.getFocused(true);
            if (focusedOption.name === 'character') {
                await autocompleteCharacterBuildList(interaction);
            }
            if (focusedOption.name === 'version') {
                await autocompleteInclusionVersionBuildList(interaction);
            }
        }
    },
    info: {
        execute: async (interaction: ChatInputCommandInteraction) => {
            await executeInfo(interaction);
        },
        autocomplete: async (interaction: AutocompleteInteraction) => {
            await autocompleteInfo(interaction);
        }
    }
};

export default async (interaction: Interaction) => {
    // Chat Input Commands
    if (interaction.isChatInputCommand()) {
        const commandName = interaction.commandName;
        const command = commandHandlers[commandName];

        if (command) {
            await command.execute(interaction as ChatInputCommandInteraction);
        }
        return;
    }

    // Autocomplete Interactions
    if (interaction.isAutocomplete()) {
        const commandName = interaction.commandName;
        const command = commandHandlers[commandName];

        if (command) {
            await command.autocomplete?.(interaction as AutocompleteInteraction);
        }
        return;
    }

    // Handle Button Interactions
    if (interaction.isButton()) {
        if (!interaction.customId.startsWith('pagination')) {
            await buttonInteractionCreate(interaction);
        }
        return;
    }

    console.warn('Unhandled interaction type or command:', interaction);
};