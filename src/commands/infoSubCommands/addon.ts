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
    getAddonChoices,
    getAddonDataByName
} from "@services/addonService";
import { Rarities } from "@data/Rarities";
import { ELocaleNamespace } from "@tps/enums/ELocaleNamespace";

export async function handleAddonCommandInteraction(interaction: ChatInputCommandInteraction) {
    const addonName = interaction.options.getString('name');
    const locale = interaction.locale;

    if (!addonName) return;

    try {
        await interaction.deferReply();

        const addonData = await getAddonDataByName(addonName, locale);

        if (!addonData) return;

        const role = addonData.Role as 'Killer' | 'Survivor' | 'None';
        const roleData = Role[role];

        const rarity = addonData.Rarity;
        const rarityData = Rarities[rarity];

        const addonBackgroundUrl = rarityData.itemsAddonsBackgroundPath;
        const addonIconUrl = combineBaseUrlWithPath(addonData.Image);
        const imageBuffer = await layerIcons(addonBackgroundUrl, addonIconUrl) as Buffer;

        const fields: APIEmbedField[] = [
            {
                name: getTranslation('info_command.addon_subcommand.role', locale, ELocaleNamespace.Messages),
                value: getTranslation(roleData.localizedName, locale, ELocaleNamespace.General),
                inline: true
            },
            {
                name: getTranslation('info_command.addon_subcommand.rarity', locale, ELocaleNamespace.Messages),
                value: getTranslation(rarityData.localizedName, locale, ELocaleNamespace.General),
                inline: true
            },
            {
                name: getTranslation('info_command.addon_subcommand.description', locale, ELocaleNamespace.Messages),
                value: formatHtmlToDiscordMarkdown(addonData.Description),
                inline: false
            }];

        const embed = new EmbedBuilder()
            .setColor(rarityData.color as ColorResolvable)
            .setTitle(addonName)
            .setFields(fields)
            .setTimestamp()
            .setThumbnail(`attachment://addonImage_${addonData.AddonId}.png`)
            .setAuthor({
                name: getTranslation('info_command.addon_subcommand.addon_information', locale, ELocaleNamespace.Messages),
                iconURL: combineBaseUrlWithPath('/images/UI/Icons/Help/iconHelp_addons.png')
            });

        await interaction.editReply({
            embeds: [embed],
            files: [{
                attachment: imageBuffer,
                name: `addonImage_${addonData.AddonId}.png`
            }]
        });
    } catch (error) {
        console.error("Error executing addon subcommand:", error);
    }
}

export async function handleAddonCommandAutocompleteInteraction(interaction: AutocompleteInteraction) {
    try {
        const locale = interaction.locale;
        const focusedValue = interaction.options.getFocused().toLowerCase();
        const choices = await getAddonChoices(focusedValue, locale);

        const options = choices.slice(0, 25).map(addon => ({
            name: addon.Name,
            value: addon.Name
        }));

        await interaction.respond(options);
    } catch (error) {
        console.error("Error handling autocomplete interaction:", error);
    }
}