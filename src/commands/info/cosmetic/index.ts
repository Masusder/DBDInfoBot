import { Rarities } from "@data/Rarities";
import { getCosmeticChoicesFromIndex, getCosmeticDataById } from "@services/cosmeticService";
import { getCachedRifts } from "@services/riftService";
import { getCachedSpecialEvents } from "@services/specialEventService";
import { getCharacterDataByIndex } from "@services/characterService";
import { getTranslation } from "@utils/localizationUtils";
import {
    adjustForTimezone,
    combineBaseUrlWithPath,
    formatHtmlToDiscordMarkdown,
    formatInclusionVersion,
    formatNumber
} from "@utils/stringUtils";
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
} from "discord.js";
import {
    calculateDiscountedPrice,
    formatEmbedTitle,
    getDiscountPercentage,
    hasLimitedAvailabilityEnded,
    isCosmeticLimited,
    isCosmeticOnSale
} from "./utils";
import {
    createStoreCustomizationIcons,
    IStoreCustomizationItem,
    layerIcons
} from "@utils/imageUtils";
import { Currencies } from "@data/Currencies";
import {
    createEmojiMarkdown,
    getApplicationEmoji
} from "@utils/emojiManager";
import { ELocaleNamespace } from "@tps/enums/ELocaleNamespace";
import { Role } from "@data/Role";
import { CosmeticTypes } from "@data/CosmeticTypes";

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
        const {
            embed,
            attachments
        } = await generateCosmeticInteractionData(cosmeticId, locale, interaction);
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