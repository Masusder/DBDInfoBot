import {
    getCachedGameData,
    initializeGameDataCache
} from "../cache";
import { Locale } from "discord.js";
import { EGameData } from "@tps/enums/EGameData";

/**
 * Initializes the cache for news by fetching data from the API and storing it in the cache.
 *
 * @param locale - The locale used for retrieving the news data.
 *
 * @returns {Promise<void>} A promise that resolves once the news cache is initialized.
 */
async function initializeNewsCache(locale: Locale): Promise<void> {
    await initializeGameDataCache('/api/newsV2', EGameData.NewsData, locale, 600); // Cached for 10 minutes
}

// region Helpers

/**
 * Retrieves cached news data for a specified locale.
 *
 * @param locale - The locale used to retrieve the cached news.
 *
 * @returns {Promise<any>} A promise that resolves to an object containing the cached news data.
 */
export async function getCachedNews(locale: Locale): Promise<any> {
    return getCachedGameData('newsData', locale, () => initializeNewsCache(locale));
}

// endregion