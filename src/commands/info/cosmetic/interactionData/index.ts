import {
    ActionRowBuilder,
    APIEmbedField,
    AttachmentBuilder,
    ButtonBuilder,
    ButtonInteraction,
    ButtonStyle,
    ChatInputCommandInteraction,
    ColorResolvable,
    EmbedBuilder,
    Locale
} from "discord.js";
import { getCosmeticDataById } from "@services/cosmeticService";
import { getCachedSpecialEvents } from "@services/specialEventService";
import { getCachedRifts } from "@services/riftService";
import {
    adjustForTimezone,
    combineBaseUrlWithPath,
    formatHtmlToDiscordMarkdown,
    formatInclusionVersion,
    formatNumber,
    isValidData
} from "@utils/stringUtils";
import { t } from "@utils/localizationUtils";
import { ELocaleNamespace } from "@tps/enums/ELocaleNamespace";
import { getCharacterDataByIndex } from "@services/characterService";
import {
    calculateDiscountedPrice,
    formatEmbedTitle,
    formatReleaseDate,
    getDiscountPercentage,
    hasLimitedAvailabilityEnded,
    isCosmeticLimited,
    isCosmeticOnSale
} from "@commands/info/cosmetic/utils";
import {
    IStoreCustomizationItem,
    layerIcons
} from "@utils/imageUtils";
import { Cosmetic } from "@tps/cosmetic";
import { Character } from "@tps/character";
import { Role } from "@data/Role";
import { Rarities } from "@data/Rarities";
import { Currencies } from "@data/Currencies";
import {
    createEmojiMarkdown,
    getApplicationEmoji
} from "@utils/emojiManager";
import { SpecialEvent } from "@tps/specialEvent";
import { Rift } from "@tps/rift";
import { CosmeticTypes } from "@data/CosmeticTypes";
import { sendErrorMessage } from "@handlers/errorResponseHandler";
import createStoreCustomizationIcons from "@utils/images/createStoreCustomizationIcons";


export default async function generateCosmeticInteractionData(
    cosmeticId: string,
    locale: Locale,
    interaction: ButtonInteraction | ChatInputCommandInteraction
) {
    const [cosmeticData, specialEventData, riftData] = await Promise.all([
        getCosmeticDataById(cosmeticId, locale),
        getCachedSpecialEvents(locale),
        getCachedRifts(locale)
    ]);

    if (!cosmeticData || !isValidData(specialEventData) || !isValidData(riftData)) {
        const message = `${t('info_command.cosmetic_subcommand.cosmetic_not_found', locale, ELocaleNamespace.Errors)} "${cosmeticId}".`;
        await sendErrorMessage(interaction, message);
        throw new Error(`Cosmetic data not found for ID "${cosmeticId}".`);
    }

    const [characterData, priceFields] = await Promise.all([
        getCharacterDataByIndex(cosmeticData.Character, locale),
        preparePriceFields(cosmeticData, locale)
    ]);

    const { isOnSale, adjustedDiscountEndDate } = isCosmeticOnSale(cosmeticData);

    const storeCustomizationItem = prepareStoreCustomizationItem(cosmeticData);
    const customizationItemBuffer = await createStoreCustomizationIcons([storeCustomizationItem]);

    const attachments = await prepareAttachments(customizationItemBuffer, cosmeticData, characterData);

    const embed = buildEmbed(cosmeticData, specialEventData, riftData, characterData, priceFields, isOnSale, adjustedDiscountEndDate, locale);

    const actionRow = buildActionRow(cosmeticData, locale);

    return { embed, attachments, actionRow };
}

async function prepareAttachments(
    customizationItemBuffer: Buffer[],
    cosmeticData: Cosmetic,
    characterData: Character | undefined
) {
    const attachments = [
        new AttachmentBuilder(customizationItemBuffer[0], { name: `cosmetic_${cosmeticData.CosmeticId}.png` })
    ];

    if (characterData) {
        const characterIcon = combineBaseUrlWithPath(characterData.IconFilePath);
        const characterBg = Role[characterData.Role as 'Killer' | 'Survivor'].charPortrait;
        const charPortrait = await layerIcons(characterBg, characterIcon) as Buffer;
        attachments.push(new AttachmentBuilder(charPortrait, { name: 'character_Icon.png' }));
    }

    return attachments
}

