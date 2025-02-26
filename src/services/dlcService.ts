import { Locale } from "discord.js";
import {
    getCachedGameData,
    initializeGameDataCache
} from "../cache";
import {
    DLC,
    DLCExtended
} from "@tps/dlc";
import { EGameData } from "@tps/enums/EGameData";

/**
 * Initializes the cache for DLCs using the provided locale.
 *
 * @param {Locale} locale - The locale to use for fetching DLC data.
 * @returns {Promise<void>} A promise that resolves when the cache initialization is complete.
 */
export async function initializeDlcCache(locale: Locale): Promise<void> {
    await initializeGameDataCache<DLC>('/api/dlc', EGameData.DlcData, locale);
}

// region Helpers

/**
 * Retrieves a specific DLC by its ID from the cache.
 *
 * @param {string} id - The ID of the DLC to retrieve.
 * @param {Locale} locale - The locale used for fetching the cached data.
 * @returns {Promise<DLC | undefined>} A promise that resolves with the DLC if found, or undefined if not.
 */
// export async function getDlcDataById(id: string, locale: Locale): Promise<DLC | undefined> {
//     const cachedDlcs = await getCachedDlcs(locale);
//     return cachedDlcs[id];
// }

/**
 * Finds a specific DLC based on the provided entitlement ID and returns the corresponding
 * DLC object with the `DlcId` key, which is the key from the `dlcData` record.
 *
 * @param {Record<string, DLC>} dlcData - A record of DLC objects where the key is the unique identifier of the DLC.
 * @param {string} entitlementId - The entitlement ID (one of the platform IDs) used to find the matching DLC.
 * @returns {DLCExtended | null} The corresponding `DLC` object with the `DlcId` field, or `null` if no match is found.
 *
 * @example
 * const dlc = findDlcByEntitlementId(dlcData, "SteamId123");
 * logger.info(dlc.DlcId); // The unique key for the matched DLC.
 */
export function findDlcByEntitlementId(
    dlcData: Record<string, DLC>,
    entitlementId: string
): DLCExtended | undefined {
    for (const [key, dlc] of Object.entries(dlcData)) {
        const platformIds = [
            dlc.SteamId,
            dlc.EpicId,
            dlc.PS4Id,
            dlc.XB1_XSX_GDK,
            dlc.SwitchId,
            dlc.WindowsStoreId,
            dlc.PS5Id,
            dlc.StadiaId
        ];

        if (platformIds.includes(entitlementId)) {
            return { ...dlc, DlcId: key };
        }
    }
    return undefined;
}

/**
 * Retrieves all cached DLCs for a specific locale.
 * If the cache does not exist, it initializes the cache first.
 *
 * @param {Locale} locale - The locale used for fetching the cached data.
 * @returns {Promise<{ [key: string]: DLC }>} A promise that resolves with an object mapping DLC IDs to DLCs.
 */
export async function getCachedDlcs(locale: Locale): Promise<{ [key: string]: DLC }> {
    return getCachedGameData<DLC>('dlcData', locale, () => initializeDlcCache(locale));
}

// endregion
