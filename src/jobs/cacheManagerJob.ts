import cron from 'node-cron';
import {
    initializeCharactersCache,
    initializeCosmeticCache
} from "../services";

export async function startCacheManagerJob() {
    cron.schedule('0 * * * *', async() => {
        await initializeCosmeticCache();
        await initializeCharactersCache();
        console.log('Data cache refreshed. Next refresh in an hour.');
    });
}