function prepareStoreCustomizationItem(cosmeticData: Cosmetic) {
    const cosmeticRarity = cosmeticData.Rarity;

    const storeCustomizationItem: IStoreCustomizationItem = {
        icon: combineBaseUrlWithPath(cosmeticData.IconFilePathList),
        text: cosmeticData.CosmeticName,
        includeText: false,
        background: Rarities[cosmeticRarity].storeCustomizationPath,
        prefix: cosmeticData.Prefix,
        isLinked: cosmeticData.Unbreakable,
        isLimited: isCosmeticLimited(cosmeticData),
        isOnSale: isCosmeticOnSale(cosmeticData).isOnSale,
        isKillSwitched: !!cosmeticData?.KillSwitched,
        color: Rarities[cosmeticRarity].color,
    };
    return storeCustomizationItem;
}

function buildActionRow(cosmeticData: Cosmetic, locale: Locale) {
    const outfitPieces = cosmeticData.OutfitItems || [];

    const viewImagesButton = new ButtonBuilder()
        .setCustomId(`view_outfit_pieces::${cosmeticData.CosmeticId}`)
        .setLabel(t('info_command.cosmetic_subcommand.view_pieces', locale, ELocaleNamespace.Messages))
        .setStyle(ButtonStyle.Secondary);

    let viewerCosmetics = [cosmeticData.CosmeticId];
    if (cosmeticData.Type === 'outfit') {
        viewerCosmetics = cosmeticData.OutfitItems;
    }
    const viewerCosmeticsParam = encodeURIComponent(JSON.stringify(viewerCosmetics));

    const view3dModelButton = new ButtonBuilder()
        .setLabel(t('info_command.cosmetic_subcommand.view_3d_model', locale, ELocaleNamespace.Messages))
        .setStyle(ButtonStyle.Link)
        .setURL(combineBaseUrlWithPath(`/store/3d-viewer?viewerCosmetics=${viewerCosmeticsParam}`));

    const redirectButton = new ButtonBuilder()
        .setLabel(t('info_command.cosmetic_subcommand.more_info', locale, ELocaleNamespace.Messages))
        .setStyle(ButtonStyle.Link)
        .setURL(combineBaseUrlWithPath(`/store/cosmetics?cosmeticId=${cosmeticData.CosmeticId}`));

    const actionRow = new ActionRowBuilder<ButtonBuilder>().addComponents(redirectButton);

    if ((cosmeticData.ModelDataPath && cosmeticData.ModelDataPath !== "None") || cosmeticData.Type === "outfit") {
        actionRow.addComponents(view3dModelButton);
    }

    if (outfitPieces.length > 0) {
        actionRow.addComponents(viewImagesButton);
    }

    return actionRow;
}

async function preparePriceFields(cosmeticData: any, locale: Locale) {
    const priceFields: APIEmbedField[] = [];
    if (cosmeticData.Prices && cosmeticData.Purchasable && !hasLimitedAvailabilityEnded(cosmeticData)) {
        for (const price of cosmeticData.Prices) {
            for (const currencyKey of Object.keys(price)) {
                const priceField = await createPriceField(price[currencyKey], currencyKey, cosmeticData, locale);
                if (priceField) priceFields.push(priceField);
            }
        }
    }
    return priceFields;
}

async function createPriceField(originalPrice: number, currencyKey: string, cosmeticData: any, locale: Locale) {
    const discountPercentage = getDiscountPercentage(currencyKey, cosmeticData);
    const discountedPrice = calculateDiscountedPrice(originalPrice, discountPercentage);
    const currencyData = Currencies[currencyKey];

    if (!currencyData) return null;

    let translationKey = currencyData.localizedName;
    const currencyEmoji = await getApplicationEmoji(currencyData.emojiId);
    const emojiMarkdown = createEmojiMarkdown(currencyEmoji!);

    const currencyFieldName = `${emojiMarkdown} ${t(translationKey, locale, ELocaleNamespace.General)}`;
    if (discountPercentage > 0) {
        return {
            name: currencyFieldName,
            value: `~~${formatNumber(originalPrice)}~~ ${formatNumber(discountedPrice)}`,
            inline: true
        };
    } else if (originalPrice !== 0) {
        return {
            name: currencyFieldName,
            value: `${formatNumber(originalPrice)}`,
            inline: true
        };
    }
    return null;
}

