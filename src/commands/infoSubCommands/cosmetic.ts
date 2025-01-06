import {
    ActionRowBuilder,
    APIEmbedField,
    AttachmentBuilder,
    AutocompleteInteraction,
    ButtonBuilder,
    ButtonInteraction,
    ButtonStyle,
    ChatInputCommandInteraction,
    ColorResolvable,
    EmbedBuilder,
    Locale,
    MessageFlags
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
    formatHtmlToDiscordMarkdown,
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
import { getCachedSpecialEvents } from "@services/specialEventService";
import { getCachedRifts } from "@services/riftService";
import { Currencies } from "@data/Currencies";
import {
    createEmojiMarkdown,
    getApplicationEmoji
} from "@utils/emojiManager";

// region Interaction Handlers
export async function handleCosmeticCommandInteraction(interaction: ChatInputCommandInteraction) {
    const cosmeticId = interaction.options.getString('name');
    const locale = interaction.locale;

    if (!cosmeticId) return;

    try {
        await interaction.deferReply();
        const {
            embed,
            attachments,
            actionRow
        } = await generateCosmeticInteractionData(cosmeticId, locale, interaction);
        await interaction.editReply({
            embeds: [embed],
            files: attachments,
            components: [actionRow]
        });
    } catch (error) {
        console.error("Error executing cosmetic subcommand:", error);
    }
}

export async function handleCosmeticButtonInteraction(interaction: ButtonInteraction, cosmeticId: string) {
    const locale = interaction.locale;

    try {
        const { embed, attachments } = await generateCosmeticInteractionData(cosmeticId, locale, interaction);
        await interaction.followUp({
            embeds: [embed],
            files: attachments,
            flags: MessageFlags.Ephemeral
        });
    } catch (error) {
        console.error("Error handling cosmetic button interaction:", error);
    }
}

// endregion

// region Interaction Data
async function generateCosmeticInteractionData(cosmeticId: string, locale: Locale, interaction: ButtonInteraction | ChatInputCommandInteraction) {
    const [cosmeticData, specialEventData, riftData] = await Promise.all([
        getCosmeticDataById(cosmeticId, locale),
        getCachedSpecialEvents(locale),
        getCachedRifts(locale)
    ]);
    if (!cosmeticData || !specialEventData || !riftData || Object.keys(specialEventData).length === 0 || Object.keys(riftData).length === 0) {
        await interaction.followUp(`${getTranslation('info_command.cosmetic_subcommand.cosmetic_not_found', locale, ELocaleNamespace.Errors)} "${cosmeticId}".`);
        throw new Error(`Cosmetic data not found for ID "${cosmeticId}".`);
    }

    const cosmeticRarity = cosmeticData.Rarity;
    const embedColor: ColorResolvable = Rarities[cosmeticRarity].color as ColorResolvable || Rarities['N/A'].color as ColorResolvable;
    const imageUrl = combineBaseUrlWithPath(cosmeticData.IconFilePathList);

    const isLinked = cosmeticData.Unbreakable;

    const isPastLimitedAvailabilityEndDate = hasLimitedAvailabilityEnded(cosmeticData);
    const { isOnSale, adjustedDiscountEndDate } = isCosmeticOnSale(cosmeticData);
    const storeCustomizationItem: IStoreCustomizationItem = {
        icon: imageUrl,
        background: Rarities[cosmeticRarity].storeCustomizationPath,
        prefix: cosmeticData.Prefix,
        isLinked,
        isLimited: isCosmeticLimited(cosmeticData),
        isOnSale: isOnSale
    };
    const customizationItemBuffer = await createStoreCustomizationIcons([storeCustomizationItem]);

    const attachments: AttachmentBuilder[] = [];
    attachments.push(new AttachmentBuilder(customizationItemBuffer[0], { name: `cosmetic_${cosmeticData.CosmeticId}.png` }));

    const isPurchasable = cosmeticData.Purchasable;

    const adjustedReleaseDateUnix = cosmeticData.ReleaseDate ? Math.floor(adjustForTimezone(cosmeticData.ReleaseDate) / 1000) : null;
    const formattedReleaseDate = adjustedReleaseDateUnix ? `<t:${adjustedReleaseDateUnix}>` : 'N/A';

    const outfitPieces: string[] = cosmeticData.OutfitItems || [];

    const priceFields: APIEmbedField[] = [];
    if (cosmeticData.Prices && isPurchasable && !isPastLimitedAvailabilityEndDate) {
        cosmeticData.Prices.forEach(price => {
            Object.keys(price).forEach(async currencyKey => {
                const originalPrice = price[currencyKey] ?? 0;
                const discountPercentage = getDiscountPercentage(currencyKey, cosmeticData);
                const discountedPrice = calculateDiscountedPrice(originalPrice, discountPercentage);

                const currencyData = Currencies[currencyKey];

                if (!currencyData) return;

                let translationKey = currencyData.localizedName;

                const currencyEmoji = await getApplicationEmoji(currencyData.emojiId);
                const emojiMarkdown = createEmojiMarkdown(currencyEmoji!);

                const currencyFieldName = `${emojiMarkdown} ${getTranslation(translationKey, locale, ELocaleNamespace.General)}`
                if (discountPercentage > 0) {
                    priceFields.push({
                        name: currencyFieldName,
                        value: `~~${formatNumber(originalPrice)}~~ ${formatNumber(discountedPrice)}`,
                        inline: true
                    });
                } else if (originalPrice !== 0) {
                    priceFields.push({
                        name: currencyFieldName,
                        value: `${formatNumber(originalPrice)}`,
                        inline: true
                    });
                }
            });
        });
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
        ...priceFields
    );

    if (isPurchasable) {
        fields.push(
            {
                name: getTranslation('info_command.cosmetic_subcommand.release_date', locale, ELocaleNamespace.Messages),
                value: isPurchasable ? formattedReleaseDate : 'N/A',
                inline: true
            }
        );
    }

    if (isPurchasable && !isPastLimitedAvailabilityEndDate && cosmeticData.LimitedTimeEndDate) {
        fields.push(
            {
                name: getTranslation('info_command.cosmetic_subcommand.limited_until', locale, ELocaleNamespace.Messages),
                value: `<t:${Math.floor(adjustForTimezone(cosmeticData.LimitedTimeEndDate) / 1000)}>`,
                inline: true
            }
        );
    }

    if (isOnSale && adjustedDiscountEndDate) {
        const adjustedDiscountEndDateUnix = Math.floor(adjustedDiscountEndDate?.getTime() / 1000);

        fields.push({
            name: getTranslation('info_command.cosmetic_subcommand.sale', locale, ELocaleNamespace.Messages),
            value: `<t:${adjustedDiscountEndDateUnix}>`,
            inline: true
        });
    }

    if (cosmeticData.EventId && specialEventData[cosmeticData.EventId]) {
        fields.push({
            name: getTranslation('info_command.cosmetic_subcommand.special_event', locale, ELocaleNamespace.Messages),
            value: specialEventData[cosmeticData.EventId].Name,
            inline: true
        });
    }

    if (cosmeticData.TomeId && riftData[cosmeticData.TomeId]) {
        fields.push({
            name: getTranslation('info_command.cosmetic_subcommand.released_with_tome', locale, ELocaleNamespace.Messages),
            value: riftData[cosmeticData.TomeId].Name,
            inline: true
        });
    }

    const filteredFields = fields.filter((field): field is APIEmbedField => field !== null);

    const embed = new EmbedBuilder()
        .setColor(embedColor)
        .setTitle(embedTitle)
        .setDescription(formatHtmlToDiscordMarkdown(cosmeticData.Description))
        .addFields(filteredFields)
        .setImage(`attachment://cosmetic_${cosmeticData.CosmeticId}.png`)
        .setTimestamp()
        .setFooter({ text: getTranslation('info_command.cosmetic_subcommand.cosmetic_info', locale, ELocaleNamespace.Messages) });

    const category = CosmeticTypes[cosmeticData.Category];
    if (category) {
        embed.setAuthor({
            name: getTranslation(category.localizedName, locale, ELocaleNamespace.General),
            iconURL: category.icon
        });
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
        .setURL(combineBaseUrlWithPath(`/store/3d-viewer?viewerCosmetics=${viewerCosmeticsParam}`));

    const redirectButton = new ButtonBuilder()
        .setLabel(getTranslation('info_command.cosmetic_subcommand.more_info', locale, ELocaleNamespace.Messages))
        .setStyle(ButtonStyle.Link)
        .setURL(cosmeticDetails);

    const actionRow = new ActionRowBuilder<ButtonBuilder>().addComponents(redirectButton);

    if ((cosmeticData.ModelDataPath && cosmeticData.ModelDataPath !== "None") || cosmeticData.Type === "outfit") {
        actionRow.addComponents(view3dModelButton);
    }

    if (outfitPieces.length > 0) {
        actionRow.addComponents(viewImagesButton);
    }

    return { embed, attachments, actionRow };
}

// endregion

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

    // Base discount only applies to Auric Cells
    return currencyId === "Cells" || tempDiscount
        ? tempDiscount?.discountPercentage ?? cosmeticData.DiscountPercentage
        : 0;
}

export function hasLimitedAvailabilityEnded(cosmetic: Cosmetic): boolean {
    // If LimitedTimeEndDate is null/undefined that means it was never in effect
    // therefore it has not ended, as it never started
    // Don't bother me about this. I don't understand this either
    if (!cosmetic.LimitedTimeEndDate) return false;
    return new Date() > new Date(adjustForTimezone(cosmetic.LimitedTimeEndDate));
}

// To be limited:
// 1. Cosmetic has to be purchasable
// 2. Cosmetic limited availability still needs to be in effect
// 3. Cosmetic LimitedTimeEndDate cannot be null/undefined, as that means it was never limited
export function isCosmeticLimited(cosmetic: Cosmetic) {
    return cosmetic.Purchasable && !hasLimitedAvailabilityEnded(cosmetic) && !!cosmetic.LimitedTimeEndDate;
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

/**
 * Generates store customization icons based on either an array of cosmetic IDs or an array of cosmetic objects.
 *
 * @param cosmeticItems - An array of cosmetic IDs (strings) or an array of cosmetic objects.
 * @param cosmeticData - A record containing all the cosmetic data indexed by cosmetic IDs.
 *
 * @returns A Promise that resolves to an array of Buffers representing the generated store customization icons.
 */
export async function generateStoreCustomizationIcons(cosmeticItems: (string[] | Cosmetic[]), cosmeticData?: Record<string, Cosmetic>): Promise<Buffer[]> {
    const imageSources: IStoreCustomizationItem[] = [];

    const isCosmeticIdsArray = Array.isArray(cosmeticItems) && typeof cosmeticItems[0] === 'string';

    let items: Cosmetic[] = [];
    if (isCosmeticIdsArray) {
        if (!cosmeticData) throw new Error('If passing an array of cosmetic IDs, you must provide cosmetic data. Alternatively, pass an array of Cosmetic objects directly.');

        items = (cosmeticItems as string[]).map(cosmeticId => cosmeticData[cosmeticId]);
    } else {
        items = cosmeticItems as Cosmetic[];
    }

    items.forEach((cosmetic: Cosmetic) => {
        const { isOnSale } = isCosmeticOnSale(cosmetic);

        const model: IStoreCustomizationItem = {
            icon: combineBaseUrlWithPath(cosmetic.IconFilePathList),
            background: Rarities[cosmetic.Rarity].storeCustomizationPath,
            prefix: cosmetic.Prefix,
            isLinked: cosmetic.Unbreakable,
            isLimited: isCosmeticLimited(cosmetic),
            isOnSale
        };

        imageSources.push(model);
    });

    return await createStoreCustomizationIcons(imageSources);
}

// endregion

// region Autocomplete
export async function handleCosmeticCommandAutocompleteInteraction(interaction: AutocompleteInteraction) {
    try {
        const locale = interaction.locale;
        const focusedValue = interaction.options.getFocused().toLowerCase();
        const choices = await getCosmeticChoicesFromIndex(focusedValue, locale);

        const options = choices.slice(0, 25).map(cosmetic => ({
            name: `${cosmetic.CosmeticName} (ID: ${cosmetic.CosmeticId})`, // We need to display IDs as names can repeat
            value: cosmetic.CosmeticId
        }));

        await interaction.respond(options);
    } catch (error) {
        console.error("Error handling autocomplete cosmetic interaction:", error);
    }
}

// endregion