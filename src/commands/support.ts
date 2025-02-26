import i18next from "i18next";
import { SlashCommandBuilder } from "@discordjs/builders";
import {
    commandLocalizationHelper,
    t
} from "@utils/localizationUtils";
import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ChatInputCommandInteraction,
    MessageFlags,
} from "discord.js";
import { sendErrorMessage } from "@handlers/errorResponseHandler";
import { ELocaleNamespace } from "@tps/enums/ELocaleNamespace";
import Constants from "@constants";
import logger from "@logger";

export const data = i18next.isInitialized
    ? new SlashCommandBuilder()
        .setName('support')
        .setNameLocalizations(commandLocalizationHelper('support_command.name'))
        .setDescription(i18next.t('support_command.description', { lng: 'en' }))
        .setDescriptionLocalizations(commandLocalizationHelper('support_command.description'))
        .setContexts([0, 1, 2])
        .setIntegrationTypes([0, 1])
    : undefined;

export async function execute(interaction: ChatInputCommandInteraction) {
    const locale = interaction.locale;

    try {
        const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
            new ButtonBuilder()
                .setLabel(t('support_command.support', locale, ELocaleNamespace.Messages))
                .setStyle(ButtonStyle.Link)
                .setURL(Constants.DBDLEAKS_DISCORD_URL)
        );

        await interaction.reply({
            content: `${t('support_command.join_server', locale, ELocaleNamespace.Messages)} ${Constants.DBDLEAKS_DISCORD_URL}`,
            components: [row],
            flags: MessageFlags.Ephemeral
        });
    } catch (error) {
        logger.error("Error executing support command:", error);
        await sendErrorMessage(interaction, t('general.fatal_error_generic', locale, ELocaleNamespace.Errors));
    }
}