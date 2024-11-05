import {
    getCachedGameData,
    initializeGameDataCache
} from "../cache";
import { Offering } from "../types";
import { EGameData } from "../utils/dataUtils";

export async function initializeOfferingCache(): Promise<void> {
    await initializeGameDataCache<Offering>('/api/offerings', EGameData.OfferingData);
}

// region Helpers
export async function getCachedOfferings(): Promise<{ [key: string]: Offering }> {
    return getCachedGameData<Offering>('offeringData', initializeOfferingCache);
}

// endregion