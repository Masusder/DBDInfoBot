import axios from 'axios';
import sharp from 'sharp';
import {
    CanvasRenderingContext2D,
    createCanvas,
    Image,
    loadImage
} from 'canvas';
import { Locale } from "discord.js";
import { Role } from "@data/Role";
import { Rarities } from "@data/Rarities";
import { combineBaseUrlWithPath } from "@utils/stringUtils";
import { getCachedPerks } from "@services/perkService";
import { getCachedAddons } from "@services/addonService";
import { getCachedOfferings } from "@services/offeringService";
import { getCachedItems } from "@services/itemService";

export const fetchAndResizeImage = async(imageUrl: string, width: number | null, height: number | null) => {
    const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });

    if (response.status !== 200) {
        throw new Error(`Failed to fetch image: ${response.statusText}`);
    }

    return await sharp(response.data).resize(width, height).toBuffer();
};

const backgroundCache: Record<string, Promise<Image>> = {};
export async function layerIcons(
    background: string | Buffer | Image,
    icon: string | Buffer | Image,
    canvasWidth: number = 512,
    canvasHeight: number = 512,
    returnImage: boolean = false
): Promise<Buffer | Image> {
    const canvas = createCanvas(canvasWidth, canvasHeight);
    const ctx = canvas.getContext('2d');

    const [backgroundImage, iconImage] = await Promise.all([
        typeof background === 'string'
            ? backgroundCache[background] ?? (backgroundCache[background] = loadImage(background))
            : background instanceof Image
                ? Promise.resolve(background)
                : loadImage(background),

        icon instanceof Image ? Promise.resolve(icon) : loadImage(icon),
    ]);

    ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);

    const iconSize = 512;
    const x = (canvas.width - iconSize) / 2;
    const y = (canvas.height - iconSize) / 2;
    ctx.drawImage(iconImage, x, y, iconSize, iconSize);

    if (returnImage) {
        const image = new Image();
        image.src = canvas.toDataURL();
        return image;
    } else {
        return canvas.toBuffer();
    }
}

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

    const [perkData, itemData, offeringData, addonData] = await Promise.all([
        perks ? getCachedPerks(locale) : null,
        powerOrItem && powerOrItem !== "None" ? getCachedItems(locale) : null,
        offering && offering !== "None" ? getCachedOfferings(locale) : null,
        addons && addons.length > 0 ? getCachedAddons(locale) : null
    ]);

    const perkBackgroundBuffer = perks && perks.length > 0 ? await loadImage(Role[role].perkBackground) : null;

    await Promise.all([
        // Perks
        perks && perks.length > 0 && perkData ? Promise.all(perks.map((perkId, index) => {
            const perk = perkData[perkId];
            if (perk && perkBackgroundBuffer) {
                const iconUrl = combineBaseUrlWithPath(perk.IconFilePathList);
                return layerIcons(perkBackgroundBuffer, iconUrl).then((perkIconBuffer) => {
                    if (perkIconBuffer) {
                        return drawImage(perkIconBuffer as Buffer, defaultPositions.perk[index], 175, ctx);
                    }
                });
            }
        })) : null,

        // Power or Item
        powerOrItem && powerOrItem !== "None" && itemData ? (async () => {
            const rarity = itemData[powerOrItem].Rarity;
            const powerOrItemBackgroundUrl = rarity === "None" ? Rarities["Common"].itemsAddonsBackgroundPath : Rarities[rarity].itemsAddonsBackgroundPath;
            const itemOrPowerUrl = combineBaseUrlWithPath(itemData[powerOrItem].IconFilePathList);
            const itemOrPowerIconBuffer = await layerIcons(powerOrItemBackgroundUrl, itemOrPowerUrl);
            if (itemOrPowerIconBuffer) {
                await drawImage(itemOrPowerIconBuffer as Buffer, defaultPositions.powerOrItem, 140, ctx);
            }
        })() : null,

        // Offering
        offering && offering !== "None" && offeringData ? (async () => {
            const rarity = offeringData[offering].Rarity;
            const offeringBackgroundUrl = Rarities[rarity].offeringBackgroundPath;
            const offeringUrl = combineBaseUrlWithPath(offeringData[offering].Image);
            const offeringIconBuffer = await layerIcons(offeringBackgroundUrl, offeringUrl);
            if (offeringIconBuffer) {
                await drawImage(offeringIconBuffer as Buffer, defaultPositions.offering, 160, ctx);
            }
        })() : null,

        // Addons
        addons && addons.length > 0 && addonData ? Promise.all(addons.map((addonId, index) => {
            const addon = addonData[addonId];
            if (addon) {
                const rarity = addon.Rarity;
                const addonBackgroundUrl = Rarities[rarity].itemsAddonsBackgroundPath;
                const iconUrl = combineBaseUrlWithPath(addon.Image);
                return layerIcons(addonBackgroundUrl, iconUrl).then((addonIconBuffer) => {
                    if (addonIconBuffer) {
                        return drawImage(addonIconBuffer as Buffer, defaultPositions.addon[index], 120, ctx);
                    }
                });
            }
        })) : null
    ]);

    return canvas.toBuffer('image/png');
}

function composeGrid(images: Image[], maxWidth: number, maxHeight: number, maxImagesPerRow: number = 3, maxImagesPerColumn: number = 2): Buffer {
    const rows = Math.min(Math.ceil(images.length / maxImagesPerRow), maxImagesPerColumn);
    const cols = Math.min(images.length, maxImagesPerRow);

    const totalWidth = maxWidth * cols;
    const totalHeight = maxHeight * rows;

    const canvas = createCanvas(totalWidth, totalHeight);
    const ctx = canvas.getContext('2d');

    images.forEach((img, index) => {
        const x = (index % maxImagesPerRow) * maxWidth;
        const y = Math.floor(index / maxImagesPerRow) * maxHeight;
        ctx.drawImage(img, x, y);
    });

    return canvas.toBuffer('image/png');
}

export async function combineImagesIntoGrid(imageUrls: string[], maxImagesPerRow: number = 3, maxImagesPerColumn: number = 2): Promise<Buffer> {
    let maxWidth = 0;
    let maxHeight = 0;

    const images: Image[] = (
        await Promise.all(
            imageUrls.map((url) =>
                loadImage(url).catch(() => null)
            )
        )
    ).filter((img): img is Image => {
        if (img) {
            maxWidth = Math.max(maxWidth, img.width);
            maxHeight = Math.max(maxHeight, img.height);
            return true;
        }
        return false;
    });

    return composeGrid(images, maxWidth, maxHeight, maxImagesPerRow, maxImagesPerColumn);
}

export async function combineImagesIntroGridAndLayerIcons(icons: Record<string, string>[]) {
    let maxWidth = 0;
    let maxHeight = 0;

    const images: Image[] = (
        await Promise.all(
            icons.map(async (iconObject) => {
                return Promise.all(
                    Object.entries(iconObject).map(([key, value]) =>
                        layerIcons(key, value, undefined, undefined, true)
                    )
                );
            })
        )
    ).flat()
        .filter((img): img is Image => {
        if (img instanceof Image) {
            maxWidth = Math.max(maxWidth, img.width);
            maxHeight = Math.max(maxHeight, img.height);
            return true;
        }
        return false;
    });

    return composeGrid(images, maxWidth, maxHeight);
}