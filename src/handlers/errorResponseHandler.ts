import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonInteraction,
    ButtonStyle,
    ChatInputCommandInteraction,
    EmbedBuilder,
    StringSelectMenuInteraction
} from "discord.js";
import { t } from "@utils/localizationUtils";
import { ELocaleNamespace } from "@tps/enums/ELocaleNamespace";
import { ThemeColors } from "@constants/themeColors";
import logger from "@logger";

interface RedirectButtonOptions {
    url: string;
    label: string;
}

export async function sendErrorMessage(interaction: ChatInputCommandInteraction | StringSelectMenuInteraction | ButtonInteraction, inputMessage: string, redirectButtonOptions?: RedirectButtonOptions): Promise<void> {
    const locale = interaction.locale;

    const embed = new EmbedBuilder()
        .setColor(ThemeColors.ERROR)
        .setTitle(t('general.error_occurred', locale, ELocaleNamespace.Errors))
        .setDescription(`:x: ${t(inputMessage, locale, ELocaleNamespace.Errors)}`); // TODO: Is there need to translate it here?

    const row = new ActionRowBuilder<ButtonBuilder>();
    if (redirectButtonOptions) {
        const redirectButton = new ButtonBuilder()
            .setLabel(redirectButtonOptions.label)
            .setStyle(ButtonStyle.Link)
            .setURL(redirectButtonOptions.url);

        row.addComponents(redirectButton);
    }

    try {
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp({ embeds: [embed], components: row.components.length > 0 ? [row] : [] });
        } else {
            await interaction.reply({ embeds: [embed], components: row.components.length > 0 ? [row] : [] });
        }
    } catch (error) {
        logger.error("Error sending error message:", error);
    }
}