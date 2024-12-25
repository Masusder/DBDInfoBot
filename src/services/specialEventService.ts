import { Locale } from "discord.js";
import { EGameData } from "@tps/enums/EGameData";
import { SpecialEvent } from "@tps/specialEvent";
import {
    getCachedGameData,
    initializeGameDataCache
} from "../cache";

/**
 * Initializes the cache for special events by fetching data from the API and storing it in the cache.
 *
 * @param locale - The locale used for retrieving the special event's data.
 *
 * @returns {Promise<void>} A promise that resolves once the Special Event cache is initialized.
 */
async function initializeSpecialEventCache(locale: Locale): Promise<void> {
    await initializeGameDataCache<SpecialEvent>('/api/specialEvents', EGameData.SpecialEventData, locale);
}

// region Helpers

/**
 * Retrieves cached Special Event data for a specified locale.
 *
 * @param locale - The locale used to retrieve the cached SpecialEvents.
 *
 * @returns {Promise<Record<string, SpecialEvent>>} A promise that resolves to an object containing the cached Special Event data.
 */
export async function getCachedSpecialEvents(locale: Locale): Promise<Record<string, SpecialEvent>> {
    return getCachedGameData<SpecialEvent>('specialEventData', locale, () => initializeSpecialEventCache(locale));
}

// endregion