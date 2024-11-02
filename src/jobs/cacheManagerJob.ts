import cron from 'node-cron';
import {
    initializeCharactersCache,
    initializeCosmeticCache,
    initializePerksCache
} from "../services";
import { initializeAddonsCache } from "../services/addonService";

export async function startCacheManagerJob() {
    cron.schedule('0 * * * *', async() => {
        await bulkProcessInitialization();
        console.log('Data cache refreshed. Next refresh in an hour.');
    });
}

export async function bulkProcessInitialization() {
    await initializeCosmeticCache();
    await initializeCharactersCache();
    await initializePerksCache();
    await initializeAddonsCache();
}