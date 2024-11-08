import {
    getCachedGameData,
    initializeGameDataCache
} from "../cache";
import { Perk } from "../types";
import { EGameData } from "@utils/dataUtils";
import { Locale } from "discord.js";

export async function initializePerksCache(locale: Locale): Promise<void> {
    await initializeGameDataCache<Perk>('/api/perks', EGameData.PerkData, locale);
}

// region Helpers
export async function getCachedPerks(locale: Locale): Promise<{ [key: string]: Perk }> {
    return getCachedGameData<Perk>('perkData', locale, () => initializePerksCache(locale));
}

// endregion