import {
    APIEmbedField,
    AutocompleteInteraction,
    ChatInputCommandInteraction,
    ColorResolvable,
    EmbedBuilder
} from "discord.js";
import { Role } from "@data/Role";
import {
    combineBaseUrlWithPath,
    formatHtmlToDiscordMarkdown
} from "@utils/stringUtils";
import { t } from "@utils/localizationUtils";
import { layerIcons } from "@utils/imageUtils";
import {
    getOfferingChoices,
    getOfferingDataById
} from "@services/offeringService";
import { Rarities } from "@data/Rarities";
import { ELocaleNamespace } from "@tps/enums/ELocaleNamespace";
import { sendErrorMessage } from "@handlers/errorResponseHandler";
import logger from "@logger";

// region Interaction Handlers
export async function handleOfferingCommandInteraction(interaction: ChatInputCommandInteraction) {
    const offeringId = interaction.options.getString('name');
    const locale = interaction.locale;

    if (!offeringId) return;

    try {
        await interaction.deferReply();

        const offeringData = await getOfferingDataById(offeringId, locale);

        if (!offeringData) {
            const message = t('info_command.offering_subcommand.error_retrieving_data', locale, ELocaleNamespace.Errors) + ' ' + t('general.try_again_later', locale, ELocaleNamespace.Errors);
            await sendErrorMessage(interaction, message);
            return;
        }

        const role = offeringData.Role as 'Killer' | 'Survivor' | 'None';
        const roleData = Role[role];

        const rarity = offeringData.Rarity;
        const rarityData = Rarities[rarity];

        const offeringBackgroundUrl = rarityData.offeringBackgroundPath;
        const offeringIconUrl = combineBaseUrlWithPath(offeringData.Image);
        const imageBuffer = await layerIcons(offeringBackgroundUrl, offeringIconUrl) as Buffer;

        const markdownDescription = formatHtmlToDiscordMarkdown(offeringData.Description);
        const description = offeringData.Available === "Retired" ?
            `${markdownDescription}\n\n**${t('info_command.offering_subcommand.retired', locale, ELocaleNamespace.Messages)}**`
            : markdownDescription;

        const fields: APIEmbedField[] = [
            {
                name: t('info_command.offering_subcommand.role', locale, ELocaleNamespace.Messages),
                value: t(roleData.localizedName, locale, ELocaleNamespace.General),
                inline: true
            },
            {
                name: t('info_command.offering_subcommand.rarity', locale, ELocaleNamespace.Messages),
                value: t(rarityData.localizedName, locale, ELocaleNamespace.General),
                inline: true
            },
            {
                name: t('info_command.offering_subcommand.description', locale, ELocaleNamespace.Messages),
                value: description,
                inline: false
            }];

        const embed = new EmbedBuilder()
            .setColor(rarityData.color as ColorResolvable)
            .setTitle(offeringData.Name)
            .setFields(fields)
            .setTimestamp()
            .setThumbnail(`attachment://offeringImage_${offeringData.OfferingId}.png`)
            .setAuthor({
                name: t('info_command.offering_subcommand.offering_information', locale, ELocaleNamespace.Messages),
                iconURL: combineBaseUrlWithPath('/images/UI/Icons/Help/iconHelp_offerings.png')
            });

        await interaction.editReply({
            embeds: [embed],
            files: [{
                attachment: imageBuffer,
                name: `offeringImage_${offeringData.OfferingId}.png`
            }]
        });
    } catch (error) {
        logger.error("Error executing offering subcommand:", error);
    }
}

// endregion

// region Autocomplete
export async function handleOfferingCommandAutocompleteInteraction(interaction: AutocompleteInteraction) {
    try {
        const locale = interaction.locale;
        const focusedValue = interaction.options.getFocused().toLowerCase();
        const choices = await getOfferingChoices(focusedValue, locale);

        const options = choices.slice(0, 25).map(offering => ({
            name: offering.Name,
            value: offering.OfferingId
        }));

        await interaction.respond(options);
    } catch (error) {
        logger.error("Error handling autocomplete interaction:", error);
    }
}

// endregion