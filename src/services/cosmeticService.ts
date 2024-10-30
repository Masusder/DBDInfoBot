import axios from '../utils/apiClient';
import { Cosmetic } from '../types/cosmetic';
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
export function getCosmeticChoices(query: string): Cosmetic[] {
    const cachedCosmetics = getCachedCosmetics();

    const lowerCaseQuery = query.toLowerCase();
    return Object.values(cachedCosmetics).filter(cosmetic => {
        return cosmetic.CosmeticName.toLowerCase().includes(lowerCaseQuery);
    });
}

// region Helpers

// Retrieve a single cosmetic by exact name
export function getCosmeticDataByName(name: string): Cosmetic | undefined {
    const cachedCosmetics = getCachedCosmetics();

    return Object.values(cachedCosmetics).find(cosmetic => cosmetic.CosmeticName.toLowerCase() === name.toLowerCase());
}

// Retrieve a single cosmetic by ID
export function getCosmeticDataById(id: string): Cosmetic | undefined {
    const cachedCosmetics = getCachedCosmetics();
    return cachedCosmetics[id];
}

function getCachedCosmetics(): { [key: string]: Cosmetic } {
    const cachedCosmetics = getCache<{ [key: string]: Cosmetic }>('cosmeticData');
    if (!cachedCosmetics || Object.keys(cachedCosmetics).length === 0) {
        console.warn("No cosmetics found in cache.");
        return {};
    }
    return cachedCosmetics;
}
// endregion