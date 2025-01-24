import { InventoryItem } from "@commands/inventory/schemas/inventorySchema";
import { Cosmetic } from "@tps/cosmetic";
import { Character } from "@tps/character";

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
    cosmeticData: Record<string, Cosmetic>,
    inventory: InventoryItem[],
    characterIndex: string,
    character: Character
): IParsedInventory {
    const rarityStats: Record<string, ICosmeticStatItem> = {};
    const categoryStats: Record<string, ICosmeticStatItem> = {};
    const estimatedValue = { Cells: 0, Shards: 0 };

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

    for (const [key, cosmetic] of Object.entries(cosmeticData)) {
        if (cosmetic.Character.toString() !== characterIndex) continue;

        const { Rarity, Category } = cosmetic;

        ensureStat(rarityStats, Rarity);
        ensureStat(categoryStats, Category);

        rarityStats[Rarity].max++;
        rarityStats[Rarity].items.push(key);

        categoryStats[Category].max++;
        categoryStats[Category].items.push(key);
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