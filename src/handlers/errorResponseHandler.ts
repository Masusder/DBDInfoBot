import {
    ButtonInteraction,
    ChatInputCommandInteraction,
    EmbedBuilder,
    StringSelectMenuInteraction
} from "discord.js";
import { getTranslation } from "@utils/localizationUtils";
import { ELocaleNamespace } from "@tps/enums/ELocaleNamespace";
import { ThemeColors } from "@constants/themeColors";

export async function sendErrorMessage(interaction: ChatInputCommandInteraction | StringSelectMenuInteraction | ButtonInteraction, inputMessage: string, isLocalized: boolean = true): Promise<void> {
    const locale = interaction.locale;

    const outputMessage = isLocalized ? getTranslation(inputMessage, locale, ELocaleNamespace.Errors) : inputMessage;
    const embed = new EmbedBuilder()
        .setColor(ThemeColors.ERROR)
        .setTitle(getTranslation('general.error_occurred', locale, ELocaleNamespace.Errors))
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