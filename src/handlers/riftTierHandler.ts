import { extractMultipleInteractionIds } from "@utils/stringUtils";
import { ButtonInteraction } from "discord.js";
import { handleCosmeticButtonInteraction } from "@commands/infoSubCommands/cosmetic";

export async function riftTierHandler(interaction: ButtonInteraction) {
    const [cosmeticIdsString] = extractMultipleInteractionIds(interaction.customId);

    const cosmeticIds: string[] = cosmeticIdsString.split(",");

    for (const cosmeticId of cosmeticIds) {
        await handleCosmeticButtonInteraction(interaction, cosmeticId);
    }
}