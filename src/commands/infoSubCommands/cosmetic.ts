import {
    ActionRowBuilder,
    APIEmbedField,
    AttachmentBuilder,
    AutocompleteInteraction,
    ButtonBuilder,
    ButtonStyle,
    ChatInputCommandInteraction,
    ColorResolvable,
    EmbedBuilder,
    Locale
} from 'discord.js';
import {
    getCosmeticChoicesFromIndex,
    getCosmeticDataById
} from "@services/cosmeticService";
import {
    CosmeticTypes,
    Rarities,
    Role
} from "data";
import {
    adjustForTimezone,
    combineBaseUrlWithPath,
    formatInclusionVersion,
    formatNumber
} from "@utils/stringUtils";
import {
    createStoreCustomizationIcons,
    IStoreCustomizationItem,
    layerIcons
} from "@utils/imageUtils";
import { getCharacterDataByIndex } from "@services/characterService";
import { getTranslation } from "@utils/localizationUtils";
import { Cosmetic } from "@tps/cosmetic";
import { ELocaleNamespace } from '@tps/enums/ELocaleNamespace';

export async function handleCosmeticCommandInteraction(interaction: ChatInputCommandInteraction) {
    const cosmeticId = interaction.options.getString('name');
    const locale = interaction.locale;

    if (!cosmeticId) return;

    try {
        await interaction.deferReply();

        const cosmeticData = await getCosmeticDataById(cosmeticId, locale);
        if (!cosmeticData) {
            await interaction.followUp(`${getTranslation('info_command.cosmetic_subcommand.cosmetic_not_found', locale, ELocaleNamespace.Errors)} "${cosmeticId}".`);
            return;
        }

        const cosmeticRarity = cosmeticData.Rarity;
        const embedColor: ColorResolvable = Rarities[cosmeticRarity].color as ColorResolvable || Rarities['N/A'].color as ColorResolvable;
        const imageUrl = combineBaseUrlWithPath(cosmeticData.IconFilePathList);

        const isLinked = cosmeticData.Unbreakable;

        const isPastLimitedAvaibilityEndDate = hasLimitedAvailabilityEnded(cosmeticData);
        const { isOnSale, adjustedDiscountEndDate } = isCosmeticOnSale(cosmeticData);
        const storeCustomizationItem: IStoreCustomizationItem = {
            icon: imageUrl,
            background: Rarities[cosmeticRarity].storeCustomizationPath,
            prefix: cosmeticData.Prefix,
            isLinked,
            isLimited: cosmeticData.Purchasable && !isPastLimitedAvaibilityEndDate && !!cosmeticData.LimitedTimeEndDate,
            isOnSale: isOnSale
        };
        const customizationItemBuffer = await createStoreCustomizationIcons(storeCustomizationItem) as Buffer;

        const attachments: AttachmentBuilder[] = [];
        attachments.push(new AttachmentBuilder(customizationItemBuffer, { name: `cosmetic_${cosmeticData.CosmeticId}.png` }));

        const isPurchasable = cosmeticData.Purchasable;

        const adjustedReleaseDateUnix = cosmeticData.ReleaseDate ? Math.floor(adjustForTimezone(cosmeticData.ReleaseDate) / 1000) : null;
        const formattedReleaseDate = adjustedReleaseDateUnix ? `<t:${adjustedReleaseDateUnix}>` : 'N/A';

        const outfitPieces: string[] = cosmeticData.OutfitItems || [];

        const priceFields: APIEmbedField[] = [];
        if (cosmeticData.Prices && isPurchasable && !isPastLimitedAvaibilityEndDate) {
            const cellsPrice = cosmeticData.Prices.find(price => price.Cells);
            const shardsPrice = cosmeticData.Prices.find(price => price.Shards);

            if (cellsPrice) {
                const originalCellsPrice = cellsPrice.Cells ?? 0;
                const discountPercentage = getDiscountPercentage("Cells", cosmeticData);
                const discountedCellsPrice = calculateDiscountedPrice(originalCellsPrice, discountPercentage);

                if (discountPercentage > 0) {
                    priceFields.push({
                        name: getTranslation('currencies.auric_cells', locale, ELocaleNamespace.General),
                        value: `~~${originalCellsPrice}~~ ${discountedCellsPrice}`,
                        inline: true
                    });
                } else if (originalCellsPrice !== 0) {
                    priceFields.push({
                        name: getTranslation('currencies.auric_cells', locale, ELocaleNamespace.General),
                        value: `${originalCellsPrice}`,
                        inline: true
                    });
                }
            }

            if (shardsPrice) {
                const originalShardsPrice = shardsPrice.Shards ?? 0;
                const discountPercentage = getDiscountPercentage("Shards", cosmeticData);
                const discountedShardsPrice = calculateDiscountedPrice(originalShardsPrice, discountPercentage);

                if (discountPercentage > 0) {
                    priceFields.push({
                        name: getTranslation('currencies.shards', locale, ELocaleNamespace.General),
                        value: `~~${formatNumber(originalShardsPrice)}~~ ${formatNumber(discountedShardsPrice)}`,
                        inline: true
                    });
                } else if (originalShardsPrice !== 0) {
                    priceFields.push({
                        name: getTranslation('currencies.shards', locale, ELocaleNamespace.General),
                        value: `${formatNumber(originalShardsPrice)}`,
                        inline: true
                    });
                }
            }
        }

        const embedTitle = formatEmbedTitle(cosmeticData.CosmeticName, isLinked, locale);

        const characterData = await getCharacterDataByIndex(cosmeticData.Character, locale);

        const cosmeticDetails = combineBaseUrlWithPath(`/store/cosmetics?cosmeticId=${cosmeticData.CosmeticId}`);

        const fields: APIEmbedField[] = [];
        if (characterData) {
            fields.push({
                name: getTranslation('info_command.cosmetic_subcommand.character', locale, ELocaleNamespace.Messages),
                value: characterData.Name,
                inline: true
            });

            const characterIcon = combineBaseUrlWithPath(characterData.IconFilePath);
            const characterBg = Role[characterData.Role as 'Killer' | 'Survivor'].charPortrait;
            const charPortrait = await layerIcons(characterBg, characterIcon) as Buffer;
            attachments.push(new AttachmentBuilder(charPortrait, { name: 'character_Icon.png' }));
        }

        if (cosmeticData.CollectionName) {
            fields.push({
                name: getTranslation('info_command.cosmetic_subcommand.collection', locale, ELocaleNamespace.Messages),
                value: cosmeticData.CollectionName,
                inline: true
            });
        }

        fields.push(
            {
                name: getTranslation('info_command.cosmetic_subcommand.rarity', locale, ELocaleNamespace.Messages),
                value: getTranslation(Rarities[cosmeticData.Rarity]?.localizedName, locale, ELocaleNamespace.General) || 'N/A',
                inline: true
            },
            {
                name: getTranslation('info_command.cosmetic_subcommand.inclusion_version', locale, ELocaleNamespace.Messages),
                value: formatInclusionVersion(cosmeticData.InclusionVersion, locale) || 'N/A',
                inline: true
            },
            {
                name: getTranslation('info_command.cosmetic_subcommand.release_date', locale, ELocaleNamespace.Messages),
                value: isPurchasable ? formattedReleaseDate : 'N/A',
                inline: true
            },
            ...priceFields
        );

        if (isPurchasable && !isPastLimitedAvaibilityEndDate && cosmeticData.LimitedTimeEndDate) {
            fields.push(
                {
                    name: getTranslation('info_command.cosmetic_subcommand.limited_until', locale, ELocaleNamespace.Messages),
                    value: `<t:${Math.floor(adjustForTimezone(cosmeticData.LimitedTimeEndDate) / 1000)}>`,
                    inline: true
                }
            )
        }

        if (isOnSale && adjustedDiscountEndDate) {
                const adjustedDiscountEndDateUnix = Math.floor(adjustedDiscountEndDate?.getTime() / 1000);

                fields.push({
                    name: getTranslation('info_command.cosmetic_subcommand.sale', locale, ELocaleNamespace.Messages),
                    value: `<t:${adjustedDiscountEndDateUnix}>`,
                    inline: true
                });

        }

        const filteredFields = fields.filter((field): field is APIEmbedField => field !== null);

        const embed = new EmbedBuilder()
            .setColor(embedColor)
            .setTitle(embedTitle)
            .setDescription(cosmeticData.Description)
            .addFields(filteredFields)
            .setImage(`attachment://cosmetic_${cosmeticData.CosmeticId}.png`)
            .setTimestamp()
            .setFooter({ text: getTranslation('info_command.cosmetic_subcommand.cosmetic_info', locale, ELocaleNamespace.Messages) });

        const category = CosmeticTypes[cosmeticData.Category];
        if (category) {
            embed.setAuthor({
                name: getTranslation(category.localizedName, locale, ELocaleNamespace.General),
                iconURL: category.icon
            })
        }

        if (cosmeticData.Character !== -1) {
            embed.setThumbnail(`attachment://character_Icon.png`);
        }

        const viewImagesButton = new ButtonBuilder()
            .setCustomId(`view_outfit_pieces::${cosmeticData.CosmeticId}`)
            .setLabel(getTranslation('info_command.cosmetic_subcommand.view_pieces', locale, ELocaleNamespace.Messages))
            .setStyle(ButtonStyle.Secondary);

        let viewerCosmetics = [cosmeticId];
        if (cosmeticData.Type === 'outfit') {
            viewerCosmetics = cosmeticData.OutfitItems;
        }
        const viewerCosmeticsParam = encodeURIComponent(JSON.stringify(viewerCosmetics));

        const view3dModelButton = new ButtonBuilder()
            .setLabel(getTranslation('info_command.cosmetic_subcommand.view_3d_model', locale, ELocaleNamespace.Messages))
            .setStyle(ButtonStyle.Link)
            .setURL(combineBaseUrlWithPath(`/store/3d-viewer?viewerCosmetics=${viewerCosmeticsParam}`))

        const redirectButton = new ButtonBuilder()
            .setLabel(getTranslation('info_command.cosmetic_subcommand.more_info', locale, ELocaleNamespace.Messages))
            .setStyle(ButtonStyle.Link)
            .setURL(cosmeticDetails);

        const actionRow = new ActionRowBuilder<ButtonBuilder>().addComponents(redirectButton);

        if ((cosmeticData.ModelDataPath && cosmeticData.ModelDataPath !== "None") || cosmeticData.Type === "outfit") {
            actionRow.addComponents(view3dModelButton)
        }

        if (outfitPieces.length > 0) {
            actionRow.addComponents(viewImagesButton);
        }

        await interaction.editReply({
            embeds: [embed],
            files: attachments,
            components: [actionRow]
        });
    } catch (error) {
        console.error("Error executing cosmetic subcommand:", error);
    }
}

