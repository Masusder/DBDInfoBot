import axios from "@utils/apiClient";
import {
    getCache,
    setCache
} from "../cache";
import { adjustForTimezone } from "@utils/stringUtils";

export async function retrieveShrine() {
    try {
        const response = await axios.get(`/api/shrine`);
        if (response.data.success) {
            return response.data.data;
        } else {
            console.error("Failed to fetch shrine: API responded with success = false");
        }
    } catch (error) {
        console.error('Error fetching shrine:', error);
    }
}

function getTTLForCache(endDate: string): number {
    const currentDate = new Date();
    const adjustedEndDate = adjustForTimezone(endDate);

    return Math.max(0, Math.floor((adjustedEndDate - currentDate.getTime()) / 1000));
}

export async function getCachedShrine(): Promise<any> {
    let shrineData = getCache<any>('shrineData');

    if (!shrineData) {
        console.warn("Shrine cache expired or empty. Fetching new data...");
        const shrineData = await retrieveShrine();

        if (shrineData && shrineData.currentShrine.endDate) {
            const shrineEndDate = shrineData.currentShrine.endDate;
            const ttl = getTTLForCache(shrineEndDate);

            setCache('shrineData', shrineData, ttl);
        }

        return shrineData;
    }

    return shrineData;
}