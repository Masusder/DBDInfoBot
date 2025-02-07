import {
    AttachmentBuilder,
    EmbedBuilder,
    Locale,
} from "discord.js";
import {
    adjustForTimezone,
    checkExistingImageUrl,
    combineBaseUrlWithPath,
} from "@utils/stringUtils";
import { Bundle } from "@tps/bundle";
import { Cosmetic } from "@tps/cosmetic";
import { ThemeColors } from "@constants/themeColors";
import { generateStoreCustomizationIcons } from "@commands/info/cosmetic/utils";
import { combineImagesIntoGrid } from "@utils/imageUtils";
import { getCharacterIndexById } from "@services/characterService";
import generateCharacterIcons from "@utils/images/characterIcon";
import {
    determineDominantRarity,
    fetchImageBuffer,
    getCurrencyField,
    prepareBundleContentDescription,
} from "@commands/info/bundle/utils";
import { Rarities } from "@data/Rarities";
import {
    Currencies,
    IRiftCurrency
} from "@data/Currencies";
import { generateCurrencyImage } from "@utils/images/currencyImage";
import { t } from "@utils/localizationUtils";
import { ELocaleNamespace } from "@tps/enums/ELocaleNamespace";

export async function generateBundleInteractionData(
    bundle: Bundle,
    cosmeticData: Record<string, Cosmetic>,
    locale: Locale
) {
    const embed = await buildBundleContentEmbed(bundle, cosmeticData, locale);
    const attachments = await prepareAttachments(bundle, cosmeticData, locale);

    return { embed, attachments };
}

async function buildBundleContentEmbed(bundle: Bundle, cosmeticData: Record<string, Cosmetic>, locale: Locale) {
    const title = t('info_command.bundle_subcommand.special_pack_title', locale, ELocaleNamespace.Messages, {
        special_pack_title: bundle.SpecialPackTitle,
        rewards_count: bundle.ConsumptionRewards.length.toString()
    });

    const description = await prepareBundleContentDescription(bundle, locale);

    const embed = new EmbedBuilder()
        .setColor(ThemeColors.PRIMARY)
        .setTitle(title)
        .setImage(`attachment://bundle_${bundle.Id}.png`)
        .setFooter({
            text: t('info_command.bundle_subcommand.unowned_items', locale, ELocaleNamespace.Messages, {
                unowned_items: bundle.MinNumberOfUnownedForPurchase.toString()
            })
        })
        .setDescription(description);

    if (bundle.StartDate) {
        embed.setTimestamp(new Date(adjustForTimezone(bundle.StartDate)));
    }

    await Promise.all([
        setEmbedImage(bundle, embed, true),
        setEmbedFields(bundle, embed, locale)
    ]);

    let cosmeticIds: string[] = [];
    for (const consumption of bundle.ConsumptionRewards) {
        const id = consumption.Id;
        if (consumption.GameSpecificData.Type === "Customization" && cosmeticData[id]) {
            cosmeticIds.push(id);
        }
    }

    const dominantRarity = determineDominantRarity(cosmeticIds, cosmeticData);
    if (dominantRarity) {
        embed.setColor(Rarities[dominantRarity].color);
    }

    return embed;
}

async function setEmbedImage(bundle: Bundle, embed: EmbedBuilder, isThumbnail: boolean = false) {
    const imageComposition = bundle.ImageComposition;
    if ((bundle.ImagePath || bundle.Uri) && !imageComposition?.OverrideDefaults) {
        const packagedImageUrl = bundle.ImagePath ? combineBaseUrlWithPath(bundle.ImagePath) : null;
        const image = await checkExistingImageUrl(packagedImageUrl, bundle.Uri);

        if (image) {
            isThumbnail ? embed.setThumbnail(image) : embed.setImage(image);
        }
    }
}

async function setEmbedFields(bundle: Bundle, embed: EmbedBuilder, locale: Locale) {
    if (bundle.Purchasable) {
        for (let fullPrice of bundle.FullPrice) {
            const currencyField = await getCurrencyField(fullPrice.CurrencyId, bundle, fullPrice, locale);

            if (currencyField) {
                embed.addFields({ name: currencyField.title, value: currencyField.value, inline: true });
            }
        }
    }
}

async function prepareAttachments(
    bundle: Bundle,
    cosmeticData: Record<string, Cosmetic>,
    locale: Locale
) {
    let characterIndexes: string[] = [];
    let riftPassIconBuffer: Buffer | null = null;
    let currencies: IRiftCurrency[] = [];
    const cosmeticIdsSet = new Set<string>();
    for (const consumption of bundle.ConsumptionRewards) {
        const id = consumption.Id;
        if (consumption.GameSpecificData.Type === "Customization" && cosmeticData[id]) {
            cosmeticIdsSet.add(consumption.Id);
        }

        if (consumption.GameSpecificData.Type === "Character") {
            const characterIndex = await getCharacterIndexById(id, locale);

            if (characterIndex !== undefined) {
                characterIndexes.push(characterIndex);
            }
        }

        if (consumption.GameSpecificData.Type === "RiftPass") {
            const riftPassIconUrl = combineBaseUrlWithPath('/images/Other/RiftPassIcon.png');
            riftPassIconBuffer = await fetchImageBuffer(riftPassIconUrl);
        }

        if (consumption.GameSpecificData.Type === "RiftTier") {
            const currency = Currencies["RiftFragments"] as IRiftCurrency;

            currency.amount = consumption.Amount;
            currencies.push(currency);
        }
    }

    for (const cosmetic of Object.values(cosmeticData)) {
        if (cosmetic.Type === "outfit") {
            if (cosmetic.OutfitItems.every(itemId => cosmeticIdsSet.has(itemId))) {
                for (const itemId of cosmetic.OutfitItems) {
                    cosmeticIdsSet.delete(itemId);
                }

                cosmeticIdsSet.add(cosmetic.CosmeticId);
            }
        }
    }

    const [customizationBuffers, characterBuffers, currencyBuffers] = await Promise.all([
        generateStoreCustomizationIcons(Array.from(cosmeticIdsSet), cosmeticData, true),
        generateCharacterIcons(characterIndexes, locale),
        generateCurrencyImage(currencies)
    ]);

    const imagesToCombine = [...customizationBuffers, ...characterBuffers, ...currencyBuffers];
    if (riftPassIconBuffer) {
        imagesToCombine.push(riftPassIconBuffer);
    }

    if (imagesToCombine.length === 0) {
        return [];
    }

    const bundleContentImage = await combineImagesIntoGrid(imagesToCombine, 5, 10);

    return [
        new AttachmentBuilder(bundleContentImage, { name: `bundle_${bundle.Id}.png` })
    ]
}