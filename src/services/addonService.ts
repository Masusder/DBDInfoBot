import {
    getCachedGameData,
    initializeGameDataCache
} from "../cache";
import { Addon } from "../types";
import { EGameData } from "../utils/dataUtils";

export async function initializeAddonsCache(): Promise<void> {
    await initializeGameDataCache<Addon>('/api/addons', EGameData.AddonData);
}

// region Helpers
export async function getCachedAddons(): Promise<{ [key: string]: Addon }> {
    return getCachedGameData<Addon>('addonData', initializeAddonsCache);
}

// endregion