import {
    getCachedGameData,
    initializeGameDataCache
} from "../cache";
import {
    Addon,
    AddonExtended
} from "../types";
import { EGameData } from "@tps/enums/EGameData";
import { Locale } from "discord.js";
import { Rarities } from "@data/Rarities";

/**
 * Initializes the add-ons cache for a specific locale.
 * This function fetches data from the API and stores it for subsequent use.
 *
 * @param locale - The locale to initialize the add-ons cache for.
 * @returns {Promise<void>} A promise that resolves when the cache is initialized.
 */
export async function initializeAddonsCache(locale: Locale): Promise<void> {
    await initializeGameDataCache<Addon>('/api/addons', EGameData.AddonData, locale);
}

// region Helpers

/**
 * Retrieves a single add-on by its exact name from the cache.
 *
 * @param name - The name of the add-on to search for.
 * @param locale - The locale to fetch add-ons for.
 * @returns {Promise<AddonExtended | undefined>} A promise that resolves with the add-on data if found, otherwise undefined.
 */
export async function getAddonDataByName(name: string, locale: Locale): Promise<AddonExtended | undefined> {
    const cachedAddons = await getCachedAddons(locale);

    const addonId = Object.keys(cachedAddons).find(key => cachedAddons[key].Name.toLowerCase() === name.toLowerCase());

    if (addonId) {
        return { AddonId: addonId, ...cachedAddons[addonId] };
    }

    return undefined;
}

/**
 * Retrieve a list of filtered add-ons based on optional filter criteria.
 *
 * @param filters - An optional object containing filter properties from the Add-on interface.
 * @param locale - The locale for which to retrieve the add-ons.
 *
 * @returns {Promise<Addon[]>} A promise that resolves to an array of filtered Add-on objects.
 *
 * @example
 * const filteredAddons = await getFilteredAddonsList({
 *     Character: 1
 * }, Locale.EN_US);
 *
 */
export async function getFilteredAddonsList(filters: Partial<Addon> = {}, locale: Locale): Promise<Addon[]> {
    const addons = await getCachedAddons(locale);

    let addonList = Object.values(addons);
    for (const [key, value] of Object.entries(filters)) {
        if (value !== undefined) {
            addonList = addonList.filter((addon: Addon) => {
                const addonValue = addon[key as keyof Addon];

                if (Array.isArray(value) && Array.isArray(addonValue)) {
                    return value.every((item) => addonValue.includes(item)) && addonValue.every((item) => value.includes(item));
                }

                return addonValue === value;
            });
        }
    }

    addonList.sort((a, b) => {
        const rarityA = Rarities[a.Rarity] ? Object.keys(Rarities).indexOf(a.Rarity) : -1;
        const rarityB = Rarities[b.Rarity] ? Object.keys(Rarities).indexOf(b.Rarity) : -1;
        return rarityB - rarityA;
    });

    return addonList;
}

/**
 * Retrieves a list of add-ons that match the search query.
 * The query is matched against the add-on names in a case-insensitive manner.
 *
 * @param query - The search string to match against add-on names.
 * @param locale - The locale to fetch add-ons for.
 * @returns {Promise<Addon[]>} A promise that resolves with a list of matching add-ons.
 */
export async function getAddonChoices(query: string, locale: Locale): Promise<Addon[]> {
    const cachedAddons = await getCachedAddons(locale);

    const lowerCaseQuery = query.toLowerCase();
    return Object.values(cachedAddons)
        .filter(addon => addon.Name.toLowerCase().includes(lowerCaseQuery));
}

/**
 * Retrieves the cached add-ons data for a specific locale.
 * If the data is not already cached, it will initialize the cache.
 *
 * @param locale - The locale to fetch cached add-ons for.
 * @returns {Promise<{ [key: string]: Addon }>} A promise that resolves with an object containing the cached add-ons' data.
 */
export async function getCachedAddons(locale: Locale): Promise<{ [key: string]: Addon }> {
    return getCachedGameData<Addon>('addonData', locale, () => initializeAddonsCache(locale));
}

// endregion