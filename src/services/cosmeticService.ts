import {
    getCache,
    getCachedGameData,
    initializeGameDataCache
} from '../cache';
import { Locale } from 'discord.js';
import { Cosmetic } from '../types';
import { EGameData } from "@utils/dataUtils";
import { localizeCacheKey } from "@utils/localizationUtils";

let indexedCosmetics: Map<string, Map<string, Cosmetic[]>> = new Map();

export async function initializeCosmeticCache(locale: Locale): Promise<void> {
    await initializeGameDataCache<Cosmetic>('/api/cosmetics', EGameData.CosmeticData, locale);

    const localizedCacheKey = localizeCacheKey('cosmeticData', locale);
    const cosmeticData = getCache<{ [key: string]: Cosmetic }>(localizedCacheKey);

    if (cosmeticData) {
        indexCosmetics(cosmeticData, locale);
    }
}

// Build an indexed cosmetics map for fast querying
function indexCosmetics(cosmetics: { [key: string]: Cosmetic }, locale: Locale) {
    console.log(`Indexing cosmetics for language: ${locale}.`);

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

// Filter cosmetics by name using index table
export async function getCosmeticChoicesFromIndex(query: string, locale: Locale): Promise<Cosmetic[]> {
    const languageMap = indexedCosmetics.get(locale);
    if (!languageMap) {
        console.warn(`CosmeticData ${locale} cache expired or empty. Fetching new data...`);
        await initializeCosmeticCache(locale);
    }

    return languageMap ? languageMap.get(query) || [] : [];
}

// Retrieve a single cosmetic by exact name
// export async function getCosmeticDataByName(name: string, locale: Locale): Promise<Cosmetic | undefined> {
//     const cachedCosmetics = await getCachedCosmetics(locale);
//
//     return Object.values(cachedCosmetics).find(cosmetic => cosmetic.CosmeticName.toLowerCase() === name.toLowerCase());
// }

// Retrieve list of cosmetics using character's index
export async function getCosmeticListByCharacterIndex(index: number, locale: Locale): Promise<Cosmetic[]> {
    const cosmeticData = await getCachedCosmetics(locale);

    return Object.values(cosmeticData).filter((cosmetic: Cosmetic) => {
        return cosmetic.Character === index;
    });
}

/**
 * Retrieve a list of filtered cosmetics based on optional filter criteria.
 *
 * @param filters - An optional object containing filter properties from the Cosmetic interface.
 * @param locale - The locale for which to retrieve the cosmetics.
 *
 * @example
 * const filteredCosmetics = await getFilteredCosmeticsList({
 *     Character: 1,
 *     Rarity: "Epic",
 *     Purchasable: true,
 * }, Locale.EN_US);
 *
 * @returns A promise that resolves to an array of filtered Cosmetic objects.
 */
export async function getFilteredCosmeticsList(filters: Partial<Cosmetic> = {}, locale: Locale): Promise<Cosmetic[]> {
    const cosmetics = await getCachedCosmetics(locale);

    // These aren't cosmetics
    // so, I don't want them obviously
    // Hard-coded to improve performance
    let excludeItems = new Set([
        "cellsPack_25",
        "cellsPack_50",
        "cellsPack_75",
        "HalloweenEventCurrency",
        "BonusBloodpoints",
        "WinterEventCurrency",
        "SpringEventCurrency",
        "AnniversaryEventCurrency",
        "Shards"
    ]);
    for (const itemId of excludeItems) {
        delete cosmetics[itemId];
    }

    let cosmeticList = Object.values(cosmetics);

    for (const [key, value] of Object.entries(filters)) {
        if (value !== undefined) {
            cosmeticList = cosmeticList.filter((cosmetic: Cosmetic) => (cosmetic as any)[key] === value);
        }
    }

    return cosmeticList;
}

// Retrieve a single cosmetic by ID
export async function getCosmeticDataById(id: string, locale: Locale): Promise<Cosmetic | undefined> {
    const cachedCosmetics = await getCachedCosmetics(locale);
    return cachedCosmetics[id];
}

export async function getCachedCosmetics(locale: Locale): Promise<{ [key: string]: Cosmetic }> {
    return getCachedGameData<Cosmetic>('cosmeticData', locale, () => initializeCosmeticCache(locale));
}

// endregion