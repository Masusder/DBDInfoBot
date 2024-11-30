import {
    getCachedGameData,
    initializeGameDataCache
} from "../cache";
import {
    Perk,
    PerkExtended
} from "../types";
import { EGameData } from "@tps/enums/EGameData";
import { Locale } from "discord.js";

/**
 * Initializes the cache for perks by fetching data from the API and storing it.
 *
 * @param locale - The locale used for retrieving the perk data.
 *
 * @returns {Promise<void>} A promise that resolves once the perk cache is initialized.
 */
export async function initializePerksCache(locale: Locale): Promise<void> {
    await initializeGameDataCache<Perk>('/api/perks', EGameData.PerkData, locale);
}

// region Helpers

/**
 * Retrieves a perk by its exact name.
 *
 * @param name - The name of the perk to be fetched.
 * @param locale - The locale in which to retrieve the perk data.
 *
 * @returns {Promise<PerkExtended | undefined>} A promise that resolves to a PerkExtended object if found, or undefined if not.
 */
// export async function getPerkDataByName(name: string, locale: Locale): Promise<PerkExtended | undefined> {
//     const cachedPerks = await getCachedPerks(locale);
//
//     const perkId = Object.keys(cachedPerks).find(key => cachedPerks[key].Name.toLowerCase() === name.toLowerCase());
//
//     if (perkId) {
//         return { PerkId: perkId, ...cachedPerks[perkId] };
//     }
//
//     return undefined;
// }

/**
 * Retrieves a single perk by its ID.
 *
 * @param id - The ID of the perk to retrieve.
 * @param locale - The locale to fetch the perk data for.
 *
 * @returns {Promise<PerkExtended | undefined>} A promise that resolves to the perk's data if found, or undefined if not.
 */
export async function getPerkDataById(id: string, locale: Locale): Promise<PerkExtended | undefined> {
    const cachedPerks = await getCachedPerks(locale);

    const perk = cachedPerks[id];
    if (!perk) {
        return undefined;
    }

    return {
        ...perk,
        PerkId: id
    };
}

/**
 * Retrieves a list of perks that match the given query string.
 *
 * @param query - The query string to search for in perk names.
 * @param locale - The locale used to retrieve the perk data.
 *
 * @returns {Promise<PerkExtended[]>} A promise that resolves to an array of perks whose names match the query string.
 */
export async function getPerkChoices(query: string, locale: Locale): Promise<PerkExtended[]> {
    const cachedPerks = await getCachedPerks(locale);

    const lowerCaseQuery = query.toLowerCase();
    return Object.entries(cachedPerks)
        .filter(([_, perk]) => perk.Name.toLowerCase().includes(lowerCaseQuery))
        .map(([perkId, perk]) => ({
            ...perk,
            PerkId: perkId
        }));
}

/**
 * Retrieves cached perk data for a specified locale.
 *
 * @param locale - The locale used to retrieve the cached perks.
 *
 * @returns {Promise<{ [key: string]: Perk }>} A promise that resolves to an object containing the cached perk data.
 */
export async function getCachedPerks(locale: Locale): Promise<{ [key: string]: Perk }> {
    return getCachedGameData<Perk>('perkData', locale, () => initializePerksCache(locale));
}

// endregion