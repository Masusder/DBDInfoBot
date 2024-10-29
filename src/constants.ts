import { ColorResolvable } from "discord.js";

class Constants {
    public static readonly DBDINFO_BASE_URL = 'https://dbd-info.com/';
    public static readonly DBDLEAKS_DBD_NEWS_CHANNEL_ID = '1294751528963411989';

    public static RARITY_COLORS: { [key: string]: ColorResolvable } = {
        "Common": "#ab713c",
        "Uncommon": "#e8bb38",
        "Rare": "#199b1e",
        "VeryRare": "#ac3ee3",
        "UltraRare": "#ff0955",
        "Legendary": "#c0e0e7",
        "SpecialEvent": "#ffa800",
        "Artifact": "#ec0dea",
        "Limited": "#D35400",
        "N/A": "#7F8C8D"
    };
}

export default Constants;