import axios from '../utils/apiClient';
import { Cosmetic } from '../types';
import { setCache, getCache } from '../cache';

export async function initializeCosmeticCache(): Promise<void> {
    try {
        const response = await axios.get('/api/cosmetics');
        if (response.data.success) {
            const cosmeticsData: { [key: string]: Cosmetic } = response.data.data;
            setCache('cosmeticData', cosmeticsData);
            console.log(`Fetched and cached ${Object.keys(cosmeticsData).length} cosmetics.`);
        } else {
            console.error("Failed to fetch cosmetics: API responded with success = false");
        }
    } catch (error) {
        console.error('Error fetching cosmetics:', error);
    }
}

// Filter cached cosmetics by name
export async function getCosmeticChoices(query: string): Promise<Cosmetic[]> {
    const cachedCosmetics = await getCachedCosmetics();

    const lowerCaseQuery = query.toLowerCase();
    return Object.values(cachedCosmetics).filter(cosmetic => {
        return cosmetic.CosmeticName.toLowerCase().includes(lowerCaseQuery);
    });
}

// region Helpers

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