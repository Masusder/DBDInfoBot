import axios from '../utils/apiClient';
import { Cosmetic } from '../types';
import {
    setCache,
    getCache
} from '../cache';

let indexedCosmetics: Map<string, Cosmetic[]> = new Map();

export async function initializeCosmeticCache(): Promise<void> {
    try {
        const response = await axios.get('/api/cosmetics');
        if (response.data.success) {
            const cosmeticsData: { [key: string]: Cosmetic } = response.data.data;
            indexCosmetics(cosmeticsData);
            setCache('cosmeticData', cosmeticsData);
            console.log(`Fetched and cached ${Object.keys(cosmeticsData).length} cosmetics.`);
        } else {
            console.error("Failed to fetch cosmetics: API responded with success = false");
        }
    } catch (error) {
        console.error('Error fetching cosmetics:', error);
    }
}

// Build an indexed cosmetics map for fast querying
function indexCosmetics(cosmetics: { [key: string]: Cosmetic }) {
    console.log(`Indexing cosmetics.`);

    indexedCosmetics.clear();

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
    let cachedCosmetics = getCache<{ [key: string]: Cosmetic }>('cosmeticData');

    if (!cachedCosmetics || Object.keys(cachedCosmetics).length === 0) {
        console.warn("Cosmetic cache expired or empty. Fetching new data...");
        await initializeCosmeticCache();
        cachedCosmetics = getCache<{ [key: string]: Cosmetic }>('cosmeticData') || {};
    }
    return cachedCosmetics;
}

// endregion