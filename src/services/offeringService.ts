import {
    getCachedGameData,
    initializeGameDataCache
} from "../cache";
import { Offering } from "../types";
import { EGameData } from "@utils/dataUtils";
import { Locale } from "discord.js";
import { OfferingExtended } from "../types/offering";

export async function initializeOfferingCache(locale: Locale): Promise<void> {
    await initializeGameDataCache<Offering>('/api/offerings', EGameData.OfferingData, locale);
}

// region Helpers

// Retrieve a single offering by exact name
export async function getOfferingDataByName(name: string, locale: Locale): Promise<OfferingExtended | undefined> {
    const cachedOfferings = await getCachedOfferings(locale);

    const offeringId = Object.keys(cachedOfferings).find(key => cachedOfferings[key].Name.toLowerCase() === name.toLowerCase());

    if (offeringId) {
        return { OfferingId: offeringId, ...cachedOfferings[offeringId] };
    }

    return undefined;
}

export async function getOfferingChoices(query: string, locale: Locale): Promise<Offering[]> {
    const cachedOfferings = await getCachedOfferings(locale);

    const lowerCaseQuery = query.toLowerCase();
    return Object.values(cachedOfferings)
        .filter(offering => offering.Name.toLowerCase().includes(lowerCaseQuery));
}

export async function getCachedOfferings(locale: Locale): Promise<{ [key: string]: Offering }> {
    return getCachedGameData<Offering>('offeringData', locale, () => initializeOfferingCache(locale));
}

// endregion