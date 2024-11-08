import cron from 'node-cron';
import {
    initializeCharactersCache,
    initializeCosmeticCache,
    initializePerksCache,
    initializeAddonsCache,
    initializeOfferingCache
} from "../services";
import { Locale } from "discord.js";
import { EGameData } from "../utils/dataUtils";

export async function startCacheManagerJob() {
    cron.schedule('0 * * * *', async() => {
        await bulkProcessInitialization();
        console.log('Data cache refreshed. Next refresh in an hour.');
    });
}

const delay = (ms: number): Promise<void> => new Promise(resolve => setTimeout(resolve, ms));

export async function initializeGameDataCache(cacheKey: EGameData, locale: Locale): Promise<void> {
    switch (cacheKey) {
        case EGameData.CharacterData:
            await initializeCharactersCache(locale);
            break;
        case EGameData.PerkData:
            await initializePerksCache(locale);
            break;
        case EGameData.AddonData:
            await initializeAddonsCache(locale);
            break;
        case EGameData.OfferingData:
            await initializeOfferingCache(locale);
            break;
        case EGameData.CosmeticData:
            await initializeCosmeticCache(locale);
            break;
        default:
            throw new Error(`Invalid cacheKey: ${cacheKey}`);
    }
}

const ignoredLocales: Locale[] = [
    Locale.EnglishGB,
    Locale.Indonesian,
    Locale.Bulgarian,
    Locale.Croatian,
    Locale.Czech,
    Locale.Danish,
    Locale.Dutch,
    Locale.Finnish,
    Locale.Greek,
    Locale.Hindi,
    Locale.Hungarian,
    Locale.Lithuanian,
    Locale.Norwegian,
    Locale.Romanian,
    Locale.Swedish,
    Locale.Ukrainian,
    Locale.Vietnamese
];
export async function bulkProcessInitialization(): Promise<void> {
    console.log("Processing cache initialization..");

    const locales: Locale[] = Object.values(Locale);
    const cacheKeys: EGameData[] = Object.values(EGameData);

    for (const locale of locales) {
        if (ignoredLocales.includes(locale)) continue;

        for (const cacheKey of cacheKeys) {
            await initializeGameDataCache(cacheKey, locale);
            await delay(1250);
        }
    }
}