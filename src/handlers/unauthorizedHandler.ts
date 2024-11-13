import {
    ButtonInteraction,
    EmbedBuilder
} from "discord.js";
import { getTranslation } from "@utils/localizationUtils";

export async function sendUnauthorizedMessage(interaction: ButtonInteraction) {
    const locale = interaction.locale;

    const embed = new EmbedBuilder()
        .setColor('Red')
        .setDescription(`:x: ${getTranslation('general.unauthorized', locale, 'errors')}`);

    try {
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp({ embeds: [embed], ephemeral: true });
        } else {
            await interaction.reply({ embeds: [embed], ephemeral: true });
        }
    } catch (error) {
        console.error("Error sending unauthorized message:", error);
    }
}