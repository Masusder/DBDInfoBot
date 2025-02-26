import {
    getCache,
    getCachedGameData,
    initializeGameDataCache,
    setCache
} from '../cache';
import { Locale } from 'discord.js';
import { Cosmetic } from '@tps/cosmetic';
import { EGameData } from "@tps/enums/EGameData";
import { localizeCacheKey } from "@utils/localizationUtils";
import { stripHtml } from "@utils/stringUtils";
import { isCosmeticLimited } from "@commands/info/cosmetic/utils";
import logger from "@logger";

// Holds indexed cosmetics for fast querying by locale
let indexedCosmetics: Map<string, Map<string, Cosmetic[]>> = new Map();

/**
 * Initializes the cosmetic cache for the specified locale.
 * Fetches cosmetic data from the API and stores it in the cache, then indexes the cosmetics for quick lookup.
 *
 * @param locale - The locale to load cosmetic data for.
 *
 * @returns {Promise<void>} A promise that resolves when the cosmetic cache is initialized and indexed.
 */
export async function initializeCosmeticCache(locale: Locale): Promise<void> {
    await initializeGameDataCache<Cosmetic>('/api/cosmetics', EGameData.CosmeticData, locale);

    const localizedCacheKey = localizeCacheKey('cosmeticData', locale);
    const cosmeticData = getCache<{ [key: string]: Cosmetic }>(localizedCacheKey);

    if (cosmeticData) {
        indexCosmetics(cosmeticData, locale);
    }
}

/**
 * Indexes the cosmetics data to allow fast querying by substring of the cosmetic name.
 * This creates a map of cosmetic names and their substrings for efficient lookups.
 *
 * @param cosmetics - The list of cosmetics to index.
 * @param locale - The locale to index cosmetics for.
 */
function indexCosmetics(cosmetics: { [key: string]: Cosmetic }, locale: Locale) {
    logger.info(`Indexing cosmetics for language: ${locale}.`);

    if (!indexedCosmetics.has(locale)) {
        indexedCosmetics.set(locale, new Map());
    }

    const languageMap = indexedCosmetics.get(locale)!;

    languageMap.clear();
    languageMap.set("", Object.values(cosmetics));

    Object.values(cosmetics).forEach(cosmetic => {
        const name = cosmetic.CosmeticName.toLowerCase();

        // Index substrings of the cosmetic name
        for (let i = 0; i < name.length; i++) {
            for (let j = i + 1; j <= name.length; j++) {
                const substring = name.slice(i, j);

                if (!languageMap.has(substring)) {
                    languageMap.set(substring, []);
                }
                languageMap.get(substring)!.push(cosmetic);
            }
        }
    });
}

// region Helpers

/**
 * Retrieves a list of cosmetics matching the query from the indexed cosmetics for the given locale.
 * If the index is not present or expired, it will initialize the cache.
 *
 * @param query - The search query to match cosmetic names against.
 * @param locale - The locale to fetch the cosmetic data for.
 *
 * @returns {Promise<Cosmetic[]>} A promise that resolves to a list of matching cosmetics.
 */
export async function getCosmeticChoicesFromIndex(query: string, locale: Locale): Promise<Cosmetic[]> {
    const languageMap = indexedCosmetics.get(locale);
    if (!languageMap) {
        console.warn(`CosmeticData ${locale} cache expired or empty. Fetching new data...`);
        await initializeCosmeticCache(locale);
    }

    return languageMap ? languageMap.get(query) || [] : [];
}

export interface ICustomFilters {
    isLimited: boolean;
    query: string;
}

/**
 * Retrieve a list of filtered cosmetics based on optional filter criteria.
 *
 * @param filters - An optional object containing filter properties from the Cosmetic interface.
 * @param locale - The locale for which to retrieve the cosmetics.
 * @param customFilters - An optional object containing filters that require custom logic.
 *
 * @returns {Promise<Cosmetic[]>} A promise that resolves to an array of filtered Cosmetic objects.
 *
 * @example
 * const filteredCosmetics = await getFilteredCosmeticsList({
 *     Character: 1,
 *     Rarity: "Rare",
 *     Purchasable: true,
 * }, Locale.EN_US);
 *
 */
