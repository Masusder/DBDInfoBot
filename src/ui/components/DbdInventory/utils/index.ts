import { Rarities } from "@data/Rarities";
import { ICosmeticStatItem } from "../data/inventory";

export function compareItemRarityPriority(
    itemA: { rarity: keyof typeof Rarities },
    itemB: { rarity: keyof typeof Rarities }
) {
    const priorityA = Rarities[itemA.rarity]?.priority ?? Infinity;
    const priorityB = Rarities[itemB.rarity]?.priority ?? Infinity;

    return priorityA - priorityB;
}

export function calculateDominantRarity(parsedInventory: { [key: string]: ICosmeticStatItem }): string {
    const rarityCount: { [key: string]: number } = {};

    for (const rarity in parsedInventory) {
        rarityCount[rarity] = parsedInventory[rarity].ownedItems.length;
    }

    let dominantRarity = 'Common';
    let maxCount = 0;

    for (const rarity in rarityCount) {
        if (rarityCount[rarity] > maxCount) {
            maxCount = rarityCount[rarity];
            dominantRarity = rarity;
        }
    }

    return dominantRarity;
}

export function hexToRgba(hex: string, alpha: number) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function convertToPercentage(num: number, max: number) {
    const percentage = (num / max) * 100;
    return Math.min(100, Math.max(0, percentage));
}

export function percentageToColor(percentage: number) {
    const clamped = Math.min(100, Math.max(0, percentage));

    const red = Math.round((clamped / 100) * 255);
    const green = Math.round((1 - clamped / 100) * 255);

    const brightness = 255;

    return `rgb(${Math.min(brightness, red + 50)}, ${Math.min(brightness, green + 50)}, 0)`;
}

export function shortenText(text: string, maxLength: number = 17): string {
    if (text.length > maxLength) {
        return text.slice(0, maxLength) + '...';
    }
    return text;
}