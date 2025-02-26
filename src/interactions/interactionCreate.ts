import {
    AutocompleteInteraction,
    ChatInputCommandInteraction,
    Interaction
} from 'discord.js';
import { CooldownManager } from "@utils/cooldown";
import { sendUnauthorizedMessage } from "@handlers/unauthorizedHandler";
import { t } from "@utils/localizationUtils";
import { ELocaleNamespace } from "@tps/enums/ELocaleNamespace";
import buttonInteractionCreate from './buttonInteractionCreate';
import menuInteractionCreate from './menuInteractionCreate';
import {
    autocomplete as autocompleteInfo,
    execute as executeInfo
} from "@commands/info";
import {
    autocomplete as autocompleteList,
    execute as executeList
} from "@commands/list";
import { execute as executeNews } from "@commands/news";
import { execute as executeStats } from "@commands/stats";
import {
    autocomplete as autocompleteInventory,
    execute as executeInventory
} from "@commands/inventory";
import { execute as executeSupport } from "@commands/support";
import { handleShrineCommandInteraction } from "@commands/shrine";
import logger from "@logger";

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
            await handleShrineCommandInteraction(interaction);
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
        },
        cooldown: 120,
    },
    inventory: {
        execute: async(interaction: ChatInputCommandInteraction) => {
            await executeInventory(interaction);
        },
        autocomplete: async(interaction: AutocompleteInteraction) => {
            await autocompleteInventory(interaction);
        },
        cooldown: 120,
    },
    support: {
        execute: async(interaction: ChatInputCommandInteraction) => {
            await executeSupport(interaction);
        },
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
                const locale = interaction.locale;

                // Check cooldown
                if (command.cooldown && cooldownManager.isOnCooldown(userId, commandName)) {
                    const remainingTime = Math.ceil(
                        cooldownManager.getRemainingCooldown(userId, commandName) / 1000
                    );

                    await sendUnauthorizedMessage(interaction, t('general.command_cooldown', locale, ELocaleNamespace.Errors, { remaining_time: remainingTime.toString() }))
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
        logger.error('Unhandled interaction:', error.message);
    }
};