import {
    AutocompleteInteraction,
    ChatInputCommandInteraction,
    ColorResolvable,
    EmbedBuilder
} from "discord.js";
import {
    getCharacterChoices,
    getCharacterDataByIndex
} from "@services/characterService";
import {
    getFilteredCosmeticsList,
    getInclusionVersionsForCosmetics
} from "@services/cosmeticService";
import {
    combineBaseUrlWithPath,
    formatHtmlToDiscordMarkdown,
    formatInclusionVersion
} from "@utils/stringUtils";
import { paginationHandler } from "@handlers/paginationHandler";
import { getTranslation } from "@utils/localizationUtils";
import { Cosmetic } from "@tps/cosmetic";
import { Rarities } from "@data/Rarities";
import {
    combineImagesIntoGrid,
    layerIcons
} from "@utils/imageUtils";
import { ELocaleNamespace } from "@tps/enums/ELocaleNamespace";
import { ThemeColors } from "@constants/themeColors";
import { Role } from "@data/Role";
import { CosmeticTypes } from "@data/CosmeticTypes";
import { generateStoreCustomizationIcons } from "@commands/info/cosmetic/utils";
import { constructFilters } from "./utils";

const COSMETICS_PER_PAGE = 6;

export async function handleCosmeticListCommandInteraction(interaction: ChatInputCommandInteraction) {
    const locale = interaction.locale;

    try {
        await interaction.deferReply();

        const { filters, customFilters } = constructFilters(interaction);
        const filterCount = Object.keys(filters).length;

        const { Character = -1, Rarity, Category, InclusionVersion } = filters; // Deconstruct filters for use

        const cosmetics = await getFilteredCosmeticsList(filters, locale, customFilters);

        if (cosmetics.length === 0) {
            const message = filterCount > 0
                ? getTranslation('list_command.cosmetics_subcommand.cosmetics_not_found_filters', locale, ELocaleNamespace.Errors)
                : getTranslation('list_command.cosmetics_subcommand.cosmetics_not_found', locale, ELocaleNamespace.Errors);
            await interaction.editReply({ content: message });
            return;
        }

        const generateEmbed = async(pageItems: Cosmetic[]) => {
            let title = `${getTranslation('list_command.cosmetics_subcommand.found_total.0', locale, ELocaleNamespace.Messages)} ${cosmetics.length} ${getTranslation('list_command.cosmetics_subcommand.found_total.1', locale, ELocaleNamespace.Messages)}`;

            // Let user know that filters were applied
            if (filterCount > 0) title += ` (${getTranslation('list_command.cosmetics_subcommand.filters_applied', locale, ELocaleNamespace.Messages)}: ${filterCount})`;

            const embedColor = Rarity ? Rarities[Rarity].color : ThemeColors.PRIMARY;

            let authorName = getTranslation('list_command.cosmetics_subcommand.cosmetics_list', locale, ELocaleNamespace.Messages);

            if (Category) authorName += ` (${getTranslation(CosmeticTypes[Category].localizedName, locale, ELocaleNamespace.General)})`;
            if (InclusionVersion) authorName += ` (${formatInclusionVersion(InclusionVersion, locale)})`;

            const embed = new EmbedBuilder()
                .setTitle(title)
                .setDescription(`${getTranslation('list_command.cosmetics_subcommand.more_info.0', locale, ELocaleNamespace.Messages)}: \`/${getTranslation('list_command.cosmetics_subcommand.more_info.1', locale, ELocaleNamespace.Messages)}\``)
                .setColor(embedColor as ColorResolvable)
                .setTimestamp()
                .setAuthor({
                    name: authorName,
                    iconURL: Category ? CosmeticTypes[Category].icon : combineBaseUrlWithPath('/images/UI/Icons/Help/iconHelp_store.png')
                });

            if (Character !== -1) {
                const characterData = await getCharacterDataByIndex(Character, locale);
                if (characterData) {
                    const characterPortrait = combineBaseUrlWithPath(characterData.IconFilePath);
                    embed.setThumbnail(characterPortrait);
                }
            }

            pageItems.forEach(cosmetic => {
                const description = formatHtmlToDiscordMarkdown(cosmetic.Description);
                const formattedAndTruncatedDescription = description.length > 60 ? description.substring(0, 60) + '..' : description;

                embed.addFields({
                    name: cosmetic.CosmeticName,
                    value: formattedAndTruncatedDescription,
                    inline: true
                });
            });

            return embed;
        };

        const generateThumbnail = async(): Promise<{ attachment: Buffer | string; name: string } | null> => {
            if (Character !== -1) {
                const characterData = await getCharacterDataByIndex(Character, locale);
                if (characterData) {
                    const characterBackground = Role[characterData.Role as 'Killer' | 'Survivor'].charPortrait;
                    const characterPortrait = combineBaseUrlWithPath(characterData.IconFilePath);

                    const portraitBuffer = await layerIcons(characterBackground, characterPortrait) as Buffer;

                    return { attachment: portraitBuffer, name: "generated_thumbnail.png" };
                }
            }

            return null;
        };

        const generateImage = async(pageItems: Cosmetic[]) => {
            const customizationBuffers = await generateStoreCustomizationIcons(pageItems) as Buffer[];

            return await combineImagesIntoGrid(customizationBuffers);
        };

        await paginationHandler({
            items: cosmetics,
            itemsPerPage: COSMETICS_PER_PAGE,
            generateEmbed,
            generateImage,
            interactionUserId: interaction.user.id,
            interactionReply: interaction,
            locale,
            generatedThumbnail: await generateThumbnail()
        });
    } catch (error) {
        console.error("Error executing cosmetics list subcommand:", error);
    }
}

// region Autocomplete
export async function handleCosmeticListCommandAutocompleteInteraction(interaction: AutocompleteInteraction) {
    try {
        const focusedOption = interaction.options.getFocused(true);
        switch (focusedOption.name) {
            case 'character':
                await autocompleteCharacters(interaction);
                break;
            case 'inclusion_version':
                await autocompleteInclusionVersion(interaction);
                break;
            default:
                break;
        }
    } catch (error) {
        console.error("Error handling cosmetic list autocomplete interaction:", error);
    }
}

async function autocompleteCharacters(interaction: AutocompleteInteraction) {
    const locale = interaction.locale;
    const focusedValue = interaction.options.getFocused();
    const choices = await getCharacterChoices(focusedValue, locale);
    const options = choices.slice(0, 25).map(character => ({
        name: character.Name,
        value: character.CharacterIndex as string
    }));

    await interaction.respond(options);
}

async function autocompleteInclusionVersion(interaction: AutocompleteInteraction) {
    const locale = interaction.locale;
    const inclusionVersions = await getInclusionVersionsForCosmetics(locale);
    const focusedValue = interaction.options.getFocused();

    const options = inclusionVersions
        .map(version => ({
            name: formatInclusionVersion(version, locale),
            value: version
        }))
        .filter(option => option.name.toLowerCase().includes(focusedValue))
        .slice(0, 25);

    await interaction.respond(options);
}

// endregion