// region Cosmetic Utils
function formatEmbedTitle(cosmeticName: string, isUnbreakable: boolean, locale: Locale): string {
    if (isUnbreakable) {
        return `${cosmeticName.trim()} (${getTranslation('info_command.cosmetic_subcommand.linked_cosmetic', locale, ELocaleNamespace.Messages)})`;
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

export function hasLimitedAvailabilityEnded(cosmetic: Cosmetic): boolean {
    // If LimitedTimeEndDate is null/undefined that means it was never in effect
    // therefore it has not ended, as it never started
    // Don't bother me about this. I don't understand this either
    if (!cosmetic.LimitedTimeEndDate) return false;
    return new Date() > new Date(adjustForTimezone(cosmetic.LimitedTimeEndDate));
}

export function isCosmeticOnSale(cosmetic: Cosmetic): { isOnSale: boolean; adjustedDiscountEndDate?: Date } {
    if (!cosmetic.Purchasable && !hasLimitedAvailabilityEnded(cosmetic)) return { isOnSale: false };

    const temporaryDiscounts = cosmetic.TemporaryDiscounts;
    if (!temporaryDiscounts || temporaryDiscounts.length === 0) return { isOnSale: false };

    const discountEndDate = temporaryDiscounts[0].endDate;
    const adjustedDiscountEndDateNumber = adjustForTimezone(discountEndDate);
    const adjustedDiscountEndDate = new Date(adjustedDiscountEndDateNumber);

    if (adjustedDiscountEndDate > new Date()) {
        return { isOnSale: true, adjustedDiscountEndDate: adjustedDiscountEndDate };
    }

    return { isOnSale: false };
}

// endregion

// region Autocomplete
export async function handleCosmeticCommandAutocompleteInteraction(interaction: AutocompleteInteraction) {
    try {
        const locale = interaction.locale;
        const focusedValue = interaction.options.getFocused().toLowerCase();
        const choices = await getCosmeticChoicesFromIndex(focusedValue, locale);

        const options = choices.slice(0, 25).map(cosmetic => ({
            name: `${cosmetic.CosmeticName} (ID: ${cosmetic.CosmeticId})`,
            value: cosmetic.CosmeticId
        }));

        await interaction.respond(options);
    } catch (error) {
        console.error("Error handling autocomplete cosmetic interaction:", error);
    }
}

// endregion