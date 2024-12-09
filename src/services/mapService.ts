import {
    getCachedGameData,
    initializeGameDataCache
} from "../cache";
import {
    Map
} from "../types";
import { EGameData } from "@tps/enums/EGameData";
import { Locale } from "discord.js";

/**
 * Initializes the cache for maps by fetching data from the API and storing it in the cache.
 *
 * @param locale - The locale used for retrieving the maps' data.
 *
 * @returns {Promise<void>} A promise that resolves once the Map cache is initialized.
 */
export async function initializeMapCache(locale: Locale): Promise<void> {
    await initializeGameDataCache<Map>('/api/maps', EGameData.MapsData, locale);
}

// region Helpers

/**
 * Retrieves cached Map data for a specified locale.
 *
 * @param locale - The locale used to retrieve the cached Maps.
 *
 * @returns {Promise<{ [key: string]: Map }>} A promise that resolves to an object containing the cached Map data.
 */
export async function getCachedMaps(locale: Locale): Promise<{ [key: string]: Map }> {
    return getCachedGameData<Map>('mapsData', locale, () => initializeMapCache(locale));
}

// endregion