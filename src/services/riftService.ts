import { Locale } from "discord.js";
import { EGameData } from "@tps/enums/EGameData";
import { Rift, RiftExtended } from "@tps/rift";
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
 * Retrieves a single rift by its ID.
 *
 * @param id - The ID of the rift to retrieve.
 * @param locale - The locale to fetch the rift data for.
 *
 * @returns {Promise<RiftExtended | undefined>} A promise that resolves to the rift's data if found, or undefined if not.
 */
export async function getRiftDataById(id: string, locale: Locale): Promise<RiftExtended | undefined> {
    const cachedRifts = await getCachedRifts(locale);

    const rift = cachedRifts[id];
    if (!rift) {
        return undefined;
    }

    return {
        ...rift,
        RiftId: id
    };
}

/**
 * Retrieves a list of rifts that match the given query string.
 *
 * @param query - The query string to search for in rift names.
 * @param locale - The locale used to retrieve the rift data.
 *
 * @returns {Promise<RiftExtended[]>} A promise that resolves to an array of rifts whose names match the query string.
 */
export async function getRiftChoices(query: string, locale: Locale): Promise<RiftExtended[]> {
    const cachedRifts = await getCachedRifts(locale);

    const lowerCaseQuery = query.toLowerCase();
    return Object.entries(cachedRifts)
        .filter(([_, rift]) => rift.Name.toLowerCase().includes(lowerCaseQuery))
        .map(([riftId, rift]) => ({
            ...rift,
            RiftId: riftId
        }));
}

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