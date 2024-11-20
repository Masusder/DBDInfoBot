import { Locale } from "discord.js";
import {
    getCachedGameData,
    initializeGameDataCache
} from "../cache";
import { Collection } from "../types";
import { EGameData } from "@utils/dataUtils";

/**
 * Initializes the cache for collections using the provided locale.
 *
 * @param {Locale} locale - The locale to use for fetching collection data.
 * @returns {Promise<void>} A promise that resolves when the cache initialization is complete.
 */
export async function initializeCollectionCache(locale: Locale): Promise<void> {
    await initializeGameDataCache<Collection>('/api/collections', EGameData.CollectionData, locale);
}

// region Helpers

/**
 * Retrieves a specific collection by its ID from the cache.
 *
 * @param {string} id - The ID of the collection to retrieve.
 * @param {Locale} locale - The locale used for fetching the cached data.
 * @returns {Promise<Collection | undefined>} A promise that resolves with the collection if found, or undefined if not.
 */
export async function getCollectionDataById(id: string, locale: Locale): Promise<Collection | undefined> {
    const cachedCollections = await getCachedCollections(locale);
    return cachedCollections[id];
}

/**
 * Searches cached collections for those matching a query string.
 *
 * @param {string} query - The search string to filter collections by.
 * @param {Locale} locale - The locale used for fetching the cached data.
 * @returns {Promise<Collection[]>} A promise that resolves with an array of collections matching the query.
 */
export async function getCollectionChoices(query: string, locale: Locale): Promise<Collection[]> {
    const cachedCollections = await getCachedCollections(locale);

    const lowerCaseQuery = query.toLowerCase();
    return Object.values(cachedCollections)
        .filter(collection => collection.CollectionTitle.toLowerCase().includes(lowerCaseQuery));
}

/**
 * Retrieves all cached collections for a specific locale.
 * If the cache does not exist, it initializes the cache first.
 *
 * @param {Locale} locale - The locale used for fetching the cached data.
 * @returns {Promise<{ [key: string]: Collection }>} A promise that resolves with an object mapping collection IDs to collections.
 */
export async function getCachedCollections(locale: Locale): Promise<{ [key: string]: Collection }> {
    return getCachedGameData<Collection>('collectionData', locale, () => initializeCollectionCache(locale));
}

// endregion