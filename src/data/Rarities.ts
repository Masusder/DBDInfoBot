interface IRarities {
    name: string;
    color: string;
}

export const Rarities: Record<string, IRarities> = {
    Common: {
        name: "Common",
        color: "#ab713c"
    },
    Uncommon: {
        name: "Uncommon",
        color: "#e8bb38"
    },
    Rare: {
        name: "Rare",
        color: "#199b1e"
    },
    VeryRare: {
        name: "Very Rare",
        color: "#ac3ee3"
    },
    UltraRare: {
        name: "Ultra Rare",
        color: "#ff0955"
    },
    Legendary: {
        name: "Legendary",
        color: "#c0e0e7"
    },
    SpecialEvent: {
        name: "Special Event",
        color: "#ffa800"
    },
    Artifact: {
        name: "Artifact",
        color: "#ec0dea"
    },
    Limited: {
        name: "Limited",
        color: "#D35400"
    },
    "N/A": {
        name: "N/A",
        color: "#7F8C8D"
    }
};