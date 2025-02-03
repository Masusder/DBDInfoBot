import { Locale } from "discord.js";
import { EGameData } from "@tps/enums/EGameData";
import {
    getCachedGameData,
    initializeGameDataCache
} from "../cache";
import { Bundle } from "@tps/bundle";

/**
 * Initializes the bundle cache for the specified locale.
 * This function fetches bundle data from the API and stores it in the cache.
 *
 * @param locale - The locale to load bundle data for.
 * @returns {Promise<void>} A promise that resolves when the bundle cache has been initialized.
 */
export async function initializeBundlesCache(locale: Locale): Promise<void> {
    await initializeGameDataCache<Bundle>('/api/bundles', EGameData.BundleData, locale, 600); // 10 minutes
}

/**
 * Retrieves a single bundle by its ID from the cache.
 *
 * @param id - The id of the bundle to search for.
 * @param locale - The locale to fetch bundles for.
 * @returns {Promise<Bundle | undefined>} A promise that resolves with the bundle data if found, otherwise undefined.
 */
export async function getBundleDataById(id: string, locale: Locale): Promise<Bundle | undefined> {
    const cachedBundles = await getCachedBundles(locale);

    return cachedBundles[id];
}

/**
 * Retrieves a list of bundles that match the search query.
 * The query is matched against the bundle names in a case-insensitive manner.
 *
 * @param query - The search string to match against bundle names.
 * @param locale - The locale to fetch bundles for.
 * @returns {Promise<Bundle[]>} A promise that resolves with a list of matching bundles.
 */
export async function getBundleChoices(query: string, locale: Locale): Promise<Bundle[]> {
    const cachedBundles = await getCachedBundles(locale);

    const lowerCaseQuery = query.toLowerCase();
    return Object.values(cachedBundles)
        .filter(bundle => bundle.SpecialPackTitle.toLowerCase().includes(lowerCaseQuery));
}

/**
 * Retrieves the cached bundle data for a specific locale.
 * If the data is not already cached, it will initialize the cache.
 *
 * @param locale - The locale to fetch cached bundle for.
 * @returns {Promise<{ [key: string]: Bundle }>} A promise that resolves with an object containing the cached bundles data.
 */
export async function getCachedBundles(locale: Locale): Promise<{ [key: string]: Bundle }> {
    return getCachedGameData<Bundle>('bundleData', locale, () => initializeBundlesCache(locale));
}