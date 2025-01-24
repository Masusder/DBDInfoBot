import {
    ButtonInteraction,
    EmbedBuilder,
    MessageFlags,
    StringSelectMenuInteraction
} from "discord.js";
import { t } from "@utils/localizationUtils";
import { ELocaleNamespace } from "@tps/enums/ELocaleNamespace";
import { ThemeColors } from "@constants/themeColors";

export async function sendUnauthorizedMessage(interaction: ButtonInteraction | StringSelectMenuInteraction) {
    const locale = interaction.locale;

    const embed = new EmbedBuilder()
        .setColor(ThemeColors.WARNING)
        .setTitle(t('general.unauthorized_title', locale, ELocaleNamespace.Errors))
        .setDescription(`:lock: ${t('general.unauthorized', locale, ELocaleNamespace.Errors)}`);

    try {
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp({
                embeds: [embed],
                flags: MessageFlags.Ephemeral
            });
        } else {
            await interaction.reply({
                embeds: [embed],
                flags: MessageFlags.Ephemeral
            });
        }
    } catch (error) {
        console.error("Error sending unauthorized message:", error);
    }
}