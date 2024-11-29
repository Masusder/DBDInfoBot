import {
    ChatInputCommandInteraction,
    EmbedBuilder
} from "discord.js";
import { getTranslation } from "@utils/localizationUtils";

export async function sendErrorMessage(interaction: ChatInputCommandInteraction, inputMessage: string, isLocalized: boolean = true): Promise<void> {
    const locale = interaction.locale;

    const outputMessage = isLocalized ? getTranslation(inputMessage, locale, 'errors') : inputMessage;
    const embed = new EmbedBuilder()
        .setColor('Red')
        .setDescription(`:x: ${outputMessage}`);

    try {
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp({ embeds: [embed] });
        } else {
            await interaction.reply({ embeds: [embed] });
        }
    } catch (error) {
        console.error("Error sending error message:", error);
    }
}