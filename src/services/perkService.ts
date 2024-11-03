import axios from "../utils/apiClient";
import { Perk } from "../types";
import { getCache, setCache } from "../cache";

export async function initializePerksCache(): Promise<void> {
    try {
        const response = await axios.get('/api/perks');
        if (response.data.success) {
            const perkData: { [key: string]: Perk } = response.data.data;
            setCache('perkData', perkData);
            console.log(`Fetched and cached ${Object.keys(perkData).length} perks.`);
        } else {
            console.error("Failed to fetch perks: API responded with success = false");
        }
    } catch (error) {
        console.error('Error fetching perks:', error);
    }
}

// region Helpers
export async function getCachedPerks(): Promise<{ [key: string]: Perk }> {
    let cachedPerks = getCache<{ [key: string]: Perk }>('perkData');

    if (!cachedPerks || Object.keys(cachedPerks).length === 0) {
        console.warn("Perk cache expired or empty. Fetching new data...");
        await initializePerksCache();
        cachedPerks = getCache<{ [key: string]: Perk }>('perkData') || {};
    }

    return cachedPerks;
}
// endregion