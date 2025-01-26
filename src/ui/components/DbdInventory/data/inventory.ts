import { InventoryItem } from "@commands/inventory/schemas/inventorySchema";
import { Cosmetic } from "@tps/cosmetic";
import { Character } from "@tps/character";
import {
    DbdApiEntitlements,
    DbdEntitlements,
} from "@commands/inventory/schemas/entitlementsSchema";
import { GameData } from "@ui/components/DbdInventory/models";
import { findDlcByEntitlementId } from "@services/dlcService";

export interface ICosmeticStatItem {
    max: number;
    owned: number;
    items: string[];
    ownedItems: string[];
}

export interface IParsedInventory {
    rarityStats: Record<string, ICosmeticStatItem>;
    categoryStats: Record<string, ICosmeticStatItem>;
    estimatedValue: {
        Cells: number;
        Shards: number;
    };
}

function ensureStat(stats: Record<string, ICosmeticStatItem>, key: string) {
    if (!stats[key]) {
        stats[key] = { max: 0, owned: 0, items: [], ownedItems: [] };
    }
}

export function parseInventoryData(
    gameData: GameData,
    inventory: InventoryItem[],
    characterIndex: string,
    character: Character,
    entitlements: DbdEntitlements[] | DbdApiEntitlements | null,
    isGDPR: boolean
): IParsedInventory {
    const rarityStats: Record<string, ICosmeticStatItem> = {};
    const categoryStats: Record<string, ICosmeticStatItem> = {};
    const estimatedValue = { Cells: 0, Shards: 0 };

    const { cosmeticData, dlcData } = gameData;

    for (const defaultItemId of character.DefaultItems) {
        const defaultItem = cosmeticData[defaultItemId];
        if (defaultItem) {
            const { Rarity, Category } = defaultItem;

            ensureStat(rarityStats, Rarity);
            ensureStat(categoryStats, Category);

            rarityStats[Rarity].owned++;
            rarityStats[Rarity].ownedItems.push(defaultItemId);

            categoryStats[Category].owned++;
            categoryStats[Category].ownedItems.push(defaultItemId);
        }
    }

    const dlcIdToCosmeticIdMap: Record<string, string[]> = {};
    for (const [key, cosmetic] of Object.entries(cosmeticData)) {
        if ((cosmetic as Cosmetic).Character.toString() !== characterIndex) continue;

        const { Rarity, Category, DlcId } = cosmetic as Cosmetic;

        ensureStat(rarityStats, Rarity);
        ensureStat(categoryStats, Category);

        rarityStats[Rarity].max++;
        rarityStats[Rarity].items.push(key);

        categoryStats[Category].max++;
        categoryStats[Category].items.push(key);

        if (!dlcIdToCosmeticIdMap[DlcId]) {
            dlcIdToCosmeticIdMap[DlcId] = [];
        }

        dlcIdToCosmeticIdMap[DlcId].push(key);
    }

    const ownedDlcCosmeticIds: string[] = [];
    if (!isGDPR && entitlements && (entitlements as DbdApiEntitlements).entitlements) {
        (entitlements as DbdApiEntitlements).entitlements.forEach((entitlementId) => {
            const dlc = findDlcByEntitlementId(dlcData, entitlementId);

            if (dlc) {
                const dlcCosmeticIds = dlcIdToCosmeticIdMap[dlc.DlcId];

                if (dlcCosmeticIds && dlcCosmeticIds.length > 0) {
                    ownedDlcCosmeticIds.push(...dlcCosmeticIds);
                }
            }
        });
    } else if (entitlements && Array.isArray(entitlements)) {
        entitlements.forEach((entitlementType) => {
            if (entitlementType.objectId === "ownedEntitlements") {
                Object.values(entitlementType.data).forEach((platformEntitlementData) => {
                    if (platformEntitlementData && Array.isArray(platformEntitlementData.entitlements)) {
                        platformEntitlementData.entitlements.forEach((entitlement) => {
                            if (entitlement.isEntitled) {
                                const dlc = findDlcByEntitlementId(dlcData, entitlement.productId);

                                if (dlc) {
                                    const dlcCosmeticIds = dlcIdToCosmeticIdMap[dlc.DlcId];

                                    if (dlcCosmeticIds && dlcCosmeticIds.length > 0) {
                                        ownedDlcCosmeticIds.push(...dlcCosmeticIds);
                                    }
                                }
                            }
                        });
                    }
                });
            }
        })
    }

    const ownedItems = new Set(inventory.map((item) => item.objectId));

    for (const { objectId: id } of inventory) {
        const cosmetic = cosmeticData[id];
        if (!cosmetic || cosmetic.Character.toString() !== characterIndex) continue;

        const { Rarity, Category, Prices } = cosmetic;

        rarityStats[Rarity].owned++;
        rarityStats[Rarity].ownedItems.push(id);

        categoryStats[Category].owned++;
        categoryStats[Category].ownedItems.push(id);

        if (Prices) {
            for (const price of Prices) {
                for (const [key, value] of Object.entries(price)) {
                    if (key in estimatedValue) {
                        estimatedValue[key as "Cells" | "Shards"] += value as number;
                    }
                }
            }
        }
    }

    ownedDlcCosmeticIds.forEach((id) => {
        const cosmetic = cosmeticData[id];

        if (!cosmetic || cosmetic.Character.toString() !== characterIndex) return;

        const { Rarity, Category, Prices } = cosmetic;

        ensureStat(rarityStats, Rarity);
        rarityStats[Rarity].owned++;
        rarityStats[Rarity].ownedItems.push(id);

        ensureStat(categoryStats, Category);
        categoryStats[Category].owned++;
        categoryStats[Category].ownedItems.push(id);

        if (Prices) {
            for (const price of Prices) {
                for (const [key, value] of Object.entries(price)) {
                    if (key in estimatedValue) {
                        estimatedValue[key as "Cells" | "Shards"] += value as number;
                    }
                }
            }
        }
    });

    const outfitStats = categoryStats['outfit'];
    if (outfitStats && outfitStats.items.length > 0) {
        for (const outfitId of outfitStats.items) {
            const outfit = cosmeticData[outfitId];
            const { OutfitItems, Category, Rarity } = outfit;

            if (OutfitItems.every((itemId: string) => ownedItems.has(itemId))) {
                rarityStats[Rarity].owned++;
                rarityStats[Rarity].ownedItems.push(outfitId);

                categoryStats[Category].owned++;
                categoryStats[Category].ownedItems.push(outfitId);
            }
        }
    }

    return {
        rarityStats,
        categoryStats,
        estimatedValue
    };
}