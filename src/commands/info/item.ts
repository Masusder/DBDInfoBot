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
import { getTranslation } from "@utils/localizationUtils";
import { layerIcons } from "@utils/imageUtils";
import {
    getItemChoices,
    getItemDataById
} from "@services/itemService";
import { Rarities } from "@data/Rarities";
import {
    getCharacterByParentItem
} from "@services/characterService";
import { ELocaleNamespace } from "@tps/enums/ELocaleNamespace";
import { sendErrorMessage } from "@handlers/errorResponseHandler";

// region Interaction Handlers
export async function handleItemCommandInteraction(interaction: ChatInputCommandInteraction) {
    const itemId = interaction.options.getString('name');
    const locale = interaction.locale;

    if (!itemId) return;

    try {
        await interaction.deferReply();

        const itemData = await getItemDataById(itemId, locale);

        if (!itemData) {
            const message = getTranslation('info_command.item_subcommand.error_retrieving_data', locale, ELocaleNamespace.Errors) + ' ' + getTranslation('general.try_again_later', locale, ELocaleNamespace.Errors);
            await sendErrorMessage(interaction, message);
            return;
        }

        const characterData = await getCharacterByParentItem(itemData.ItemId, locale)

        const role = itemData.Role as 'Killer' | 'Survivor' | 'None';
        const roleData = Role[role];

        const rarity = itemData.Rarity;
        const rarityData = Rarities[rarity];

        const itemBackgroundUrl = rarityData.itemsAddonsBackgroundPath;
        const itemIconUrl = combineBaseUrlWithPath(itemData.IconFilePathList);
        const imageBuffer = await layerIcons(itemBackgroundUrl, itemIconUrl) as Buffer;

        const fields: APIEmbedField[] = [];

        if (characterData) {
            fields.push({
                name: getTranslation('info_command.item_subcommand.character', locale, ELocaleNamespace.Messages),
                value: characterData.Name,
                inline: true
            });
        }

        fields.push(
            {
                name: getTranslation('info_command.item_subcommand.role', locale, ELocaleNamespace.Messages),
                value: getTranslation(roleData.localizedName, locale, ELocaleNamespace.General),
                inline: true
            },
            {
                name: getTranslation('info_command.item_subcommand.rarity', locale, ELocaleNamespace.Messages),
                value: getTranslation(rarityData.localizedName, locale, ELocaleNamespace.General),
                inline: true
            },
        );

        const embed = new EmbedBuilder()
            .setColor(rarityData.color as ColorResolvable)
            .setTitle(itemData.Name)
            .setFields(fields)
            .setTimestamp()
            .setDescription(formatHtmlToDiscordMarkdown(itemData.Description)) // Field would be preferred but there's 1024 characters limit
            .setThumbnail(`attachment://itemImage_${itemData.ItemId}.png`)
            .setAuthor({
                name: getTranslation('info_command.item_subcommand.item_information', locale, ELocaleNamespace.Messages),
                iconURL: combineBaseUrlWithPath('/images/UI/Icons/Help/iconHelp_items.png')
            });

        await interaction.editReply({
            embeds: [embed],
            files: [{
                attachment: imageBuffer,
                name: `itemImage_${itemData.ItemId}.png`
            }]
        });
    } catch (error) {
        console.error("Error executing item subcommand:", error);
    }
}

// endregion

// region Autocomplete
export async function handleItemCommandAutocompleteInteraction(interaction: AutocompleteInteraction) {
    try {
        const locale = interaction.locale;
        const focusedValue = interaction.options.getFocused().toLowerCase();
        const choices = await getItemChoices(focusedValue, locale);

        const options = choices.slice(0, 25).map(item => ({
            name: item.Name,
            value: item.ItemId
        }));

        await interaction.respond(options);
    } catch (error) {
        console.error("Error handling autocomplete interaction:", error);
    }
}

// endregion