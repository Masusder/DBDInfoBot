import {
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
import {
    determineDominantRarity,
    getCurrencyField,
    prepareBundleContentDescription,
} from "@commands/info/bundle/utils";
import { Rarities } from "@data/Rarities";
import { t } from "@utils/localizationUtils";
import { ELocaleNamespace } from "@tps/enums/ELocaleNamespace";

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
                embed.addFields({
                    name: currencyField.title,
                    value: currencyField.value, inline: true
                });
            }
        }
    }

    const hasEndDate = Boolean(bundle.EndDate);
    const hasStartDate = Boolean(bundle.StartDate);

    let expirationDescription;
    if (hasEndDate) {
        const adjustedEndDate = adjustForTimezone(bundle.EndDate!);
        const adjustedEndDateUnix = Math.floor(adjustedEndDate / 1000);

        expirationDescription = `<t:${adjustedEndDateUnix}:R>`;
    } else {
        expirationDescription = t('info_command.bundle_subcommand.no_expiration', locale, ELocaleNamespace.Messages);
    }

    if (hasStartDate) {
        const adjustedStartDate = adjustForTimezone(bundle.StartDate!);
        const startDateUnix = Math.floor(adjustedStartDate / 1000);

        embed.addFields({
            name: t('info_command.bundle_subcommand.release_date', locale, ELocaleNamespace.Messages),
            value: `<t:${startDateUnix}>`,
            inline: true
        });
    }

    embed.addFields({
        name: t('info_command.bundle_subcommand.expiration', locale, ELocaleNamespace.Messages),
        value: expirationDescription,
        inline: true
    });
}

export default buildBundleContentEmbed;