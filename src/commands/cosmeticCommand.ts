import {
    ActionRowBuilder,
    AttachmentBuilder,
    AutocompleteInteraction,
    ButtonBuilder,
    ButtonStyle,
    ChatInputCommandInteraction,
    ColorResolvable,
    EmbedBuilder,
    Locale,
    SlashCommandBuilder,
    APIEmbedField
} from 'discord.js';
import {
    getCosmeticDataByName,
    getCosmeticDataById,
    getCosmeticChoicesFromIndex
} from '@services/cosmeticService';
import { getCachedCharacters } from "@services/characterService";
import {
    combineBaseUrlWithPath,
    formatInclusionVersion
} from "@utils/stringUtils";
import {
    createCanvas,
    loadImage
} from "canvas";
import {
    CosmeticTypes,
    Rarities
} from "../data";
import { Cosmetic } from "../types";
import debounceAsync from "../utils/debounce";
import axios from "axios";
import { getTranslation } from "@utils/localizationUtils";
import { fetchAndResizeImage } from "@utils/imageUtils";


export const data = new SlashCommandBuilder()
    .setName('cosmetic')
    .setDescription('Search for a cosmetic by name.')
    .setNameLocalization('en-US', 'cosmetic')
    .setDescriptionLocalization('en-US', 'Search for a cosmetic by name.')
    .setNameLocalization('pl', 'kosmetyk')
    .setDescriptionLocalization('pl', 'Wyszukaj kosmetyku po jego nazwie.')
    .setNameLocalization('fr', 'cosmétique')
    .setDescriptionLocalization('fr', 'Rechercher un cosmétique par nom.')
    .setNameLocalization('es-ES', 'cosmético')
    .setDescriptionLocalization('es-ES', 'Buscar un cosmético por nombre.')
    .addStringOption(option =>
        option
            .setName('name')
            .setDescription('Name of the cosmetic')
            .setAutocomplete(true)
            .setRequired(true)
    );

export async function execute(interaction: ChatInputCommandInteraction) {
    const cosmeticName = interaction.options.getString('name');
    const locale = interaction.locale;

    if (!cosmeticName) return;

    try {
        await interaction.deferReply();

        const cosmeticData = await getCosmeticDataByName(cosmeticName, locale);
        if (cosmeticData) {
            const cosmeticRarity = cosmeticData.Rarity;
            const embedColor: ColorResolvable = Rarities[cosmeticRarity].color as ColorResolvable || Rarities['N/A'].color as ColorResolvable;
            const imageUrl = combineBaseUrlWithPath(cosmeticData.IconFilePathList);
            const resizedImageBuffer = await fetchAndResizeImage(imageUrl, 256, null);

            const attachment = new AttachmentBuilder(resizedImageBuffer, { name: 'resized-image.png' });

            const isPurchasable = cosmeticData.Purchasable;

            const releaseDate = cosmeticData.ReleaseDate ? new Date(cosmeticData.ReleaseDate) : null;
            const formattedReleaseDate = releaseDate ? releaseDate.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            }) : 'N/A';

            const prettyCosmeticType = CosmeticTypes[cosmeticData.Type] || "Unknown";

            const outfitPieces: string[] = cosmeticData.OutfitItems || [];

            const priceFields: { name: string; value: string, inline: boolean }[] = [];
            if (cosmeticData.Prices && isPurchasable) {
                const cellsPrice = cosmeticData.Prices.find(price => price.Cells);
                const shardsPrice = cosmeticData.Prices.find(price => price.Shards);

                if (cellsPrice) {
                    const originalCellsPrice = cellsPrice.Cells ?? 0;
                    const discountPercentage = getDiscountPercentage("Cells", cosmeticData);
                    const discountedCellsPrice = calculateDiscountedPrice(originalCellsPrice, discountPercentage);

                    if (discountPercentage > 0) {
                        priceFields.push({
                            name: 'Auric Cells',
                            value: `~~${originalCellsPrice}~~ ${discountedCellsPrice}`,
                            inline: true
                        });
                    } else if (originalCellsPrice !== 0) {
                        priceFields.push({ name: 'Auric Cells', value: `${originalCellsPrice}`, inline: true });
                    }
                }

                if (shardsPrice) {
                    const originalShardsPrice = shardsPrice.Shards ?? 0;
                    const discountPercentage = getDiscountPercentage("Shards", cosmeticData);
                    const discountedShardsPrice = calculateDiscountedPrice(originalShardsPrice, discountPercentage);

                    if (discountPercentage > 0) {
                        priceFields.push({
                            name: 'Shards',
                            value: `~~${originalShardsPrice}~~ ${discountedShardsPrice}`,
                            inline: true
                        });
                    } else if (originalShardsPrice !== 0) {
                        priceFields.push({ name: 'Shards', value: `${originalShardsPrice}`, inline: true });
                    }
                }
            }

            const embedTitle = formatEmbedTitle(cosmeticData.CosmeticName, cosmeticData.Unbreakable);

            const characterData = await getCachedCharacters(locale);
            const characterIndex = cosmeticData.Character;

            const cosmeticDetails = '[Click Here](' + combineBaseUrlWithPath(`/store/cosmetics?cosmeticId=${cosmeticData.CosmeticId}`) + ')';

            const fields = [
                characterIndex !== -1 ? {
                    name: 'Character',
                    value: characterData[characterIndex].Name,
                    inline: true
                } : null,
                cosmeticData.CollectionName ? {
                    name: 'Collection',
                    value: cosmeticData.CollectionName,
                    inline: true
                } : null,
                { name: 'Rarity', value: getTranslation(Rarities[cosmeticData.Rarity]?.localizedName, locale, 'general') || 'N/A', inline: true },
                {
                    name: 'Inclusion Version',
                    value: formatInclusionVersion(cosmeticData.InclusionVersion) || 'N/A',
                    inline: true
                },
                { name: 'Type', value: prettyCosmeticType, inline: true },
                { name: 'Release Date', value: isPurchasable ? formattedReleaseDate : 'N/A', inline: true },
                ...priceFields,
                { name: 'More Info', value: cosmeticDetails }
            ];

            const filteredFields = fields.filter((field): field is APIEmbedField => field !== null);

            const embed = new EmbedBuilder()
                .setColor(embedColor)
                .setTitle(embedTitle)
                .setDescription(cosmeticData.Description)
                .addFields(filteredFields)
                .setImage('attachment://resized-image.png')
                .setTimestamp()
                .setFooter({ text: 'Cosmetic Information' });

            const viewImagesButton = new ButtonBuilder()
                .setCustomId(`view_outfit_pieces::${cosmeticData.CosmeticId}`)
                .setLabel('View Outfit Pieces')
                .setStyle(ButtonStyle.Secondary)
                .setDisabled(outfitPieces.length === 0);

            const actionRow = new ActionRowBuilder<ButtonBuilder>().addComponents(viewImagesButton);

            await interaction.editReply({
                embeds: [embed],
                files: [attachment],
                components: outfitPieces.length > 0 ? [actionRow] : []
            });
        } else {
            await interaction.followUp(`No cosmetic found for "${cosmeticName}".`);
        }
    } catch (error) {
        console.error("Error executing cosmetic command:", error);
    }
}

