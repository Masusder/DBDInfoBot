import axios from "../utils/apiClient";
import { Addon } from "../types/addon";
import { getCache, setCache } from "../cache";

export async function initializeAddonsCache(): Promise<void> {
    try {
        const response = await axios.get('/api/addons');
        if (response.data.success) {
            const addonData: { [key: string]: Addon } = response.data.data;
            setCache('addonData', addonData);
            console.log(`Fetched and cached ${Object.keys(addonData).length} addons.`);
        } else {
            console.error("Failed to fetch addons: API responded with success = false");
        }
    } catch (error) {
        console.error('Error fetching addons:', error);
    }
}

// region Helpers
export async function getCachedAddons(): Promise<{ [key: string]: Addon }> {
    let cachedAddons = getCache<{ [key: string]: Addon }>('addonData');

    if (!cachedAddons || Object.keys(cachedAddons).length === 0) {
        console.warn("Addon cache expired or empty. Fetching new data...");
        await initializeAddonsCache();
        cachedAddons = getCache<{ [key: string]: Addon }>('addonData') || {};
    }

    return cachedAddons;
}
// endregion