import {
    getCachedGameData,
    initializeGameDataCache
} from '../cache';
import { Cosmetic } from '../types';
import { EGameData } from "../utils/dataUtils";

let indexedCosmetics: Map<string, Cosmetic[]> = new Map();

export async function initializeCosmeticCache(): Promise<void> {
    await initializeGameDataCache<Cosmetic>('/api/cosmetics', EGameData.CosmeticData);
    const cosmeticData = await getCachedCosmetics();
    if (Object.keys(cosmeticData).length > 0) {
        indexCosmetics(cosmeticData);
    }
}

// Build an indexed cosmetics map for fast querying
function indexCosmetics(cosmetics: { [key: string]: Cosmetic }) {
    console.log(`Indexing cosmetics.`);

    indexedCosmetics.clear();

    indexedCosmetics.set("", Object.values(cosmetics));

    Object.values(cosmetics).forEach(cosmetic => {
        const name = cosmetic.CosmeticName.toLowerCase();

        // Index substrings of the cosmetic name
        for (let i = 0; i < name.length; i++) {
            for (let j = i + 1; j <= name.length; j++) {
                const substring = name.slice(i, j);

                if (!indexedCosmetics.has(substring)) {
                    indexedCosmetics.set(substring, []);
                }
                indexedCosmetics.get(substring)!.push(cosmetic);
            }
        }
    });
}

// region Helpers

// Filter cosmetics by name using index table
export function getCosmeticChoicesFromIndex(query: string): Cosmetic[] {
    return indexedCosmetics?.get(query) || [];
}

// Retrieve a single cosmetic by exact name
export async function getCosmeticDataByName(name: string): Promise<Cosmetic | undefined> {
    const cachedCosmetics = await getCachedCosmetics();

    return Object.values(cachedCosmetics).find(cosmetic => cosmetic.CosmeticName.toLowerCase() === name.toLowerCase());
}

// Retrieve list of cosmetics using character's index
export async function getCosmeticListByCharacterIndex(index: number): Promise<Cosmetic[]> {
    const cosmeticData = await getCachedCosmetics();

    return Object.values(cosmeticData).filter((cosmetic: Cosmetic) => {
        return cosmetic.Character === index;
    });
}

// Retrieve a single cosmetic by ID
export async function getCosmeticDataById(id: string): Promise<Cosmetic | undefined> {
    const cachedCosmetics = await getCachedCosmetics();
    return cachedCosmetics[id];
}

export async function getCachedCosmetics(): Promise<{ [key: string]: Cosmetic }> {
    return getCachedGameData<Cosmetic>('cosmeticData', initializeCosmeticCache);
}

// endregion