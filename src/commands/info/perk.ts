import {
    APIEmbedField,
    AutocompleteInteraction,
    ButtonInteraction,
    ChatInputCommandInteraction,
    EmbedBuilder,
    Locale,
    MessageFlags
} from 'discord.js';
import {
    getPerkChoices,
    getPerkDataById
} from "@services/perkService";
import { Role } from "@data/Role";
import { getCharacterDataByIndex } from "@services/characterService";
import {
    combineBaseUrlWithPath,
    formatHtmlToDiscordMarkdown
} from "@utils/stringUtils";
import { t } from "@utils/localizationUtils";
import { layerIcons } from "@utils/imageUtils";
import { ELocaleNamespace } from '@tps/enums/ELocaleNamespace';
import { sendErrorMessage } from "@handlers/errorResponseHandler";
import logger from "@logger";

// region Interaction Handlers
export async function handlePerkCommandInteraction(interaction: ChatInputCommandInteraction) {
    const perkId = interaction.options.getString('name');
    const locale = interaction.locale;

    if (!perkId) return;

    try {
        await interaction.deferReply();

        const {
            embed,
            attachments
        } = await generatePerkInteractionData(interaction, locale, perkId);

        await interaction.editReply({
            embeds: [embed],
            files: attachments
        });
    } catch (error) {
        logger.error("Error executing perk subcommand:", error);
    }
}

export async function handlePerkButtonInteraction(interaction: ButtonInteraction) {
    const perkId = interaction.customId.split("::")[1];
    const locale = interaction.locale;

    if (!perkId) return;

    try {
        const {
            embed,
            attachments
        } = await generatePerkInteractionData(interaction, locale, perkId);

        await interaction.followUp({
            embeds: [embed],
            files: attachments,
            flags: MessageFlags.Ephemeral
        });
    } catch (error) {
        logger.error("Error handling perk button interaction:", error);
    }
}

// endregion

// region Autocomplete
export async function handlePerkCommandAutocompleteInteraction(interaction: AutocompleteInteraction) {
    try {
        const locale = interaction.locale;
        const focusedValue = interaction.options.getFocused().toLowerCase();
        const choices = await getPerkChoices(focusedValue, locale);

        const options = choices.slice(0, 25).map(perk => ({
            name: perk.Name,
            value: perk.PerkId
        }));

        await interaction.respond(options);
    } catch (error) {
        logger.error("Error handling autocomplete interaction:", error);
    }
}

// endregion

// region Interaction Data
export async function generatePerkInteractionData(
    interaction: ChatInputCommandInteraction | ButtonInteraction,
    locale: Locale,
    perkId: string
) {
    let perkData = await getPerkDataById(perkId, locale);

    if (!perkData) {
        const message = t('info_command.perk_subcommand.error_retrieving_data', locale, ELocaleNamespace.Errors) + ' ' + t('general.try_again_later', locale, ELocaleNamespace.Errors);
        await sendErrorMessage(interaction, message);
        throw new Error(`Perk data not found for ID "${perkId}".`);
    }

    const role = perkData.Role as 'Survivor' | 'Killer';
    const roleData = Role[role];

    const perkBackgroundUrl = roleData.perkBackground;
    const perkIconUrl = combineBaseUrlWithPath(perkData.IconFilePathList);
    const imageBuffer = await layerIcons(perkBackgroundUrl, perkIconUrl) as Buffer;

    const characterData = await getCharacterDataByIndex(perkData.Character, locale);

    let characterName: string | null = null;
    if (characterData) characterName = characterData.Name;

    const perkName = perkData.Name;
    const title = characterName ? `${perkName} (${characterName})` : `${perkName} (${t('info_command.perk_subcommand.generic_perk', locale, ELocaleNamespace.Messages)})`;

    const field: APIEmbedField = {
        name: t('info_command.perk_subcommand.description', locale, ELocaleNamespace.Messages),
        value: formatHtmlToDiscordMarkdown(perkData.Description)
    };

    const embed = new EmbedBuilder()
        .setColor(roleData.hexColor)
        .setTitle(title)
        .setFields(field)
        .setTimestamp()
        .setThumbnail(`attachment://perkImage_${perkData.PerkId}.png`)
        .setAuthor({
            name: t('info_command.perk_subcommand.perk_information', locale, ELocaleNamespace.Messages),
            iconURL: combineBaseUrlWithPath('/images/UI/Icons/Help/iconHelp_perks.png')
        });

    const attachments = [{
        attachment: imageBuffer,
        name: `perkImage_${perkData.PerkId}.png`
    }]

    return { embed, attachments };

}

// endregion