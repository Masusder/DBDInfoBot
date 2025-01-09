import { Locale } from "discord.js";
import { getTranslation } from "@utils/localizationUtils";
import { ELocaleNamespace } from "@tps/enums/ELocaleNamespace";
import { Cosmetic } from "@tps/cosmetic";
import { adjustForTimezone, combineBaseUrlWithPath } from "@utils/stringUtils";
import { createStoreCustomizationIcons, IStoreCustomizationItem } from "@utils/imageUtils";
import { Rarities } from "@data/Rarities";

export function formatEmbedTitle(cosmeticName: string, isUnbreakable: boolean, locale: Locale): string {
    if (isUnbreakable) {
        return `${cosmeticName.trim()} (${getTranslation('info_command.cosmetic_subcommand.linked_cosmetic', locale, ELocaleNamespace.Messages)})`;
    }

    return cosmeticName;
}

// Calculate the discounted price
export function calculateDiscountedPrice(baseCurrency: number, discountPercentage: number): number {
    return Math.round(baseCurrency - (baseCurrency * discountPercentage));
}

export function getDiscountPercentage(currencyId: string, cosmeticData: Cosmetic): number {
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