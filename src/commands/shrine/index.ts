import { SlashCommandBuilder } from '@discordjs/builders';
import {
    ActionRowBuilder,
    ButtonBuilder,
    ChatInputCommandInteraction,
    Locale,
    NewsChannel
} from 'discord.js';
import i18next from "i18next";
import { getCachedShrine } from "@services/shrineService";
import { getCachedPerks } from "@services/perkService";
import {
    commandLocalizationHelper,
    t
} from "@utils/localizationUtils";
import Constants from "@constants";
import publishMessage from "@utils/discord/publishMessage";
import createShrineCanvas from './images/shrineCanvas';
import getCorrectlyCasedPerkData from "@commands/shrine/utils/perkDataUtil";
import generateShrineEmbed from "@commands/shrine/utils/embed";
import generatePerkButtons from "@commands/shrine/utils/buttons";
import { sendErrorMessage } from "@handlers/errorResponseHandler";
import { ELocaleNamespace } from "@tps/enums/ELocaleNamespace";

export const data = i18next.isInitialized
    ? new SlashCommandBuilder()
        .setName('shrine')
        .setNameLocalizations(commandLocalizationHelper('shrine_command.name'))
        .setDescription(i18next.t('shrine_command.description', { lng: 'en' }))
        .setDescriptionLocalizations(commandLocalizationHelper('shrine_command.description'))
        .setContexts([0, 1, 2])
        .setIntegrationTypes([0, 1])
    : undefined;

// region Interaction Handlers
export async function handleShrineCommandInteraction(interaction: ChatInputCommandInteraction) {
    const locale = interaction.locale;

    try {
        await interaction.deferReply();

        const embedData = await handleShrineCommand(locale);

        if (!embedData) {
            await sendErrorMessage(interaction, t('shrine_command.failed_generating_content', locale, ELocaleNamespace.Errors))
            return;
        }

        const { embed, row, shrineCanvasBuffer } = embedData;

        await interaction.editReply({
            embeds: [embed],
            files: [{ attachment: shrineCanvasBuffer, name: 'shrine-of-secrets.png' }],
            components: [row]
        });
    } catch (error) {
        console.error("Error executing Shrine chat input command:", error);
        await sendErrorMessage(interaction, t('general.fatal_error_generic', locale, ELocaleNamespace.Errors))
    }
}

export async function sendShrineToChannel(channel: NewsChannel) {
    try {
        const embedData = await handleShrineCommand(Locale.EnglishUS);

        if (!embedData) return;

        const { embed, row, shrineCanvasBuffer } = embedData;

        const message = await channel.send({
            content: `<@&${Constants.DBDLEAKS_SHRINE_NOTIFICATION_ROLE}>`,
            embeds: [embed],
            files: [{ attachment: shrineCanvasBuffer, name: 'shrine-of-secrets.png' }],
            components: [row]
        });

        publishMessage(message, channel).catch(error => {
            console.error("Failed to publish message:", error);
        });
    } catch (error) {
        console.error("Error sending shrine to channel:", error);
    }
}

async function handleShrineCommand(locale: Locale) {
    const [shrineData, perkData] = await Promise.all([getCachedShrine(), getCachedPerks(locale)]);

    if (!shrineData || !shrineData.currentShrine || !perkData) return null;

    const correctlyCasedPerkData = getCorrectlyCasedPerkData(shrineData.currentShrine.perks, perkData);
    // Shrine canvas creation saves the emojis, so don't parallelize with rest of the promises
    const shrineCanvasBuffer = await createShrineCanvas(correctlyCasedPerkData, perkData);
    const [embedData, buttons] = await Promise.all([
        generateShrineEmbed(locale, shrineData.currentShrine, correctlyCasedPerkData, perkData),
        generatePerkButtons(correctlyCasedPerkData, perkData)
    ]);

    return {
        embed: embedData,
        row: new ActionRowBuilder<ButtonBuilder>().addComponents(buttons), shrineCanvasBuffer
    };
}

// endregion