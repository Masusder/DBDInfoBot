import {
    AutocompleteInteraction,
    ChatInputCommandInteraction,
    EmbedBuilder
} from "discord.js";
import {
    getCharacterChoices,
    getCharacterDataByIndex
} from "@services/characterService";
import { getCosmeticListByCharacterIndex } from "@services/cosmeticService";
import {
    combineBaseUrlWithPath,
    formatInclusionVersion
} from "@utils/stringUtils";
import { CosmeticTypes } from "@data/CosmeticTypes";
import { genericPaginationHandler } from "../../handlers/genericPaginationHandler";
import { getTranslation } from "@utils/localizationUtils";
import { Cosmetic } from "../../types";
import axios from "axios";
import {
    createCanvas,
    loadImage
} from "canvas";
import { Role } from "@data/Role";

const COSMETICS_PER_PAGE = 6;

// TODO: localize this
export async function handleCosmeticListCommandInteraction(interaction: ChatInputCommandInteraction) {
    const characterIndexString = interaction.options.getString('character');
    const locale = interaction.locale;

    if (!characterIndexString) return;

    try {
        await interaction.deferReply();

        const characterIndex = parseInt(characterIndexString);

        const cosmetics = await getCosmeticListByCharacterIndex(characterIndex, locale);
        if (cosmetics.length === 0) {
            await interaction.editReply({ content: 'No cosmetics found for this character.' });
            return;
        }

        const characterData = await getCharacterDataByIndex(characterIndex, locale);

        if (!characterData) return;

        const generateEmbed = (pageItems: any[]) => {
            const roleColor = Role[characterData.Role as 'Killer' | 'Survivor'].hexColor;
            const embed = new EmbedBuilder()
                .setTitle(`Cosmetics for ${characterData.Name} (${cosmetics.length} Total)`)
                .setColor(roleColor)
                .setFooter({ text: `List of cosmetics` })
                .setTimestamp()
                .setThumbnail(combineBaseUrlWithPath(characterData.IconFilePath));

            pageItems.forEach(cosmetic => {
                const cosmeticDescription = cosmetic.Description.length > 45 ? cosmetic.Description.substring(0, 45) + '..' : cosmetic.Description;
                //const description = `${cosmeticDescription}\n\nInclusion Version - ${formatInclusionVersion(cosmetic.InclusionVersion, locale)}\nType - ${getTranslation(CosmeticTypes[cosmetic.Type], locale, 'general')}`;

                embed.addFields({
                    name: cosmetic.CosmeticName,
                    value: cosmeticDescription,
                    inline: true
                });
            });

            return embed;
        };

        const generateImage = async (pageItems: any[]) => {
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
            interactionReply: await interaction.editReply({ content: `For more information about a specific cosmetic, use the command: \`/info Cosmetic <cosmetic_name>\`` })
        });
    } catch (error) {
        console.error("Error executing cosmetics list subcommand:", error);
    }
}

// region Cosmetic List Utils
async function combineImages(imageUrls: string[]): Promise<Buffer> {
    const imageBuffers: Buffer[] = await Promise.all(
        imageUrls.map(async (url) => {
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
    let currentY = 0

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
        console.error("Error handling autocomplete interaction:", error);
    }
}

// endregion