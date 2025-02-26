import {
    AutocompleteInteraction,
    ButtonInteraction,
    ChatInputCommandInteraction,
    MessageFlags
} from "discord.js";
import { getCosmeticChoicesFromIndex, } from "@services/cosmeticService";
import generateCosmeticInteractionData from "./interactionData";
import logger from "@logger";

// region Interaction Handlers
export async function handleCosmeticCommandInteraction(interaction: ChatInputCommandInteraction) {
    const cosmeticId = interaction.options.getString('name');
    const locale = interaction.locale;

    if (!cosmeticId) return;

    try {
        await interaction.deferReply();

        const {
            embed,
            attachments,
            actionRow
        } = await generateCosmeticInteractionData(cosmeticId, locale, interaction);

        await interaction.editReply({
            embeds: [embed],
            files: attachments,
            components: [actionRow]
        });
    } catch (error) {
        logger.error("Error executing cosmetic subcommand:", error);
    }
}

export async function handleCosmeticButtonInteraction(interaction: ButtonInteraction, cosmeticId: string) {
    const locale = interaction.locale;

    try {
        const {
            embed,
            attachments
        } = await generateCosmeticInteractionData(cosmeticId, locale, interaction);

        await interaction.followUp({
            embeds: [embed],
            files: attachments,
            flags: MessageFlags.Ephemeral
        });
    } catch (error) {
        logger.error("Error handling cosmetic button interaction:", error);
    }
}

// endregion

// region Autocomplete
export async function handleCosmeticCommandAutocompleteInteraction(interaction: AutocompleteInteraction) {
    try {
        const locale = interaction.locale;
        const focusedValue = interaction.options.getFocused().toLowerCase();
        const choices = await getCosmeticChoicesFromIndex(focusedValue, locale);

        const options = choices.slice(0, 25).map(cosmetic => ({
            name: `${cosmetic.CosmeticName} (ID: ${cosmetic.CosmeticId})`, // We need to display IDs as names can repeat
            value: cosmetic.CosmeticId
        }));

        await interaction.respond(options);
    } catch (error) {
        logger.error("Error handling autocomplete cosmetic interaction:", error);
    }
}

// endregion