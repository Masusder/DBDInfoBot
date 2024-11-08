import {
    getCachedGameData,
    initializeGameDataCache
} from "../cache";
import { Offering } from "../types";
import { EGameData } from "@utils/dataUtils";
import { Locale } from "discord.js";

export async function initializeOfferingCache(locale: Locale): Promise<void> {
    await initializeGameDataCache<Offering>('/api/offerings', EGameData.OfferingData, locale);
}

// region Helpers
export async function getCachedOfferings(locale: Locale): Promise<{ [key: string]: Offering }> {
    return getCachedGameData<Offering>('offeringData', locale, () => initializeOfferingCache(locale));
}

// endregion