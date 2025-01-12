import {
    getCachedGameData,
    initializeGameDataCache
} from "../cache";
import {
    Offering,
    OfferingExtended
} from "../types";
import { EGameData } from "@tps/enums/EGameData";
import { Locale } from "discord.js";

/**
 * Initializes the cache for offerings by fetching data from the API and storing it in the cache.
 *
 * @param locale - The locale used for retrieving the offering data.
 *
 * @returns {Promise<void>} A promise that resolves once the offering cache is initialized.
 */
export async function initializeOfferingCache(locale: Locale): Promise<void> {
    await initializeGameDataCache<Offering>('/api/offerings', EGameData.OfferingData, locale);
}

// region Helpers

/**
 * Retrieves an offering by its exact name.
 *
 * @param name - The name of the offering to be fetched.
 * @param locale - The locale in which to retrieve the offering data.
 *
 * @returns {Promise<OfferingExtended | undefined>} A promise that resolves to an OfferingExtended object if found, or undefined if not.
 */
// export async function getOfferingDataByName(name: string, locale: Locale): Promise<OfferingExtended | undefined> {
//     const cachedOfferings = await getCachedOfferings(locale);
//
//     const offeringId = Object.keys(cachedOfferings).find(key => cachedOfferings[key].Name.toLowerCase() === name.toLowerCase());
//
//     if (offeringId) {
//         return { OfferingId: offeringId, ...cachedOfferings[offeringId] };
//     }
//
//     return undefined;
// }

/**
 * Retrieves an offering by its IC.
 *
 * @param id - The ID of the offering to be fetched.
 * @param locale - The locale in which to retrieve the offering data.
 *
 * @returns {Promise<OfferingExtended | undefined>} A promise that resolves to an OfferingExtended object if found, or undefined if not.
 */
export async function getOfferingDataById(id: string, locale: Locale): Promise<OfferingExtended | undefined> {
    const cachedOfferings = await getCachedOfferings(locale);

    const offeringData: Offering | undefined = cachedOfferings[id];

    if (offeringData) {
        return { OfferingId: id, ...offeringData };
    }

    return undefined;
}

/**
 * Retrieves a list of offerings that match the given query string.
 *
 * @param query - The query string to search for in offering names.
 * @param locale - The locale used to retrieve the offering data.
 *
 * @returns {Promise<OfferingExtended[]>} A promise that resolves to an array of offerings whose names match the query string.
 */
export async function getOfferingChoices(query: string, locale: Locale): Promise<OfferingExtended[]> {
    const cachedOfferings = await getCachedOfferings(locale);

    const lowerCaseQuery = query.toLowerCase();
    return Object.entries(cachedOfferings)
        .filter(([_, offering]) => offering.Name.toLowerCase().includes(lowerCaseQuery))
        .map(([offeringId, offering]) => ({
            ...offering,
            OfferingId: offeringId
        }));
}

/**
 * Retrieves cached offering data for a specified locale.
 *
 * @param locale - The locale used to retrieve the cached offerings.
 *
 * @returns {Promise<{ [key: string]: Offering }>} A promise that resolves to an object containing the cached offering data.
 */
export async function getCachedOfferings(locale: Locale): Promise<{ [key: string]: Offering }> {
    return getCachedGameData<Offering>('offeringData', locale, () => initializeOfferingCache(locale));
}

// endregion