import { combineBaseUrlWithPath } from "@utils/stringUtils";
import { ThemeColors } from "@constants/themeColors";

interface IRarities {
    localizedName: string;
    itemsAddonsBackgroundPath: string;
    offeringBackgroundPath: string;
    storeCustomizationPath: string;
    color: ThemeColors;
    priority: number;
}

export const Rarities: Record<string, IRarities> = {
    Common: {
        localizedName: "rarities.common",
        itemsAddonsBackgroundPath: combineBaseUrlWithPath('/images/RarityBackgrounds/Addons/Common.png'),
        offeringBackgroundPath: combineBaseUrlWithPath('/images/RarityBackgrounds/Offerings/Common.png'),
        storeCustomizationPath: combineBaseUrlWithPath('/images/RarityBackgrounds/Cosmetics/StoreCustomization_Common.png'),
        color: ThemeColors.COMMON,
        priority: 7
    },
    Uncommon: {
        localizedName: "rarities.uncommon",
        itemsAddonsBackgroundPath: combineBaseUrlWithPath('/images/RarityBackgrounds/Addons/Uncommon.png'),
        offeringBackgroundPath: combineBaseUrlWithPath('/images/RarityBackgrounds/Offerings/Uncommon.png'),
        storeCustomizationPath: combineBaseUrlWithPath('/images/RarityBackgrounds/Cosmetics/StoreCustomization_Uncommon.png'),
        color: ThemeColors.UNCOMMON,
        priority: 6
    },
    Rare: {
        localizedName: "rarities.rare",
        itemsAddonsBackgroundPath: combineBaseUrlWithPath('/images/RarityBackgrounds/Addons/Rare.png'),
        offeringBackgroundPath: combineBaseUrlWithPath('/images/RarityBackgrounds/Offerings/Rare.png'),
        storeCustomizationPath: combineBaseUrlWithPath('/images/RarityBackgrounds/Cosmetics/StoreCustomization_Rare.png'),
        color: ThemeColors.RARE,
        priority: 5
    },
    VeryRare: {
        localizedName: "rarities.very_rare",
        itemsAddonsBackgroundPath: combineBaseUrlWithPath('/images/RarityBackgrounds/Addons/VeryRare.png'),
        offeringBackgroundPath: combineBaseUrlWithPath('/images/RarityBackgrounds/Offerings/VeryRare.png'),
        storeCustomizationPath: combineBaseUrlWithPath('/images/RarityBackgrounds/Cosmetics/StoreCustomization_VeryRare.png'),
        color: ThemeColors.VERY_RARE,
        priority: 4
    },
    UltraRare: {
        localizedName: "rarities.ultra_rare",
        itemsAddonsBackgroundPath: combineBaseUrlWithPath('/images/RarityBackgrounds/Addons/UltraRare.png'),
        offeringBackgroundPath: combineBaseUrlWithPath('/images/RarityBackgrounds/Offerings/UltraRare.png'),
        storeCustomizationPath: combineBaseUrlWithPath('/images/RarityBackgrounds/Cosmetics/StoreCustomization_UltraRare.png'),
        color: ThemeColors.ULTRA_RARE,
        priority: 3
    },
    Legendary: {
        localizedName: "rarities.legendary",
        itemsAddonsBackgroundPath: combineBaseUrlWithPath('/images/RarityBackgrounds/Addons/Legendary.png'),
        offeringBackgroundPath: "",
        storeCustomizationPath: combineBaseUrlWithPath('/images/RarityBackgrounds/Cosmetics/StoreCustomization_Legendary.png'),
        color: ThemeColors.LEGENDARY,
        priority: 0
    },
    SpecialEvent: {
        localizedName: "rarities.special_event",
        itemsAddonsBackgroundPath: combineBaseUrlWithPath('/images/RarityBackgrounds/Addons/SpecialEvent.png'),
        offeringBackgroundPath: combineBaseUrlWithPath('/images/RarityBackgrounds/Offerings/SpecialEvent.png'),
        storeCustomizationPath: combineBaseUrlWithPath('/images/RarityBackgrounds/Cosmetics/StoreCustomization_SpecialEvent.png'),
        color: ThemeColors.SPECIAL_EVENT,
        priority: 1
    },
    Artifact: {
        localizedName: "rarities.artifact",
        itemsAddonsBackgroundPath: "",
        offeringBackgroundPath: "",
        storeCustomizationPath: combineBaseUrlWithPath('/images/RarityBackgrounds/Cosmetics/StoreCustomization_Artifact.png'),
        color: ThemeColors.ARTIFACT,
        priority: 2
    },
    Limited: {
        localizedName: "rarities.limited",
        itemsAddonsBackgroundPath: "",
        offeringBackgroundPath: "",
        storeCustomizationPath: "",
        color: ThemeColors.LIMITED,
        priority: -1
    },
    "N/A": {
        localizedName: "rarities.unknown",
        itemsAddonsBackgroundPath: combineBaseUrlWithPath('/images/RarityBackgrounds/Addons/Common.png'),
        offeringBackgroundPath: combineBaseUrlWithPath('/images/RarityBackgrounds/Offerings/Common.png'),
        storeCustomizationPath: combineBaseUrlWithPath('/images/RarityBackgrounds/Cosmetics/StoreCustomization_Common.png'),
        color: ThemeColors.UNKNOWN,
        priority: -1
    }
};