import axios from 'axios';
import sharp from 'sharp';
import {
    CanvasRenderingContext2D,
    createCanvas,
    loadImage
} from 'canvas';
import { Locale } from "discord.js";
import { Role } from "@data/Role";
import { combineBaseUrlWithPath } from "@utils/stringUtils";
import { layerIcons } from "@commands/infoSubCommands/infoUtils";
import { getCachedPerks } from "@services/perkService";
import { getCachedAddons } from "@services/addonService";
import { Rarities } from "@data/Rarities";
import { getCachedOfferings } from "@services/offeringService";
import { getCachedItems } from "@services/itemService";

export const fetchAndResizeImage = async(imageUrl: string, width: number | null, height: number | null) => {
    const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });

    if (response.status !== 200) {
        throw new Error(`Failed to fetch image: ${response.statusText}`);
    }

    return await sharp(response.data).resize(width, height).toBuffer();
};

function calculateDimensions(image: { width: number; height: number }, maxWidth: number): {
    width: number;
    height: number
} {
    const aspectRatio = image.width / image.height;
    const width = maxWidth;
    const height = maxWidth / aspectRatio;
    return { width, height };
}

interface Position {
    x: number;
    y: number;
}

async function drawImage(imageSrc: string | Buffer, position: Position, maxWidth: number, ctx: CanvasRenderingContext2D) {
    if (!imageSrc) return;

    try {
        const buffer = await loadImage(imageSrc);
        const { width, height } = calculateDimensions(buffer, maxWidth);
        ctx.drawImage(buffer, position.x, position.y, width, height);
    } catch (error) {
        console.error("Error loading image:", error);
    }
}

export async function createLoadoutCanvas(
    role: 'Killer' | 'Survivor',
    locale: Locale,
    perks?: string[],
    powerOrItem?: string,
    offering?: string,
    addons?: string[]) {
    const defaultPositions = {
        perk: [
            { x: 93, y: 284 },
            { x: 313, y: 284 },
            { x: 533, y: 284 },
            { x: 753, y: 284 }
        ],
        powerOrItem: { x: 78, y: 73 },
        offering: { x: 686, y: 60 },
        addon: [
            { x: 313, y: 80 },
            { x: 440, y: 80 }
        ]
    };

    const canvas = createCanvas(1093, 485);
    const ctx = canvas.getContext("2d");

    const emptyLoadoutUrl = role === 'Killer' ? combineBaseUrlWithPath("/images/Other/KillerLoadout_empty.png") : combineBaseUrlWithPath("/images/Other/SurvivorLoadout_empty.png");
    const baseImage = await loadImage(emptyLoadoutUrl);

    ctx.drawImage(baseImage, 0, 0, canvas.width, canvas.height);

    if (perks && perks.length > 0) {
        const perkData = await getCachedPerks(locale);
        const perkBackgroundUrl = Role[role].perkBackground;
        const perkBackgroundBuffer = await loadImage(perkBackgroundUrl); // Load only once to improve performance
        for (let index = 0; index < perks.length; index++) {
            const perkId = perks[index];

            const iconUrl = combineBaseUrlWithPath(perkData[perkId].IconFilePathList);

            const perkIconBuffer = await layerIcons(perkBackgroundBuffer, iconUrl);
            if (perkIconBuffer) {
                await drawImage(perkIconBuffer, defaultPositions.perk[index], 175, ctx);
            }
        }
    }

    if (powerOrItem && powerOrItem !== "None") {
        const itemData = await getCachedItems(locale);

        const rarity = itemData[powerOrItem].Rarity;
        const powerOrItemBackgroundUrl = rarity === "None" ? Rarities["Common"].itemsAddonsBackgroundPath : Rarities[rarity].itemsAddonsBackgroundPath;

        const itemOrPowerUrl = combineBaseUrlWithPath(itemData[powerOrItem].IconFilePathList);
        const itemOrPowerIconBuffer = await layerIcons(powerOrItemBackgroundUrl, itemOrPowerUrl);

        if (itemOrPowerIconBuffer) {
            await drawImage(itemOrPowerIconBuffer, defaultPositions.powerOrItem, 140, ctx);
        }
    }

    if (offering && offering !== "None") {
        const offeringData = await getCachedOfferings(locale);

        const rarity = offeringData[offering].Rarity;
        const offeringBackgroundUrl = Rarities[rarity].offeringBackgroundPath;

        const offeringUrl = combineBaseUrlWithPath(offeringData[offering].Image);
        const offeringIconBuffer = await layerIcons(offeringBackgroundUrl, offeringUrl);

        if (offeringIconBuffer) {
            await drawImage(offeringIconBuffer, defaultPositions.offering, 160, ctx);
        }
    }

    if (addons && addons.length > 0) {
        const addonData = await getCachedAddons(locale);
        for (let index = 0; index < addons.length; index++) {
            const addonId = addons[index];

            const rarity = addonData[addonId].Rarity;

            const addonBackgroundUrl = Rarities[rarity].itemsAddonsBackgroundPath;
            const iconUrl = combineBaseUrlWithPath(addonData[addonId].Image);

            const addonIconBuffer = await layerIcons(addonBackgroundUrl, iconUrl);
            if (addonIconBuffer) {
                await drawImage(addonIconBuffer, defaultPositions.addon[index], 120, ctx);
            }
        }
    }

    return canvas.toBuffer('image/png');
}