export async function getFilteredCosmeticsList(filters: Partial<Cosmetic> = {}, locale: Locale, customFilters?: Partial<ICustomFilters>): Promise<Cosmetic[]> {
    const cosmetics = await getCachedCosmetics(locale);

    let cosmeticList = Object.values(cosmetics);

    // Filters that can be applied directly
    // by matching a property value of the Cosmetic object
    for (const [key, value] of Object.entries(filters)) {
        if (value !== undefined) {
            cosmeticList = cosmeticList.filter((cosmetic: Cosmetic) => (cosmetic)[key as keyof Cosmetic] === value);
        }
    }

    // Filters that require more complex or custom logic
    // are handled here
    if (customFilters) {
        for (const [key, value] of Object.entries(customFilters)) {
            switch (key) {
                case "isLimited":
                    cosmeticList = cosmeticList.filter((cosmetic: Cosmetic) => {
                        const isLimited = isCosmeticLimited(cosmetic);
                        return value ? isLimited : !isLimited;
                    });
                    break;
                case "query":
                    if (typeof value === "string" && value.trim()) {
                        const query = value.trim().toLowerCase();

                        cosmeticList = cosmeticList.filter((cosmetic: Cosmetic) => {
                            // Search without html tags
                            const cleanDescription = stripHtml(cosmetic.Description).toLowerCase();
                            return cosmetic.CosmeticName.toLowerCase().includes(query) ||
                                cosmetic.CollectionName.toLowerCase().includes(query) ||
                                cleanDescription.includes(query);
                        });
                    }
                    break;
                default:
                    break;
            }
        }
    }

    // Filter cosmetics without active discounts
    // IsDiscounted property still can be 'true' even
    // when discount has already expired
    const currentDate = new Date();
    if (filters.IsDiscounted) {
        cosmeticList = cosmeticList.filter((cosmetic: Cosmetic) => {
            if (cosmetic.TemporaryDiscounts) {
                return cosmetic.TemporaryDiscounts.some(discount =>
                    currentDate >= new Date(discount.startDate) &&
                    currentDate <= new Date(discount.endDate)
                );
            }
            return false;
        });
    }

    return cosmeticList;
}

/**
 * Retrieves a set of unique inclusion versions for cosmetics.
 *
 * @param locale The locale used to retrieve the cosmetics data.
 *
 * @returns {Promise<string[]>} A Promise that resolves to an array of strings, where each string represents a unique inclusion
 *          version associated with the cosmetics.
 *
 * @example
 * const inclusionVersions = await getInclusionVersionsForCosmetics(Locale.EN_US);
 * logger.info(inclusionVersions); // Sorted array of unique inclusion versions for the specified locale.
 */
export async function getInclusionVersionsForCosmetics(locale: Locale): Promise<string[]> {
    let inclusionVersions = getCache<string[]>('cosmeticInclusionVersions');

    if (!inclusionVersions) {
        const cosmetics = await getCachedCosmetics(locale);

        let newInclusionVersions = new Set<string>();
        Object.values(cosmetics).forEach((cosmetic: Cosmetic) => {
            if (cosmetic.InclusionVersion) {
                newInclusionVersions.add(cosmetic.InclusionVersion);
            }
        });

        const sortedNewInclusionVersions = Array.from(newInclusionVersions).sort().reverse()

        setCache('cosmeticInclusionVersions', sortedNewInclusionVersions);

        return sortedNewInclusionVersions;
    }

    return inclusionVersions;
}

/**
 * Retrieves a single cosmetic by its ID.
 *
 * @param id - The ID of the cosmetic to retrieve.
 * @param locale - The locale to fetch the cosmetic data for.
 *
 * @returns {Promise<Cosmetic | undefined>} A promise that resolves to the cosmetic's data if found, or undefined if not.
 */
export async function getCosmeticDataById(id: string, locale: Locale): Promise<Cosmetic | undefined> {
    const cachedCosmetics = await getCachedCosmetics(locale);
    return cachedCosmetics[id];
}

/**
 * Retrieves the cached cosmetic data for the specified locale.
 * If the data is not already cached, it will initialize the cache.
 *
 * @param locale - The locale to fetch the cached cosmetic data for.
 *
 * @returns {Promise<{ [key: string]: Cosmetic }>} A promise that resolves to the cached cosmetic data.
 */
export async function getCachedCosmetics(locale: Locale): Promise<{ [key: string]: Cosmetic }> {
    return getCachedGameData<Cosmetic>('cosmeticData', locale, () => initializeCosmeticCache(locale));
}

// endregion