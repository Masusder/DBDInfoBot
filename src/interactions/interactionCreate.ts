import {
    Interaction,
    ChatInputCommandInteraction,
    AutocompleteInteraction
} from 'discord.js';
import buttonInteractionCreate from './buttonInteractionCreate';
import menuInteractionCreate from './menuInteractionCreate';
import {
    execute as executeInfo,
    autocomplete as autocompleteInfo
} from "@commands/info";
import {
    execute as executeList,
    autocomplete as autocompleteList
} from "@commands/list";
import { execute as executeShrine } from "@commands/shrine";
import { execute as executeNews } from "@commands/news";
import { execute as executeStats } from "@commands/stats";
import {
    execute as executeInventory,
    autocomplete as autocompleteInventory
} from "@commands/inventory";
import { CooldownManager } from "@utils/cooldown";

const cooldownManager = new CooldownManager();

interface CommandHandler {
    execute: (interaction: ChatInputCommandInteraction) => Promise<void>;
    autocomplete?: (interaction: AutocompleteInteraction) => Promise<void>;
    cooldown?: number;
}

const commandHandlers: Record<string, CommandHandler> = {
    info: {
        execute: async(interaction: ChatInputCommandInteraction) => {
            await executeInfo(interaction);
        },
        autocomplete: async(interaction: AutocompleteInteraction) => {
            await autocompleteInfo(interaction);
        }
    },
    list: {
        execute: async(interaction: ChatInputCommandInteraction) => {
            await executeList(interaction);
        },
        autocomplete: async(interaction: AutocompleteInteraction) => {
            await autocompleteList(interaction);
        }
    },
    shrine: {
        execute: async(interaction: ChatInputCommandInteraction) => {
            await executeShrine(interaction);
        }
    },
    news: {
        execute: async(interaction: ChatInputCommandInteraction) => {
            await executeNews(interaction);
        }
    },
    stats: {
        execute: async(interaction: ChatInputCommandInteraction) => {
            await executeStats(interaction);
        }
    },
    inventory: {
        execute: async(interaction: ChatInputCommandInteraction) => {
            await executeInventory(interaction);
        },
        autocomplete: async(interaction: AutocompleteInteraction) => {
            await autocompleteInventory(interaction);
        },
        cooldown: 15,
    }
};

export default async(interaction: Interaction) => {
    try {
        // Chat Input Commands
        if (interaction.isChatInputCommand()) {
            const commandName = interaction.commandName;
            const command = commandHandlers[commandName];

            if (command) {
                const userId = interaction.user.id;

                // Check cooldown
                if (command.cooldown && cooldownManager.isOnCooldown(userId, commandName)) {
                    const remainingTime = Math.ceil(
                        cooldownManager.getRemainingCooldown(userId, commandName) / 1000
                    );

                    await interaction.reply({
                        content: `Please wait ${remainingTime} seconds before using this command again.`, // TODO: localize, use unauthorized handler
                        ephemeral: true,
                    });
                    return;
                }

                // Set cooldown
                if (command.cooldown) {
                    cooldownManager.setCooldown(userId, commandName, command.cooldown);
                }

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

        // Handle Menu Interactions
        if (interaction.isStringSelectMenu()) {
            if (!interaction.customId.startsWith('builds-selection')) {
                await menuInteractionCreate(interaction);
            }
            return;
        }

        console.warn('Unhandled interaction type or command:', interaction);
    } catch (error: any) {
        console.error('Unhandled interaction:', error.message);
    }
};