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
import { genericPaginationHandler } from "../../handlers/genericPaginationHandler";
import { getTranslation } from "@utils/localizationUtils";
import { Cosmetic } from "../../types";
import { Rarities } from "@data/Rarities";
import { combineImagesIntoGrid } from "@utils/imageUtils";

const COSMETICS_PER_PAGE = 6;

export async function handleCosmeticListCommandInteraction(interaction: ChatInputCommandInteraction) {
    const locale = interaction.locale;

    try {
        await interaction.deferReply();

        const filters = constructFilters(interaction);
        const filterCount = Object.keys(filters).length;

        const { Character = -1, Rarity } = filters; // Deconstruct filters for use

        const cosmetics = await getFilteredCosmeticsList(filters, locale);

        if (cosmetics.length === 0) {
            const message = filterCount > 0
                ? getTranslation('list_command.cosmetics_subcommand.cosmetics_not_found_filters', locale, 'errors')
                : getTranslation('list_command.cosmetics_subcommand.cosmetics_not_found', locale, 'errors');
            await interaction.editReply({ content: message });
            return;
        }

        const generateEmbed = async(pageItems: Cosmetic[]) => {
            let title = `${getTranslation('list_command.cosmetics_subcommand.found_total.0', locale, 'messages')} ${cosmetics.length} ${getTranslation('list_command.cosmetics_subcommand.found_total.1', locale, 'messages')}`;

            // Let user know that filters were applied
            if (filterCount > 0) title += ` (${getTranslation('list_command.cosmetics_subcommand.filters_applied', locale, 'messages')}: ${filterCount})`;

            const embedColor = Rarity ? Rarities[Rarity].color : '#5865f2';

            const embed = new EmbedBuilder()
                .setTitle(title)
                .setDescription(`${getTranslation('list_command.cosmetics_subcommand.more_info.0', locale, 'messages')}: \`/${getTranslation('list_command.cosmetics_subcommand.more_info.1', locale, 'messages')}\``)
                .setColor(embedColor as ColorResolvable)
                .setFooter({ text: getTranslation('list_command.cosmetics_subcommand.cosmetics_list', locale, 'messages') })
                .setTimestamp();

            if (Character !== -1) {
                const characterData = await getCharacterDataByIndex(Character, locale);
                if (characterData) {
                    const characterPortrait = combineBaseUrlWithPath(characterData.IconFilePath);
                    embed.setThumbnail(characterPortrait);
                }
            }

            pageItems.forEach(cosmetic => {
                const description = formatHtmlToDiscordMarkdown(cosmetic.Description);
                const formattedAndTruncatedDescription = description.length > 45 ? description.substring(0, 45) + '..' : description;

                embed.addFields({
                    name: cosmetic.CosmeticName,
                    value: formattedAndTruncatedDescription,
                    inline: true
                });
            });

            return embed;
        };

        const generateImage = async(pageItems: Cosmetic[]) => {
            const imageUrls: string[] = [];
            pageItems.forEach((cosmetic: Cosmetic) => {
                imageUrls.push(combineBaseUrlWithPath(cosmetic.IconFilePathList));
            });

            return await combineImagesIntoGrid(imageUrls);
        };

        await genericPaginationHandler({
            items: cosmetics,
            itemsPerPage: COSMETICS_PER_PAGE,
            generateEmbed,
            generateImage,
            interactionUserId: interaction.user.id,
            interactionReply: interaction,
            locale
        });
    } catch (error) {
        console.error("Error executing cosmetics list subcommand:", error);
    }
}

// region Cosmetic List Utils

function constructFilters(interaction: ChatInputCommandInteraction): Partial<Cosmetic> {
    const characterIndexString = interaction.options.getString('character');
    const isLinked = interaction.options.getBoolean('linked');
    const isPurchasable = interaction.options.getBoolean('purchasable');
    const rarity = interaction.options.getString('rarity');
    const inclusionVersion = interaction.options.getString('inclusion_version');
    const type = interaction.options.getString('type');
    const filters: Partial<Cosmetic> = {};

    if (characterIndexString) filters.Character = parseInt(characterIndexString);
    if (isLinked !== null) filters.Unbreakable = isLinked;
    if (isPurchasable !== null) filters.Purchasable = isPurchasable;
    if (rarity !== null) filters.Rarity = rarity;
    if (inclusionVersion !== null) filters.InclusionVersion = inclusionVersion;
    if (type !== null) filters.Type = type;

    return filters;
}

// endregion

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