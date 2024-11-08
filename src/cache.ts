import NodeCache from 'node-cache';
import axios from "./utils/apiClient";
import { EGameData } from "@utils/dataUtils";
import { Locale } from "discord.js";
import {
    localizeCacheKey,
    mapDiscordLocaleToDbdLang
} from "@utils/stringUtils";

const globalCache = new NodeCache({ stdTTL: 3600 });
const processedKeys = new Set<string>();

export function setCache<T>(key: string, data: T): void {
    globalCache.set(key, data);
}

export function getCache<T>(key: string): T | undefined {
    const cachedData = globalCache.get<T>(key);
    if (!cachedData) {
        console.warn(`No data found in cache for key: ${key}`);
        return undefined;
    }
    return cachedData;
}

export async function initializeGameDataCache<T>(endpoint: string, cacheKey: EGameData, locale: Locale): Promise<void> {
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
            setCache(localizedCacheKey, data);
            console.log(`Fetched and cached ${Object.keys(data).length} items for ${localizedCacheKey}.`);
        } else {
            console.error(`Failed to fetch ${localizedCacheKey}: API responded with success = false`);
        }
    } catch (error) {
        console.error(`Error fetching ${localizedCacheKey}:`, error);
    } finally {
        processedKeys.delete(localizedCacheKey);
    }
}

export async function getCachedGameData<T>(cacheKey: string, locale: Locale, initializer: () => Promise<void>): Promise<{ [key: string]: T }> {
    const localizedCacheKey = localizeCacheKey(cacheKey, locale);
    let cachedData = getCache<{ [key: string]: T }>(localizedCacheKey);

    if (!cachedData || Object.keys(cachedData).length === 0) {
        console.warn(`${localizedCacheKey} cache expired or empty. Fetching new data...`);
        await initializer();
        cachedData = getCache<{ [key: string]: T }>(localizedCacheKey) || {};
    }

    return cachedData;
}

export function debugCache(): void {
    if (process.env.BRANCH !== 'dev') {
        throw Error("You're only allowed to use debug cache method on development branch.")
    }

    const keys = globalCache.keys();
    console.log(`Cache contains ${keys.length} items.`);

    keys.forEach((key) => {
        const ttl = globalCache.getTtl(key);
        const expirationTime = ttl ? new Date(ttl) : 'Expired';

        console.log(`Key: ${key}, Expiration Time: ${expirationTime}`);
    });
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