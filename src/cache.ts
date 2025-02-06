import NodeCache from 'node-cache';
import axios from "./utils/apiClient";
import { EGameData } from "@tps/enums/EGameData";
import { Locale } from "discord.js";
import {
    localizeCacheKey,
    mapDiscordLocaleToDbdLang
} from "@utils/localizationUtils";
import client from "./client";

const globalCache = new NodeCache({ stdTTL: 14_400, checkperiod: 600 });
const processedKeys = new Set<string>();

export function setCache<T>(key: string, data: T, ttl: number = 3600): void {
    globalCache.set(key, data, ttl);
}

export function getCache<T>(key: string): T | undefined {
    const cachedData = globalCache.get<T>(key);
    if (!cachedData) {
        console.warn(`No data found in cache for key: ${key}`);
        return undefined;
    }
    return cachedData;
}

export async function initializeGameDataCache<T>(
    endpoint: string,
    cacheKey: EGameData,
    locale: Locale,
    ttl: number = 3600
): Promise<void> {
    if (!Object.values(EGameData).includes(cacheKey)) {
        throw new Error(`Caching is not allowed for the key: ${cacheKey}.`);
    }

    const dbdLocale = mapDiscordLocaleToDbdLang(locale);
    const localizedCacheKey = localizeCacheKey(cacheKey, locale);

    if (processedKeys.has(localizedCacheKey)) return; // Exit if already processing this cache key

    processedKeys.add(localizedCacheKey);

    try {
        const response = await axios.get(endpoint, {
            headers: { 'Cookie': `language=${dbdLocale}` },
            withCredentials: true,
        });
        if (response.data.success) {
            const data: { [key: string]: T } = response.data.data;
            setCache(localizedCacheKey, data, ttl);

            if (cacheKey !== EGameData.NewsData) {
                console.log(`Fetched and cached ${Object.keys(data).length} items for ${localizedCacheKey}.`);
            }
        } else {
            console.error(`Failed to fetch ${localizedCacheKey}: API responded with success = false`);
        }
    } catch (error) {
        console.error(`Error fetching ${localizedCacheKey}:`, error);
    } finally {
        processedKeys.delete(localizedCacheKey);
    }
}

export async function getCachedGameData<T>(
    cacheKey: string,
    locale: Locale,
    initializer: () => Promise<void>
): Promise<{ [key: string]: T }> {
    const localizedCacheKey = localizeCacheKey(cacheKey, locale);
    let cachedData = getCache<{ [key: string]: T }>(localizedCacheKey);

    if (!cachedData || Object.keys(cachedData).length === 0) {
        console.warn(`${localizedCacheKey} cache expired or empty. Fetching new data...`);
        await initializer();
        cachedData = getCache<{ [key: string]: T }>(localizedCacheKey) || {};
    }

    return cachedData;
}

function debugCache(): void {
    console.log("🔵 DiscordJS cache:");
    console.log(` 🔹 Guilds: ${client.guilds.cache.size}`);
    console.log(` 🔹 Channels: ${client.channels.cache.size}`);
    console.log(` 🔹 Users: ${client.users.cache.size}`);
    console.log('');

    const allCacheData = globalCache.data;
    const totalSize = Buffer.byteLength(JSON.stringify(allCacheData), 'utf8');

    console.log("🔴 Node-Cache:");
    console.log(` 🔺 Cache contains ${Object.keys(allCacheData).length} items.`);
    console.log(` 🔺 Total cache size: ${(totalSize / 1024 / 1024).toFixed(2)} MB`);
    console.log('');

    const memoryUsage = process.memoryUsage();
    console.log("🔶 Memory Usage:");
    console.log(` 🔸 RSS: ${(memoryUsage.rss / 1024 / 1024).toFixed(2)} MB`);
    console.log(` 🔸 Heap total: ${(memoryUsage.heapTotal / 1024 / 1024).toFixed(2)} MB`);
    console.log(` 🔸 Heap used: ${(memoryUsage.heapUsed / 1024 / 1024).toFixed(2)} MB`);
    console.log(` 🔸 External: ${(memoryUsage.external / 1024 / 1024).toFixed(2)} MB`);
    console.log('');
}

export function startCacheAnalytics() {
    setInterval(() => {
        try {
            debugCache();
        } catch (error) {
            console.error("Failed to log cache info:", error);
        }
    }, 3600 * 1000);
}

// export function clearCache(key: string): void {
//     globalCache.del(key);
//     console.log(`Cache cleared for key: ${key}`);
// }
//
// export function clearAllCache(): void {
//     globalCache.flushAll();
//     console.log('All cache has been cleared.');
// }