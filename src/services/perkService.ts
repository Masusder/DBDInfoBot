import {
    getCachedGameData,
    initializeGameDataCache
} from "../cache";
import { Perk } from "../types";
import { EGameData } from "../utils/dataUtils";

export async function initializePerksCache(): Promise<void> {
    await initializeGameDataCache<Perk>('/api/perks', EGameData.PerkData);
}

// region Helpers
export async function getCachedPerks(): Promise<{ [key: string]: Perk }> {
    return getCachedGameData<Perk>('perkData', initializePerksCache);
}

// endregion