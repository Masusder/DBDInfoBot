import axios from "@utils/apiClient";
import {
    getCache,
    setCache
} from "../cache";
import { adjustForTimezone } from "@utils/stringUtils";
import { IShrine } from "../types";

/**
 * Retrieves shrine data from the API.
 *
 * @returns {Promise<IShrine | undefined>} A promise that resolves to the shrine data if the API request is successful, or undefined if an error occurs.
 */
async function retrieveShrine(): Promise<IShrine | undefined> {
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

/**
 * Calculates the time-to-live (TTL) for cache based on the shrine's end date.
 *
 * This function calculates the number of seconds remaining until the end date
 * of the shrine and returns it as a TTL value. If the end date is in the past,
 * it returns 0.
 *
 * @param {string} endDate - The end date of the shrine.
 * @returns {number} The TTL in seconds.
 */
function getTTLForCache(endDate: string): number {
    const currentDate = new Date();
    const adjustedEndDate = adjustForTimezone(endDate);

    return Math.max(0, Math.floor((adjustedEndDate - currentDate.getTime()) / 1000));
}

/**
 * Retrieves the cached shrine data or fetches it from the API if the cache is expired or empty.
 *
 * @returns {Promise<IShrine | undefined>} A promise that resolves to the cached shrine data if available,
 * or undefined if there is an issue with fetching the data or if no data is available.
 */
export async function getCachedShrine(): Promise<IShrine | undefined> {
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