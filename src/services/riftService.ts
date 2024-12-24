import { Locale } from "discord.js";
import { EGameData } from "@tps/enums/EGameData";
import { Rift } from "@tps/rift";
import {
    getCachedGameData,
    initializeGameDataCache
} from "../cache";

/**
 * Initializes the cache for rifts by fetching data from the API and storing it in the cache.
 *
 * @param locale - The locale used for retrieving the rift's data.
 *
 * @returns {Promise<void>} A promise that resolves once the Rift cache is initialized.
 */
async function initializeRiftCache(locale: Locale): Promise<void> {
    await initializeGameDataCache<Rift>('/api/rifts', EGameData.RiftData, locale);
}

// region Helpers

/**
 * Retrieves cached Rift data for a specified locale.
 *
 * @param locale - The locale used to retrieve the cached Rifts.
 *
 * @returns {Promise<Record<string, Rift>>} A promise that resolves to an object containing the cached Rift data.
 */
export async function getCachedRifts(locale: Locale): Promise<Record<string, Rift>> {
    return getCachedGameData<Rift>('riftData', locale, () => initializeRiftCache(locale));
}

// endregion