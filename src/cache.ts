import NodeCache from 'node-cache';
import axios from "./utils/apiClient";
import { EGameData } from "./utils/dataUtils";

const globalCache = new NodeCache({ stdTTL: 3600 });

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

export async function initializeGameDataCache<T>(endpoint: string, cacheKey: EGameData): Promise<void> {
    if (!Object.values(EGameData).includes(cacheKey)) {
        throw new Error(`Caching is not allowed for the key: ${cacheKey}.`);
    }

    try {
        const response = await axios.get(endpoint);
        if (response.data.success) {
            const data: { [key: string]: T } = response.data.data;
            setCache(cacheKey, data);
            console.log(`Fetched and cached ${Object.keys(data).length} items for ${cacheKey}.`);
        } else {
            console.error(`Failed to fetch ${cacheKey}: API responded with success = false`);
        }
    } catch (error) {
        console.error(`Error fetching ${cacheKey}:`, error);
    }
}

export async function getCachedGameData<T>(cacheKey: string, initializer: () => Promise<void>): Promise<{ [key: string]: T }> {
    let cachedData = getCache<{ [key: string]: T }>(cacheKey);

    if (!cachedData || Object.keys(cachedData).length === 0) {
        console.warn(`${cacheKey} cache expired or empty. Fetching new data...`);
        await initializer();
        cachedData = getCache<{ [key: string]: T }>(cacheKey) || {};
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