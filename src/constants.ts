import { ColorResolvable } from "discord.js";

class Constants {
    public static readonly DBDINFO_BASE_URL = 'https://dbd-info.com';

    // region Channels
    public static readonly DBDLEAKS_DBD_NEWS_CHANNEL_ID = '1294751528963411989';
    public static readonly DBDLEAKS_SHRINE_CHANNEL_ID = '1305491017243430954';
    public static readonly DBDLEAKS_INGAME_NEWS_CHANNEL_ID = '1312117100428660736';
    // endregion

    // region Roles
    public static readonly DBDLEAKS_SHRINE_NOTIFICATION_ROLE = '1309184433202528309';
    public static readonly DBDLEAKS_NEWS_NOTIFICATION_ROLE = '965279779630743622';
    // endregion

    // region Colors
    public static readonly DEFAULT_DISCORD_COLOR = '#5865f2' as ColorResolvable;
    // endregion
}

export default Constants;