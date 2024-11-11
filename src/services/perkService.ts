import {
    getCachedGameData,
    initializeGameDataCache
} from "../cache";
import {
    Perk
} from "../types";
import { EGameData } from "@utils/dataUtils";
import { Locale } from "discord.js";
import { PerkExtended } from "../types/perk";

export async function initializePerksCache(locale: Locale): Promise<void> {
    await initializeGameDataCache<Perk>('/api/perks', EGameData.PerkData, locale);
}

// region Helpers

// Retrieve a single perk by exact name
export async function getPerkDataByName(name: string, locale: Locale): Promise<PerkExtended | undefined> {
    const cachedPerks = await getCachedPerks(locale);

    const perkId = Object.keys(cachedPerks).find(key => cachedPerks[key].Name.toLowerCase() === name.toLowerCase());

    if (perkId) {
        return { PerkId: perkId, ...cachedPerks[perkId] };
    }

    return undefined;
}

export async function getPerkChoices(query: string, locale: Locale): Promise<Perk[]> {
    const cachedPerks = await getCachedPerks(locale);

    const lowerCaseQuery = query.toLowerCase();
    return Object.values(cachedPerks)
        .filter(perk => perk.Name.toLowerCase().includes(lowerCaseQuery));
}

export async function getCachedPerks(locale: Locale): Promise<{ [key: string]: Perk }> {
    return getCachedGameData<Perk>('perkData', locale, () => initializePerksCache(locale));
}

// endregion