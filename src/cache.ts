import NodeCache from 'node-cache';
import axios from "./utils/apiClient";
import { EGameData } from "@tps/enums/EGameData";
import { Locale } from "discord.js";
import {
    localizeCacheKey,
    mapDiscordLocaleToDbdLang
} from "@utils/localizationUtils";
import client from "./client";
import logger from "@logger";

const globalCache = new NodeCache({ stdTTL: 14_400, checkperiod: 600 });
const processedKeys = new Set<string>();

export function setCache<T>(key: string, data: T, ttl: number = 3600): void {
    globalCache.set(key, data, ttl);
}

export function getCache<T>(key: string): T | undefined {
    const cachedData = globalCache.get<T>(key);
    if (!cachedData) {
        logger.warn(`No data found in cache for key: ${key}`);
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
                logger.info(`Cached ${Object.keys(data).length} items for ${localizedCacheKey}.`);
            }
        } else {
            logger.error(`Failed to fetch ${localizedCacheKey}: API responded with success = false`);
        }
    } catch (error) {
        logger.error(`Error fetching ${localizedCacheKey}:`, error);
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
        await initializer();
        cachedData = getCache<{ [key: string]: T }>(localizedCacheKey) || {};
    }

    return cachedData;
}

function debugCache(): void {
    logger.info("🔵 DiscordJS cache:");
    logger.info(` 🔹 Guilds: ${client.guilds.cache.size}`);
    logger.info(` 🔹 Channels: ${client.channels.cache.size}`);
    logger.info(` 🔹 Users: ${client.users.cache.size}`);
    logger.info('');

    const allCacheData = globalCache.data;
    const totalSize = Buffer.byteLength(JSON.stringify(allCacheData), 'utf8');

    logger.info("🔴 Node-Cache:");
    logger.info(` 🔺 Cache contains ${Object.keys(allCacheData).length} items.`);
    logger.info(` 🔺 Total cache size: ${(totalSize / 1024 / 1024).toFixed(2)} MB`);
    logger.info('');

    const memoryUsage = process.memoryUsage();
    logger.info("🔶 Memory Usage:");
    logger.info(` 🔸 RSS: ${(memoryUsage.rss / 1024 / 1024).toFixed(2)} MB`);
    logger.info(` 🔸 Heap total: ${(memoryUsage.heapTotal / 1024 / 1024).toFixed(2)} MB`);
    logger.info(` 🔸 Heap used: ${(memoryUsage.heapUsed / 1024 / 1024).toFixed(2)} MB`);
    logger.info(` 🔸 External: ${(memoryUsage.arrayBuffers / 1024 / 1024).toFixed(2)} MB`);
    logger.info('');
}

export function startCacheAnalytics() {
    setInterval(() => {
        try {
            debugCache();
        } catch (error) {
            logger.error("Failed to log cache info:", error);
        }
    }, 3600 * 1000);
}