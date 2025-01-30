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
    const ownedItems = new Set(inventory.map((item) => item.objectId));

    const updateStats = (cosmetic: Cosmetic, id: string) => {
        const { Rarity, Category } = cosmetic;
        ensureStat(rarityStats, Rarity);
        ensureStat(categoryStats, Category);
        rarityStats[Rarity].owned++;
        rarityStats[Rarity].ownedItems.push(id);
        categoryStats[Category].owned++;
        categoryStats[Category].ownedItems.push(id);
    };

    const updateEstimatedValue = (prices?: Record<string, number>[]) => {
        if (!prices) return;
        for (const price of prices) {
            for (const [key, value] of Object.entries(price)) {
                if (key in estimatedValue) {
                    estimatedValue[key as "Cells" | "Shards"] += value as number;
                }
            }
        }
    };

    character.DefaultItems.forEach((defaultItemId) => {
        const defaultItem = cosmeticData[defaultItemId];
        if (defaultItem) {
            ownedItems.add(defaultItemId); // Default items aren't in inventory
            updateStats(defaultItem, defaultItemId);
        }
    });

    const dlcIdToCosmeticIdMap: Record<string, string[]> = {};
    Object.entries(cosmeticData).forEach(([id, cosmetic]) => {
        if ((cosmetic as Cosmetic).Character.toString() !== characterIndex) return;

        const { Rarity, Category, DlcId } = cosmetic as Cosmetic;

        ensureStat(rarityStats, Rarity);
        ensureStat(categoryStats, Category);

        rarityStats[Rarity].max++;
        rarityStats[Rarity].items.push(id);

        categoryStats[Category].max++;
        categoryStats[Category].items.push(id);

        if (!dlcIdToCosmeticIdMap[DlcId]) {
            dlcIdToCosmeticIdMap[DlcId] = [];
        }

        dlcIdToCosmeticIdMap[DlcId].push(id);
    });

    const ownedDlcCosmeticIds = new Set<string>();
    if (!isGDPR && entitlements) {
        let entitlementList: string[];
        if (Array.isArray(entitlements)) {
            entitlementList = entitlements.flatMap((e) =>
                e.objectId === "ownedEntitlements"
                    ? Object.values(e.data).flatMap((platform) =>
                        platform?.entitlements?.filter((ent) => ent.isEntitled).map((ent) => ent.productId) || []
                    )
                    : []
            );
        } else {
            entitlementList = (entitlements as DbdApiEntitlements).entitlements;
        }

        entitlementList.forEach((entitlementId) => {
            const dlc = findDlcByEntitlementId(dlcData, entitlementId);
            if (dlc) {
                dlcIdToCosmeticIdMap[dlc.DlcId]?.forEach((id) => ownedDlcCosmeticIds.add(id));
            }
        });
    }

    inventory.forEach(({ objectId: id }) => {
        const cosmetic = cosmeticData[id];
        if (!cosmetic || cosmetic.Character.toString() !== characterIndex) return;
        updateStats(cosmetic, id);
        updateEstimatedValue(cosmetic.Prices);
    });

    ownedDlcCosmeticIds.forEach((id) => {
        if (!ownedItems.has(id)) {
            const cosmetic = cosmeticData[id];
            if (cosmetic && cosmetic.Character.toString() === characterIndex) {
                ownedItems.add(id); // Items we got via DLC won't appear in your inventory, add it explicitly
                updateStats(cosmetic, id);
                updateEstimatedValue(cosmetic.Prices);
            }
        }
    });

    const outfitStats = categoryStats["outfit"];
    if (outfitStats) {
        outfitStats.items.forEach((outfitId) => {
            const outfit = cosmeticData[outfitId];
            if (outfit.OutfitItems.every((itemId: string) => ownedItems.has(itemId))) {
                updateStats(outfit, outfitId);
            }
        });
    }

    return {
        rarityStats,
        categoryStats,
        estimatedValue
    };
}