import { ButtonInteraction } from "discord.js";
import { extractInteractionId } from "@utils/stringUtils";
import { handleCosmeticButtonInteraction } from "@commands/info/cosmetic";

export async function cosmeticHandler(interaction: ButtonInteraction) {
    const cosmeticId = extractInteractionId(interaction.customId);

    if (cosmeticId) {
        await handleCosmeticButtonInteraction(interaction, cosmeticId);
    }
}