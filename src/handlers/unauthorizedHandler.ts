import {
    ButtonInteraction,
    EmbedBuilder,
    StringSelectMenuInteraction
} from "discord.js";
import { getTranslation } from "@utils/localizationUtils";
import { ELocaleNamespace } from "@tps/enums/ELocaleNamespace";

export async function sendUnauthorizedMessage(interaction: ButtonInteraction | StringSelectMenuInteraction) {
    const locale = interaction.locale;

    const embed = new EmbedBuilder()
        .setColor('Yellow')
        .setDescription(`:x: ${getTranslation('general.unauthorized', locale, ELocaleNamespace.Errors)}`);

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