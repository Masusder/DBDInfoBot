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
    getFilteredCosmeticsList
} from "@services/cosmeticService";
import {
    combineBaseUrlWithPath,
    formatHtmlToDiscordMarkdown
} from "@utils/stringUtils";
import { genericPaginationHandler } from "../../handlers/genericPaginationHandler";
import { getTranslation } from "@utils/localizationUtils";
import { Cosmetic } from "../../types";
import axios from "axios";
import {
    createCanvas,
    loadImage
} from "canvas";
import { Role } from "@data/Role";
import { Rarities } from "@data/Rarities";

const COSMETICS_PER_PAGE = 6;

// TODO: localize this
export async function handleCosmeticListCommandInteraction(interaction: ChatInputCommandInteraction) {
    const locale = interaction.locale;

    try {
        await interaction.deferReply();

        const filters = constructFilters(interaction);

        const { Character = -1, Rarity } = filters; // Deconstruct filters for use

        const cosmetics = await getFilteredCosmeticsList(filters, locale);

        if (cosmetics.length === 0) {
            await interaction.editReply({ content: 'No cosmetics found.' });
            return;
        }

        const generateEmbed = async(pageItems: Cosmetic[]) => {
            let title = `Found a total of ${cosmetics.length} cosmetics`;

            // Let user know that filters were applied
            const filterCount = Object.keys(filters).length;
            if (filterCount > 0) {
                title += ` (Filters applied: ${filterCount})`;
            }

            const embedColor = Rarity ? Rarities[Rarity].color : '#5865f2';

            const embed = new EmbedBuilder()
                .setTitle(title)
                .setColor(embedColor as ColorResolvable)
                .setFooter({ text: `List of cosmetics` })
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

            return await combineImages(imageUrls);
        };

        await genericPaginationHandler({
            items: cosmetics,
            itemsPerPage: COSMETICS_PER_PAGE,
            generateEmbed,
            generateImage,
            interactionUserId: interaction.user.id,
            interactionReply: await interaction.editReply({
                content: `For more information about a specific cosmetic, use the command: \`/info Cosmetic <cosmetic_name>\``
            }),
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
    const filters: Partial<Cosmetic> = {};

    if (characterIndexString) {
        filters.Character = parseInt(characterIndexString);
    }

    if (isLinked !== null) {
        filters.Unbreakable = isLinked;
    }

    if (isPurchasable !== null) {
        filters.Purchasable = isPurchasable;
    }

    if (rarity !== null) {
        filters.Rarity = rarity;
    }

    return filters;
}
async function combineImages(imageUrls: string[]): Promise<Buffer> {
    const imageBuffers: Buffer[] = await Promise.all(
        imageUrls.map(async(url) => {
            try {
                const response = await axios.get(url, { responseType: 'arraybuffer' });
                return Buffer.from(response.data);
            } catch (error) {
                console.error(`Error fetching image from ${url}:`, error);
                throw error;
            }
        })
    );

    const images = await Promise.all(imageBuffers.map((buffer) => loadImage(buffer)));

    const maxImagesPerRow = 3;
    const maxImagesPerColumn = 2;

    const maxWidth = Math.max(...images.map((img) => img.width));
    const maxHeight = Math.max(...images.map((img) => img.height));

    const totalWidth = maxWidth * maxImagesPerRow; // Total width for 3 columns
    const totalHeight = maxHeight * maxImagesPerColumn; // Total height for 2 rows

    const canvas = createCanvas(totalWidth, totalHeight);
    const ctx = canvas.getContext('2d');

    let currentX = 0;
    let currentY = 0;

    images.forEach((img, index) => {
        // If we have placed maxImagesPerRow images in a row, move to the next row
        if (index > 0 && index % maxImagesPerRow === 0) {
            currentX = 0;
            currentY += maxHeight;
        }

        ctx.drawImage(img, currentX, currentY);
        currentX += maxWidth;
    });

    return canvas.toBuffer('image/png');
}

// endregion

// region Autocomplete
export async function handleCosmeticListCommandAutocompleteInteraction(interaction: AutocompleteInteraction) {
    try {
        const locale = interaction.locale;
        const focusedValue = interaction.options.getFocused();
        const choices = await getCharacterChoices(focusedValue, locale);
        const options = choices.slice(0, 25).map(character => ({
            name: character.Name,
            value: character.CharacterIndex as string
        }));

        await interaction.respond(options);
    } catch (error) {
        console.error("Error handling cosmetic list autocomplete interaction:", error);
    }
}

// endregion