import {
    getCachedGameData,
    initializeGameDataCache
} from "../cache";

import { EGameData } from "@utils/dataUtils";
import { Locale } from "discord.js";
import {
    Item,
    ItemExtended
} from "../types/item";

export async function initializeItemsCache(locale: Locale): Promise<void> {
    await initializeGameDataCache<Item>('/api/items', EGameData.ItemData, locale);
}

// region Helpers

// Retrieve a single item by exact name
export async function getItemDataByName(name: string, locale: Locale): Promise<ItemExtended | undefined> {
    const cachedItems = await getCachedItems(locale);

    const itemId = Object.keys(cachedItems).find(key => cachedItems[key].Name.toLowerCase() === name.toLowerCase());

    if (itemId) {
        return { ItemId: itemId, ...cachedItems[itemId] };
    }

    return undefined;
}

export async function getItemChoices(query: string, locale: Locale): Promise<Item[]> {
    const cachedItems = await getCachedItems(locale);

    const lowerCaseQuery = query.toLowerCase();
    return Object.values(cachedItems)
        .filter(item => item.Name.toLowerCase().includes(lowerCaseQuery));
}

export async function getCachedItems(locale: Locale): Promise<{ [key: string]: Item }> {
    return getCachedGameData<Item>('itemData', locale, () => initializeItemsCache(locale));
}

// endregion