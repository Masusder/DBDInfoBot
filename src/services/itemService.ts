import {
    getCachedGameData,
    initializeGameDataCache
} from "../cache";
import { EGameData } from "@tps/enums/EGameData";
import { Locale } from "discord.js";
import {
    Item,
    ItemExtended
} from "../types";

/**
 * Initializes the cache for items by fetching data from the API and storing it in the cache.
 *
 * @param locale - The locale used for retrieving the item data.
 *
 * @returns {Promise<void>} A promise that resolves once the item cache is initialized.
 */
export async function initializeItemsCache(locale: Locale): Promise<void> {
    await initializeGameDataCache<Item>('/api/items', EGameData.ItemData, locale);
}

// region Helpers

/**
 * Retrieves an item by its exact name.
 *
 * @param name - The name of the item to be fetched.
 * @param locale - The locale in which to retrieve the item data.
 *
 * @returns {Promise<ItemExtended | undefined>} A promise that resolves to an ItemExtended object if found, or undefined if not.
 */
export async function getItemDataByName(name: string, locale: Locale): Promise<ItemExtended | undefined> {
    const cachedItems = await getCachedItems(locale);

    const itemId = Object.keys(cachedItems).find(key => cachedItems[key].Name.toLowerCase() === name.toLowerCase());

    if (itemId) {
        return { ItemId: itemId, ...cachedItems[itemId] };
    }

    return undefined;
}

/**
 * Retrieves a list of items that match the given query string.
 *
 * @param query - The query string to search for in item names.
 * @param locale - The locale used to retrieve the item data.
 *
 * @returns {Promise<Item[]>} A promise that resolves to an array of items whose names match the query string.
 */
export async function getItemChoices(query: string, locale: Locale): Promise<Item[]> {
    const cachedItems = await getCachedItems(locale);

    const lowerCaseQuery = query.toLowerCase();
    return Object.values(cachedItems)
        .filter(item => item.Name.toLowerCase().includes(lowerCaseQuery));
}

/**
 * Retrieves cached item data for a specified locale.
 *
 * @param locale - The locale used to retrieve the cached items.
 *
 * @returns {Promise<{ [key: string]: Item }>} A promise that resolves to an object containing the cached item data.
 */
export async function getCachedItems(locale: Locale): Promise<{ [key: string]: Item }> {
    return getCachedGameData<Item>('itemData', locale, () => initializeItemsCache(locale));
}

// endregion