import {
    AutocompleteInteraction,
    ChatInputCommandInteraction,
    EmbedBuilder
} from "discord.js";
import {
    getCachedCharacters,
    getCharacterChoices
} from "@services/characterService";
import { getFilteredAddonsList } from "@services/addonService";
import {
    genericPaginationHandler,
    IPaginationOptions
} from "@handlers/genericPaginationHandler";
import {
    combineBaseUrlWithPath,
    formatHtmlToDiscordMarkdown
} from "@utils/stringUtils";
import {
    combineImagesIntroGridAndLayerIcons,
    layerIcons
} from "@utils/imageUtils";
import { getTranslation } from "@utils/localizationUtils";
import { ELocaleNamespace } from "@tps/enums/ELocaleNamespace";
import { Addon } from "@tps/addon";
import { Character } from "@tps/character";
import { Rarities } from "@data/Rarities";
import { ThemeColors } from "@constants/themeColors";
import { Role } from "@data/Role";
import { ERole } from "@tps/enums/ERole";

// region Command interaction
const ADDONS_PER_PAGE = 9;

export async function handleAddonListCommandInteraction(interaction: ChatInputCommandInteraction) {
    const locale = interaction.locale;

    try {
        await interaction.deferReply();

        const characterIndexString = interaction.options.getString('character');
        const characterData = await getCachedCharacters(locale);

        const filters = constructFilters(interaction, characterData, characterIndexString);
        const filterCount = Object.keys(filters).length;

        const addons = await getFilteredAddonsList(filters, locale);

        if (addons.length === 0) {
            const message = filterCount > 0
                ? getTranslation('list_command.addons_subcommand.addons_not_found_filters', locale, ELocaleNamespace.Errors)
                : getTranslation('list_command.addons_subcommand.addons_not_found', locale, ELocaleNamespace.Errors);
            await interaction.editReply({ content: message });
            return;
        }

        const { ParentItem, Rarity } = filters;

        const generateEmbed = async(pageItems: Addon[]) => {
            let title = `Found a total of ${addons.length} add-ons`;

            // Let user know that filters were applied
            if (filterCount > 0) title += ` (${getTranslation('list_command.addons_subcommand.filters_applied', locale, ELocaleNamespace.Messages)}: ${filterCount})`;

            let embedColor = ThemeColors.PRIMARY;
            if (Rarity) {
                embedColor = Rarities[Rarity].color;
            }

            const embed = new EmbedBuilder()
                .setTitle(title)
                .setDescription(`${getTranslation('list_command.addons_subcommand.more_info.0', locale, ELocaleNamespace.Messages)}: \`/${getTranslation('list_command.addons_subcommand.more_info.1', locale, ELocaleNamespace.Messages)}\``)
                .setColor(embedColor)
                .setTimestamp()
                .setAuthor({
                    name: getTranslation('list_command.addons_subcommand.addons_list', locale, ELocaleNamespace.Messages),
                    iconURL: combineBaseUrlWithPath('/images/UI/Icons/Help/iconHelp_addons.png')
                });

            pageItems.forEach(addon => {
                const description = formatHtmlToDiscordMarkdown(addon.Description);
                const formattedAndTruncatedDescription = description.length > 45 ? description.substring(0, 45) + '..' : description;

                embed.addFields({
                    name: addon.Name,
                    value: formattedAndTruncatedDescription,
                    inline: true
                });
            });

            return embed;
        };

        const generateImage = async(pageItems: Addon[]) => {
            const imageUrls: Record<string, string>[] = [];
            pageItems.forEach((addon: Addon) => {
                const rarity = addon.Rarity;
                const rarityData = Rarities[rarity];

                const addonBackgroundUrl = rarityData.itemsAddonsBackgroundPath;

                const model = {
                    [addonBackgroundUrl]: combineBaseUrlWithPath(addon.Image)
                };

                imageUrls.push(model);
            });

            return await combineImagesIntroGridAndLayerIcons(imageUrls);
        };

        const generateThumbnail = async(): Promise<{ attachment: Buffer | string; name: string } | null> => {
            if (ParentItem && ParentItem.length > 0 && characterIndexString) {
                const character = characterData[characterIndexString];
                if (character) {
                    const characterBackground = Role[character.Role as 'Killer' | 'Survivor'].charPortrait;
                    const characterPortrait = combineBaseUrlWithPath(character.IconFilePath);

                    const portraitBuffer = await layerIcons(characterBackground, characterPortrait) as Buffer;

                    return { attachment: portraitBuffer, name: "generated_thumbnail.png" };
                }
            }

            return null;
        };

        const paginationOptions: IPaginationOptions = {
            items: addons,
            itemsPerPage: ADDONS_PER_PAGE,
            generateEmbed,
            generateImage,
            interactionUserId: interaction.user.id,
            interactionReply: interaction,
            locale,
            generatedThumbnail: await generateThumbnail()
        };

        await genericPaginationHandler(paginationOptions);
    } catch (error) {
        console.error("Error executing cosmetics list subcommand:", error);
    }
}

// endregion


// region Utils
function constructFilters(
    interaction: ChatInputCommandInteraction,
    characterData: Record<string, Character>,
    characterIndexString: string | null
): Partial<Addon> {
    const parentItem = characterIndexString ? characterData[characterIndexString].ParentItem : null;
    const rarity = interaction.options.getString('rarity');
    const filters: Partial<Addon> = {};

    if (characterIndexString) filters.ParentItem = parentItem ? [parentItem] : undefined;
    if (rarity) filters.Rarity = rarity;

    return filters;
}

// endregion

// region Autocomplete
export async function handleAddonsListCommandAutocompleteInteraction(interaction: AutocompleteInteraction) {
    const locale = interaction.locale;
    const focusedValue = interaction.options.getFocused();
    const choices = await getCharacterChoices(focusedValue, locale, { Role: ERole.Killer });
    const options = choices.slice(0, 25).map(character => ({
        name: character.Name,
        value: character.CharacterIndex as string
    }));

    await interaction.respond(options);
}

// endregion