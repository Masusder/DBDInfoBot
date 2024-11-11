import { combineBaseUrlWithPath } from "@utils/stringUtils";

interface IRarities {
    localizedName: string;
    itemsAddonsBackgroundPath: string;
    offeringBackgroundPath: string;
    color: string;
}

export const Rarities: Record<string, IRarities> = {
    Common: {
        localizedName: "rarities.common",
        itemsAddonsBackgroundPath: combineBaseUrlWithPath('/images/RarityBackgrounds/Addons/Common.png'),
        offeringBackgroundPath: combineBaseUrlWithPath('/images/RarityBackgrounds/Offerings/Common.png'),
        color: "#ab713c"
    },
    Uncommon: {
        localizedName: "rarities.uncommon",
        itemsAddonsBackgroundPath: combineBaseUrlWithPath('/images/RarityBackgrounds/Addons/Uncommon.png'),
        offeringBackgroundPath: combineBaseUrlWithPath('/images/RarityBackgrounds/Offerings/Uncommon.png'),
        color: "#e8bb38"
    },
    Rare: {
        localizedName: "rarities.rare",
        itemsAddonsBackgroundPath: combineBaseUrlWithPath('/images/RarityBackgrounds/Addons/Rare.png'),
        offeringBackgroundPath: combineBaseUrlWithPath('/images/RarityBackgrounds/Offerings/Rare.png'),
        color: "#199b1e"
    },
    VeryRare: {
        localizedName: "rarities.very_rare",
        itemsAddonsBackgroundPath: combineBaseUrlWithPath('/images/RarityBackgrounds/Addons/VeryRare.png'),
        offeringBackgroundPath: combineBaseUrlWithPath('/images/RarityBackgrounds/Offerings/VeryRare.png'),
        color: "#ac3ee3"
    },
    UltraRare: {
        localizedName: "rarities.ultra_rare",
        itemsAddonsBackgroundPath: combineBaseUrlWithPath('/images/RarityBackgrounds/Addons/UltraRare.png'),
        offeringBackgroundPath: combineBaseUrlWithPath('/images/RarityBackgrounds/Offerings/UltraRare.png'),
        color: "#ff0955"
    },
    Legendary: {
        localizedName: "rarities.legendary",
        itemsAddonsBackgroundPath: combineBaseUrlWithPath('/images/RarityBackgrounds/Addons/Legendary.png'),
        offeringBackgroundPath: "",
        color: "#c0e0e7"
    },
    SpecialEvent: {
        localizedName: "rarities.special_event",
        itemsAddonsBackgroundPath: combineBaseUrlWithPath('/images/RarityBackgrounds/Addons/SpecialEvent.png'),
        offeringBackgroundPath: combineBaseUrlWithPath('/images/RarityBackgrounds/Offerings/SpecialEvent.png'),
        color: "#ffa800"
    },
    Artifact: {
        localizedName: "rarities.artifact",
        itemsAddonsBackgroundPath: "",
        offeringBackgroundPath: "",
        color: "#ec0dea"
    },
    Limited: {
        localizedName: "rarities.limited",
        itemsAddonsBackgroundPath: "",
        offeringBackgroundPath: "",
        color: "#D35400"
    },
    "N/A": {
        localizedName: "rarities.unknown",
        itemsAddonsBackgroundPath: combineBaseUrlWithPath('/images/RarityBackgrounds/Addons/Common.png'),
        offeringBackgroundPath: combineBaseUrlWithPath('/images/RarityBackgrounds/Offerings/Common.png'),
        color: "#7F8C8D"
    }
};