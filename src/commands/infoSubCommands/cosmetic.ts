import {
    ActionRowBuilder,
    APIEmbedField,
    AttachmentBuilder,
    AutocompleteInteraction,
    ButtonBuilder,
    ButtonStyle,
    ChatInputCommandInteraction,
    ColorResolvable,
    EmbedBuilder
} from 'discord.js';
import {
    getCosmeticChoicesFromIndex,
    getCosmeticDataByName
} from "@services/cosmeticService";
import { Rarities } from "@data/Rarities";
import {
    combineBaseUrlWithPath,
    formatInclusionVersion
} from "@utils/stringUtils";
import { fetchAndResizeImage } from "@utils/imageUtils";
import { CosmeticTypes } from "@data/CosmeticTypes";
import { getCachedCharacters } from "@services/characterService";
import { getTranslation } from "@utils/localizationUtils";
import { Cosmetic } from "../../types";

// TODO: localize this
export async function handleCosmeticCommandInteraction(interaction: ChatInputCommandInteraction) {
    const cosmeticName = interaction.options.getString('name');
    const locale = interaction.locale;

    if (!cosmeticName) return;

    try {
        await interaction.deferReply();

        const cosmeticData = await getCosmeticDataByName(cosmeticName, locale);
        if (!cosmeticData) {
            await interaction.followUp(`No cosmetic found for "${cosmeticName}".`);
            return;
        }

        const cosmeticRarity = cosmeticData.Rarity;
        const embedColor: ColorResolvable = Rarities[cosmeticRarity].color as ColorResolvable || Rarities['N/A'].color as ColorResolvable;
        const imageUrl = combineBaseUrlWithPath(cosmeticData.IconFilePathList);
        const resizedImageBuffer = await fetchAndResizeImage(imageUrl, 256, null);

        const attachment = new AttachmentBuilder(resizedImageBuffer, { name: 'resized-image.png' });

        const isPurchasable = cosmeticData.Purchasable;

        const releaseDate = cosmeticData.ReleaseDate ? new Date(cosmeticData.ReleaseDate) : null;
        const formattedReleaseDate = releaseDate ? releaseDate.toLocaleDateString(locale, {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        }) : 'N/A';

        const prettyCosmeticType = CosmeticTypes[cosmeticData.Type] || "Unknown";

        const outfitPieces: string[] = cosmeticData.OutfitItems || [];

        // TODO: add limited availability check
        const priceFields: APIEmbedField[] = [];
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

        const cosmeticDetails = combineBaseUrlWithPath(`/store/cosmetics?cosmeticId=${cosmeticData.CosmeticId}`);

        const fields: APIEmbedField[] = [];
        if (characterIndex !== -1) {
            fields.push({
                name: 'Character',
                value: characterData[characterIndex].Name,
                inline: true
            });
        }

        if (cosmeticData.CollectionName) {
            fields.push({
                name: 'Collection',
                value: cosmeticData.CollectionName,
                inline: true
            });
        }

        fields.push(
            {
                name: 'Rarity',
                value: getTranslation(Rarities[cosmeticData.Rarity]?.localizedName, locale, 'general') || 'N/A',
                inline: true
            },
            {
                name: 'Inclusion Version',
                value: formatInclusionVersion(cosmeticData.InclusionVersion) || 'N/A',
                inline: true
            },
            { name: 'Type', value: prettyCosmeticType, inline: true },
            { name: 'Release Date', value: isPurchasable ? formattedReleaseDate : 'N/A', inline: true },
            ...priceFields
        );

        const filteredFields = fields.filter((field): field is APIEmbedField => field !== null);

        const embed = new EmbedBuilder()
            .setColor(embedColor)
            .setTitle(embedTitle)
            .setDescription(cosmeticData.Description)
            .addFields(filteredFields)
            .setImage('attachment://resized-image.png')
            .setTimestamp()
            .setFooter({ text: 'Cosmetic Information' })
            .setThumbnail(cosmeticData.Unbreakable ? combineBaseUrlWithPath('/images/Other/CosmeticSetIcon.png') : '');

        const viewImagesButton = new ButtonBuilder()
            .setCustomId(`view_outfit_pieces::${cosmeticData.CosmeticId}`)
            .setLabel('View Outfit Pieces')
            .setStyle(ButtonStyle.Secondary);

        const redirectButton = new ButtonBuilder()
            .setLabel('More Info')
            .setStyle(ButtonStyle.Link)
            .setURL(cosmeticDetails);

        const actionRow = new ActionRowBuilder<ButtonBuilder>().addComponents(redirectButton);

        if (outfitPieces.length > 0) {
            actionRow.addComponents(viewImagesButton);
        }

        await interaction.editReply({
            embeds: [embed],
            files: [attachment],
            components: outfitPieces.length > 0 ? [actionRow] : []
        });

    } catch (error) {
        console.error("Error executing cosmetic subcommand:", error);
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

// endregion

// region Autocomplete
export async function handleCosmeticCommandAutocompleteInteraction(interaction: AutocompleteInteraction) {
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
        console.error("Error handling autocomplete cosmetic interaction:", error);
    }
}

// endregion