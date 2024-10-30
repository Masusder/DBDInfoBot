import NodeCache from 'node-cache';

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

export function clearCache(key: string): void {
    globalCache.del(key);
    console.log(`Cache cleared for key: ${key}`);
}

export function clearAllCache(): void {
    globalCache.flushAll();
    console.log('All cache has been cleared.');
}