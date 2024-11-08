import {
    getCachedGameData,
    initializeGameDataCache
} from "../cache";
import { Addon } from "../types";
import { EGameData } from "@utils/dataUtils";
import { Locale } from "discord.js";

export async function initializeAddonsCache(locale: Locale): Promise<void> {
    await initializeGameDataCache<Addon>('/api/addons', EGameData.AddonData, locale);
}

// region Helpers
export async function getCachedAddons(locale: Locale): Promise<{ [key: string]: Addon }> {
    return getCachedGameData<Addon>('addonData', locale, () => initializeAddonsCache(locale));
}

// endregion