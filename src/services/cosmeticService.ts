import axios from '../utils/apiClient';
import { Cosmetic } from '../types/cosmetic';

export let cachedCosmetics: { [id: string]: Cosmetic } = {};

// Fetch and cache all cosmetics from the API response
export async function initializeCosmeticCache(): Promise<void> {
    try {
        const response = await axios.get('/api/cosmetics');
        if (response.data.success) {
            const cosmeticsData: { [key: string]: Cosmetic } = response.data.data;

            cachedCosmetics = { ...cosmeticsData };

            console.log(`Fetched and cached ${Object.keys(cachedCosmetics).length} cosmetics.`);
        } else {
            console.error("Failed to fetch cosmetics: API responded with success = false");
        }
    } catch (error) {
        console.error('Error fetching cosmetics:', error);
    }
}

// Filter cached cosmetics by name
export function getCosmeticChoices(query: string): Cosmetic[] {
    const lowerCaseQuery = query.toLowerCase();

    return Object.values(cachedCosmetics).filter(cosmetic => {
        return cosmetic.CosmeticName.toLowerCase().includes(lowerCaseQuery);
    });
}

// Retrieve a single cosmetic by exact name
export function getCosmeticData(name: string): Cosmetic | undefined {
    return Object.values(cachedCosmetics).find(cosmetic => cosmetic.CosmeticName.toLowerCase() === name.toLowerCase());
}

// Retrieve a single cosmetic by ID
export function getCosmeticDataById(id: string): Cosmetic | undefined {
    return cachedCosmetics[id];
}