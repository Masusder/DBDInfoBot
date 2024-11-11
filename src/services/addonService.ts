import {
    getCachedGameData,
    initializeGameDataCache
} from "../cache";
import {
    Addon
} from "../types";
import { EGameData } from "@utils/dataUtils";
import { Locale } from "discord.js";
import { AddonExtended } from "../types/addon";

export async function initializeAddonsCache(locale: Locale): Promise<void> {
    await initializeGameDataCache<Addon>('/api/addons', EGameData.AddonData, locale);
}

// region Helpers

// Retrieve a single add-on by exact name
export async function getAddonDataByName(name: string, locale: Locale): Promise<AddonExtended | undefined> {
    const cachedAddons = await getCachedAddons(locale);

    const addonId = Object.keys(cachedAddons).find(key => cachedAddons[key].Name.toLowerCase() === name.toLowerCase());

    if (addonId) {
        return { AddonId: addonId, ...cachedAddons[addonId] };
    }

    return undefined;
}

export async function getAddonChoices(query: string, locale: Locale): Promise<Addon[]> {
    const cachedAddons = await getCachedAddons(locale);

    const lowerCaseQuery = query.toLowerCase();
    return Object.values(cachedAddons)
        .filter(addon => addon.Name.toLowerCase().includes(lowerCaseQuery));
}

export async function getCachedAddons(locale: Locale): Promise<{ [key: string]: Addon }> {
    return getCachedGameData<Addon>('addonData', locale, () => initializeAddonsCache(locale));
}

// endregion