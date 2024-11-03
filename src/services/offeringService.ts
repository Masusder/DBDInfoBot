import axios from "../utils/apiClient";
import { Offering } from "../types";
import {
    getCache,
    setCache
} from "../cache";

export async function initializeOfferingCache(): Promise<void> {
    try {
        const response = await axios.get('/api/offerings');
        if (response.data.success) {
            const offeringData: { [key: string]: Offering } = response.data.data;
            setCache('offeringData', offeringData);
            console.log(`Fetched and cached ${Object.keys(offeringData).length} offerings.`);
        } else {
            console.error("Failed to fetch offerings: API responded with success = false");
        }
    } catch (error) {
        console.error('Error fetching offering:', error);
    }
}

// region Helpers
export async function getCachedOfferings(): Promise<{ [key: string]: Offering }> {
    let cachedOfferings = getCache<{ [key: string]: Offering }>('offeringData');

    if (!cachedOfferings || Object.keys(cachedOfferings).length === 0) {
        console.warn("Offering cache expired or empty. Fetching new data...");
        await initializeOfferingCache();
        cachedOfferings = getCache<{ [key: string]: Offering }>('offeringData') || {};
    }

    return cachedOfferings;
}

// endregion