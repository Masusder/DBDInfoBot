import {
    ButtonInteraction,
    ChatInputCommandInteraction,
    EmbedBuilder,
    MessageFlags,
    StringSelectMenuInteraction
} from "discord.js";
import { t } from "@utils/localizationUtils";
import { ELocaleNamespace } from "@tps/enums/ELocaleNamespace";
import { ThemeColors } from "@constants/themeColors";

export async function sendUnauthorizedMessage(
    interaction: ChatInputCommandInteraction | ButtonInteraction | StringSelectMenuInteraction,
    customMessage?: string
) {
    const locale = interaction.locale;

    const message = customMessage ? `:lock: ${customMessage}` : `:lock: ${t('general.unauthorized', locale, ELocaleNamespace.Errors)}`;

    const embed = new EmbedBuilder()
        .setColor(ThemeColors.WARNING)
        .setTitle(t('general.unauthorized_title', locale, ELocaleNamespace.Errors))
        .setDescription(message);

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