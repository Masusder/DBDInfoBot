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
import { layerIcons } from "@commands/infoSubCommands/infoUtils";
import {
    getItemChoices,
    getItemDataByName
} from "@services/itemService";
import { Rarities } from "@data/Rarities";
import {
    getCharacterByParentItem
} from "@services/characterService";

export async function handleItemCommandInteraction(interaction: ChatInputCommandInteraction) {
    const itemName = interaction.options.getString('name');
    const locale = interaction.locale;

    if (!itemName) return;

    try {
        await interaction.deferReply();

        const itemData = await getItemDataByName(itemName, locale);

        if (!itemData) return;

        const characterData = await getCharacterByParentItem(itemData.ItemId, locale)

        const role = itemData.Role as 'Killer' | 'Survivor' | 'None';
        const roleData = Role[role];

        const rarity = itemData.Rarity;
        const rarityData = Rarities[rarity];

        const itemBackgroundUrl = rarityData.itemsAddonsBackgroundPath;
        const itemIconUrl = combineBaseUrlWithPath(itemData.IconFilePathList);
        const imageBuffer = await layerIcons(itemBackgroundUrl, itemIconUrl);

        const fields: APIEmbedField[] = [];

        if (characterData) {
            fields.push({
                name: getTranslation('info_command.item_subcommand.character', locale, 'messages'),
                value: characterData.Name,
                inline: true
            });
        }

        fields.push(
            {
                name: getTranslation('info_command.item_subcommand.role', locale, 'messages'),
                value: getTranslation(roleData.localizedName, locale, 'general'),
                inline: true
            },
            {
                name: getTranslation('info_command.item_subcommand.rarity', locale, 'messages'),
                value: getTranslation(rarityData.localizedName, locale, 'general'),
                inline: true
            },
        );

        const embed = new EmbedBuilder()
            .setColor(rarityData.color as ColorResolvable)
            .setTitle(itemName)
            .setFields(fields)
            .setTimestamp()
            .setDescription(formatHtmlToDiscordMarkdown(itemData.Description)) // Field would be preferred but there's 1024 characters limit
            .setThumbnail(`attachment://itemImage_${itemData.ItemId}.png`)
            .setAuthor({
                name: getTranslation('info_command.item_subcommand.item_information', locale, 'messages'),
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

export async function handleItemCommandAutocompleteInteraction(interaction: AutocompleteInteraction) {
    try {
        const locale = interaction.locale;
        const focusedValue = interaction.options.getFocused().toLowerCase();
        const choices = await getItemChoices(focusedValue, locale);

        const options = choices.slice(0, 25).map(item => ({
            name: item.Name,
            value: item.Name
        }));

        await interaction.respond(options);
    } catch (error) {
        console.error("Error handling autocomplete interaction:", error);
    }
}