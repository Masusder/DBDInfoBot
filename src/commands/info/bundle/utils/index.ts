import { formatNumber } from "@utils/stringUtils";
import {
    Bundle,
    FullPrice
} from "@tps/bundle";
import { Locale } from "discord.js";
import { Cosmetic } from "@tps/cosmetic";
import { Rarities } from "@data/Rarities";
import {
    createEmojiMarkdown,
    getApplicationEmoji
} from "@utils/emojiManager";
import { Currencies } from "@data/Currencies";
import { t } from "@utils/localizationUtils";
import { ELocaleNamespace } from "@tps/enums/ELocaleNamespace";
import axios from "axios";

export function determineDominantRarity(
    cosmeticIds: string[],
    cosmeticData: Record<string, Cosmetic>
): keyof typeof Rarities | null {
    const rarityCounts: Record<keyof typeof Rarities, number> = {} as any;
    for (const rarity of Object.keys(Rarities) as Array<keyof typeof Rarities>) {
        rarityCounts[rarity] = 0;
    }

    let dominantRarity: keyof typeof Rarities | null = null;
    let maxCount = 0;

    for (const cosmeticId of cosmeticIds) {
        const cosmetic = cosmeticData[cosmeticId];
        if (!cosmetic) continue;

        const rarity = cosmetic.Rarity as keyof typeof Rarities;
        rarityCounts[rarity]++;

        if (rarityCounts[rarity] > maxCount) {
            maxCount = rarityCounts[rarity];
            dominantRarity = rarity;
        }
    }

    return dominantRarity;
}

export async function prepareBundleContentDescription(bundle: Bundle, locale: Locale): Promise<string> {
    let description = '';

    description += '-# ';
    description += t('info_command.bundle_subcommand.unowned_items', locale, ELocaleNamespace.Messages, {
        unowned_items: bundle.MinNumberOfUnownedForPurchase.toString()
    })

    return description;
}

interface ICurrencyField {
    title: string;
    value: string;
}

export async function getCurrencyField(
    currencyType: string,
    bundle: Bundle,
    fullPrice: FullPrice,
    locale: Locale
): Promise<ICurrencyField | null> {
    const emoji = await getApplicationEmoji(Currencies[currencyType].emojiId);

    let price: string = fullPrice.Price.toString();
    if (bundle.Discount > 0.0) {
        const discountedPrice = Math.round(fullPrice.Price - (fullPrice.Price * bundle.Discount));
        price = `~~${formatNumber(price)}~~ ${formatNumber(discountedPrice)}`;
    }

    if (emoji) {
        return {
            title: `${createEmojiMarkdown(emoji)} ${t(Currencies[currencyType].localizedName, locale, ELocaleNamespace.General)}`,
            value: price
        }
    }

    return null;
}

export async function fetchImageBuffer(url: string): Promise<Buffer | null> {
    try {
        const response = await axios.get(url, { responseType: 'arraybuffer' });
        return Buffer.from(response.data);
    } catch (error) {
        console.error(`Failed to fetch image: ${url}`, error);
        return null;
    }
}