// region Cosmetic Utils
function formatEmbedTitle(cosmeticName: string, isUnbreakable: boolean): string {
    if (isUnbreakable) {
        return `${cosmeticName.trim()} (Linked Cosmetic)`;
    }

    return cosmeticName;
}

// Calculate the discounted price
function calculateDiscountedPrice(baseCurrency: number, discountPercentage: number): number {
    return Math.round(baseCurrency - (baseCurrency * discountPercentage));
}

function getDiscountPercentage(currencyId: string, cosmeticData: Cosmetic): number {
    const currentDate = new Date();
    const activeTemporaryDiscounts = cosmeticData.TemporaryDiscounts?.filter(discount => {
        const startDate = new Date(discount.startDate);
        const endDate = new Date(discount.endDate);
        return currentDate >= startDate && currentDate <= endDate; // Active if within the date range
    }) || [];

    const tempDiscount = activeTemporaryDiscounts.find(discount => discount.currencyId === currencyId);

    if (currencyId === "Shards") {
        return tempDiscount ? tempDiscount.discountPercentage : 0; // No base discount for Shards
    }

    return tempDiscount ? tempDiscount.discountPercentage : cosmeticData.DiscountPercentage;
}

export async function getCosmeticPiecesCombinedImage(cosmeticPieces: string[]) {
    const urls: string[] = [];
    for (const cosmeticPieceId of cosmeticPieces) {
        const cosmeticPieceData = await getCosmeticDataById(cosmeticPieceId, Locale.EnglishUS);

        if (cosmeticPieceData) {
            urls.push(combineBaseUrlWithPath(cosmeticPieceData.IconFilePathList));
        }
    }

    return urls;
}

export async function combineImages(imageUrls: string[]): Promise<Buffer> {
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

    const images = await Promise.all(imageBuffers.map(buffer => loadImage(buffer)));

    const totalWidth = images.reduce((sum, img) => sum + img.width, 0);
    const maxHeight = Math.max(...images.map(img => img.height));

    const canvas = createCanvas(totalWidth, maxHeight);
    const ctx = canvas.getContext('2d');

    let currentX = 0;
    for (const img of images) {
        ctx.drawImage(img, currentX, 0);
        currentX += img.width;
    }

    return canvas.toBuffer('image/png');
}

// endregion

// region Autocomplete
async function autocomplete(interaction: AutocompleteInteraction) {
    try {
        const locale = interaction.locale;
        const focusedValue = interaction.options.getFocused().toLowerCase();
        const choices = await getCosmeticChoicesFromIndex(focusedValue, locale);

        const options = choices.slice(0, 25).map(cosmetic => ({
            name: cosmetic.CosmeticName,
            value: cosmetic.CosmeticName
        }));

        await interaction.respond(options);
    } catch (error) {
        console.error("Error handling autocomplete interaction:", error);
    }
}

export async function debouncedAutocomplete(interaction: AutocompleteInteraction) {
    const debounced = debounceAsync(autocomplete, 300);
    return debounced(interaction);
}

// endregion