import { combineBaseUrlWithPath } from "@utils/stringUtils";
import { ThemeColors } from "@constants/themeColors";

interface IRarities {
    localizedName: string;
    itemsAddonsBackgroundPath: string;
    offeringBackgroundPath: string;
    storeCustomizationPath: string;
    color: ThemeColors;
}

export const Rarities: Record<string, IRarities> = {
    Common: {
        localizedName: "rarities.common",
        itemsAddonsBackgroundPath: combineBaseUrlWithPath('/images/RarityBackgrounds/Addons/Common.png'),
        offeringBackgroundPath: combineBaseUrlWithPath('/images/RarityBackgrounds/Offerings/Common.png'),
        storeCustomizationPath: combineBaseUrlWithPath('/images/RarityBackgrounds/Cosmetics/StoreCustomization_Common.png'),
        color: ThemeColors.COMMON
    },
    Uncommon: {
        localizedName: "rarities.uncommon",
        itemsAddonsBackgroundPath: combineBaseUrlWithPath('/images/RarityBackgrounds/Addons/Uncommon.png'),
        offeringBackgroundPath: combineBaseUrlWithPath('/images/RarityBackgrounds/Offerings/Uncommon.png'),
        storeCustomizationPath: combineBaseUrlWithPath('/images/RarityBackgrounds/Cosmetics/StoreCustomization_Uncommon.png'),
        color: ThemeColors.UNCOMMON
    },
    Rare: {
        localizedName: "rarities.rare",
        itemsAddonsBackgroundPath: combineBaseUrlWithPath('/images/RarityBackgrounds/Addons/Rare.png'),
        offeringBackgroundPath: combineBaseUrlWithPath('/images/RarityBackgrounds/Offerings/Rare.png'),
        storeCustomizationPath: combineBaseUrlWithPath('/images/RarityBackgrounds/Cosmetics/StoreCustomization_Rare.png'),
        color: ThemeColors.RARE
    },
    VeryRare: {
        localizedName: "rarities.very_rare",
        itemsAddonsBackgroundPath: combineBaseUrlWithPath('/images/RarityBackgrounds/Addons/VeryRare.png'),
        offeringBackgroundPath: combineBaseUrlWithPath('/images/RarityBackgrounds/Offerings/VeryRare.png'),
        storeCustomizationPath: combineBaseUrlWithPath('/images/RarityBackgrounds/Cosmetics/StoreCustomization_VeryRare.png'),
        color: ThemeColors.VERY_RARE
    },
    UltraRare: {
        localizedName: "rarities.ultra_rare",
        itemsAddonsBackgroundPath: combineBaseUrlWithPath('/images/RarityBackgrounds/Addons/UltraRare.png'),
        offeringBackgroundPath: combineBaseUrlWithPath('/images/RarityBackgrounds/Offerings/UltraRare.png'),
        storeCustomizationPath: combineBaseUrlWithPath('/images/RarityBackgrounds/Cosmetics/StoreCustomization_UltraRare.png'),
        color: ThemeColors.ULTRA_RARE
    },
    Legendary: {
        localizedName: "rarities.legendary",
        itemsAddonsBackgroundPath: combineBaseUrlWithPath('/images/RarityBackgrounds/Addons/Legendary.png'),
        offeringBackgroundPath: "",
        storeCustomizationPath: combineBaseUrlWithPath('/images/RarityBackgrounds/Cosmetics/StoreCustomization_Legendary.png'),
        color: ThemeColors.LEGENDARY
    },
    SpecialEvent: {
        localizedName: "rarities.special_event",
        itemsAddonsBackgroundPath: combineBaseUrlWithPath('/images/RarityBackgrounds/Addons/SpecialEvent.png'),
        offeringBackgroundPath: combineBaseUrlWithPath('/images/RarityBackgrounds/Offerings/SpecialEvent.png'),
        storeCustomizationPath: combineBaseUrlWithPath('/images/RarityBackgrounds/Cosmetics/StoreCustomization_SpecialEvent.png'),
        color: ThemeColors.SPECIAL_EVENT
    },
    Artifact: {
        localizedName: "rarities.artifact",
        itemsAddonsBackgroundPath: "",
        offeringBackgroundPath: "",
        storeCustomizationPath: combineBaseUrlWithPath('/images/RarityBackgrounds/Cosmetics/StoreCustomization_Artifact.png'),
        color: ThemeColors.ARTIFACT
    },
    Limited: {
        localizedName: "rarities.limited",
        itemsAddonsBackgroundPath: "",
        offeringBackgroundPath: "",
        storeCustomizationPath: "",
        color: ThemeColors.LIMITED
    },
    "N/A": {
        localizedName: "rarities.unknown",
        itemsAddonsBackgroundPath: combineBaseUrlWithPath('/images/RarityBackgrounds/Addons/Common.png'),
        offeringBackgroundPath: combineBaseUrlWithPath('/images/RarityBackgrounds/Offerings/Common.png'),
        storeCustomizationPath: combineBaseUrlWithPath('/images/RarityBackgrounds/Cosmetics/StoreCustomization_Common.png'),
        color: ThemeColors.UNKNOWN
    }
};