function buildEmbed(
    cosmeticData: Cosmetic,
    specialEventData: Record<string, SpecialEvent>,
    riftData: Record<string, Rift>,
    characterData: Character | undefined,
    priceFields: APIEmbedField[],
    isOnSale: boolean,
    adjustedDiscountEndDate: Date | undefined,
    locale: Locale
) {
    const embedTitle = formatEmbedTitle(cosmeticData.CosmeticName, cosmeticData.Unbreakable, locale);
    const embedColor: ColorResolvable = Rarities[cosmeticData.Rarity].color as ColorResolvable || Rarities['N/A'].color as ColorResolvable;

    const fields: APIEmbedField[] = prepareEmbedFields(cosmeticData, specialEventData, riftData, characterData, priceFields, isOnSale, adjustedDiscountEndDate, locale);

    const embed = new EmbedBuilder()
        .setColor(embedColor)
        .setTitle(embedTitle)
        .setDescription(formatHtmlToDiscordMarkdown(cosmeticData.Description))
        .addFields(fields)
        .setImage(`attachment://cosmetic_${cosmeticData.CosmeticId}.png`)
        .setTimestamp();

    const category = CosmeticTypes[cosmeticData.Category];
    if (category) {
        embed.setAuthor({
            name: t(category.localizedName, locale, ELocaleNamespace.General),
            iconURL: category.icon
        });
    }

    if (cosmeticData.Character !== -1) {
        embed.setThumbnail(`attachment://character_Icon.png`);
    }

    return embed;
}

function prepareEmbedFields(
    cosmeticData: Cosmetic,
    specialEventData: Record<string, SpecialEvent>,
    riftData: Record<string, Rift>,
    characterData: Character | undefined,
    priceFields: APIEmbedField[],
    isOnSale: boolean,
    adjustedDiscountEndDate: Date | undefined,
    locale: Locale
) {
    const fields: APIEmbedField[] = [];

    if (characterData) {
        fields.push({
            name: t('info_command.cosmetic_subcommand.character', locale, ELocaleNamespace.Messages),
            value: characterData.Name,
            inline: true
        });
    }

    if (cosmeticData.CollectionName) {
        fields.push({
            name: t('info_command.cosmetic_subcommand.collection', locale, ELocaleNamespace.Messages),
            value: cosmeticData.CollectionName,
            inline: true
        });
    }

    fields.push(
        {
            name: t('info_command.cosmetic_subcommand.rarity', locale, ELocaleNamespace.Messages),
            value: t(Rarities[cosmeticData.Rarity]?.localizedName, locale, ELocaleNamespace.General) || 'N/A',
            inline: true
        },
        {
            name: t('info_command.cosmetic_subcommand.inclusion_version', locale, ELocaleNamespace.Messages),
            value: formatInclusionVersion(cosmeticData.InclusionVersion, locale) || 'N/A',
            inline: true
        },
        ...priceFields
    );

    const isPurchasable = cosmeticData.Purchasable;

    if (isPurchasable) {
        fields.push({
            name: t('info_command.cosmetic_subcommand.release_date', locale, ELocaleNamespace.Messages),
            value: formatReleaseDate(cosmeticData.ReleaseDate),
            inline: true
        });
    }

    if (isPurchasable && !hasLimitedAvailabilityEnded(cosmeticData) && cosmeticData.LimitedTimeEndDate) {
        fields.push(
            {
                name: t('info_command.cosmetic_subcommand.limited_until', locale, ELocaleNamespace.Messages),
                value: `<t:${Math.floor(adjustForTimezone(cosmeticData.LimitedTimeEndDate) / 1000)}>`,
                inline: true
            }
        );
    }

    if (isOnSale && adjustedDiscountEndDate) {
        const adjustedDiscountEndDateUnix = Math.floor(adjustedDiscountEndDate?.getTime() / 1000);

        fields.push({
            name: t('info_command.cosmetic_subcommand.sale', locale, ELocaleNamespace.Messages),
            value: `<t:${adjustedDiscountEndDateUnix}>`,
            inline: true
        });
    }

    if (cosmeticData.EventId && specialEventData[cosmeticData.EventId]) {
        fields.push({
            name: t('info_command.cosmetic_subcommand.special_event', locale, ELocaleNamespace.Messages),
            value: specialEventData[cosmeticData.EventId].Name,
            inline: true
        });
    }

    if (cosmeticData.TomeId && riftData[cosmeticData.TomeId]) {
        fields.push({
            name: t('info_command.cosmetic_subcommand.released_with_tome', locale, ELocaleNamespace.Messages),
            value: riftData[cosmeticData.TomeId].Name,
            inline: true
        });
    }

    if (!!cosmeticData?.KillSwitched) {
        fields.push({
            name: t('info_command.cosmetic_subcommand.kill_switch', locale, ELocaleNamespace.Messages),
            value: t('info_command.cosmetic_subcommand.kill_switch_desc', locale, ELocaleNamespace.Messages),
            inline: false
        });
    }

    return fields;
}