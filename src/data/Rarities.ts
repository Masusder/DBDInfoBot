import { combineBaseUrlWithPath } from "@utils/stringUtils";

interface IRarities {
    localizedName: string;
    itemsAddonsBackgroundPath: string;
    color: string;
}

export const Rarities: Record<string, IRarities> = {
    Common: {
        localizedName: "rarities.common",
        itemsAddonsBackgroundPath: combineBaseUrlWithPath('/images/RarityBackgrounds/Addons/Common.png'),
        color: "#ab713c"
    },
    Uncommon: {
        localizedName: "rarities.uncommon",
        itemsAddonsBackgroundPath: combineBaseUrlWithPath('/images/RarityBackgrounds/Addons/Uncommon.png'),
        color: "#e8bb38"
    },
    Rare: {
        localizedName: "rarities.rare",
        itemsAddonsBackgroundPath: combineBaseUrlWithPath('/images/RarityBackgrounds/Addons/Rare.png'),
        color: "#199b1e"
    },
    VeryRare: {
        localizedName: "rarities.very_rare",
        itemsAddonsBackgroundPath: combineBaseUrlWithPath('/images/RarityBackgrounds/Addons/VeryRare.png'),
        color: "#ac3ee3"
    },
    UltraRare: {
        localizedName: "rarities.ultra_rare",
        itemsAddonsBackgroundPath: combineBaseUrlWithPath('/images/RarityBackgrounds/Addons/UltraRare.png'),
        color: "#ff0955"
    },
    Legendary: {
        localizedName: "rarities.legendary",
        itemsAddonsBackgroundPath: combineBaseUrlWithPath('/images/RarityBackgrounds/Addons/Legendary.png'),
        color: "#c0e0e7"
    },
    SpecialEvent: {
        localizedName: "rarities.special_event",
        itemsAddonsBackgroundPath: combineBaseUrlWithPath('/images/RarityBackgrounds/Addons/SpecialEvent.png'),
        color: "#ffa800"
    },
    Artifact: {
        localizedName: "rarities.artifact",
        itemsAddonsBackgroundPath: '',
        color: "#ec0dea"
    },
    Limited: {
        localizedName: "rarities.limited",
        itemsAddonsBackgroundPath: '',
        color: "#D35400"
    },
    "N/A": {
        localizedName: "rarities.unknown",
        itemsAddonsBackgroundPath: combineBaseUrlWithPath('/images/RarityBackgrounds/Addons/Common.png'),
        color: "#7F8C8D"
    }
};