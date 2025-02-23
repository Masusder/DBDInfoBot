import { TierInfo, TierInfoItem } from "@tps/rift";
import { loadResourceImage } from "@utils/imageUtils";
import { CanvasRenderingContext2D, Image, createCanvas, loadImage } from "canvas";
import { Cosmetic } from "@tps/cosmetic";
import { Currencies, ICurrencyAmount } from "@data/Currencies";
import { generateCurrencyImage } from "@utils/images/currencyImage";
import { AC_CURRENCY_PACKS } from "@commands/info/rift";
import { generateStoreCustomizationIcons } from "@commands/info/cosmetic/utils";

const FREE_TRACK_Y = 50;
const PREMIUM_TRACK_Y = 265;
const TRACK_COORDINATES = [243, 396, 549, 702, 856, 1009, 1162, 1315];

export async function generateRiftTemplate(tiersDivided: TierInfo[][], cosmeticData: Record<string, Cosmetic>, currentPage: number): Promise<Buffer> {
    const canvas = createCanvas(0, 0);
    const ctx = canvas.getContext("2d");

    const riftTemplateBuffer = await loadResourceImage("rift-track-template.png");
    const riftTemplate = await loadImage(riftTemplateBuffer);

    canvas.width = riftTemplate.width;
    canvas.height = riftTemplate.height;
    ctx.drawImage(riftTemplate, 0, 0);

    const riftChunk = tiersDivided[currentPage - 1];

    drawTierNumbers(ctx, riftChunk);

    const riftChunkPromises = riftChunk.map(async(tier, index) => {
        const tasks: Promise<void>[] = [];

        if (tier.Free) {
            tasks.push(drawTrackItems(cosmeticData, tier.Free, ctx, FREE_TRACK_Y, index));
        }

        if (tier.Premium) {
            tasks.push(drawTrackItems(cosmeticData, tier.Premium, ctx, PREMIUM_TRACK_Y, index));
        }

        await Promise.all(tasks);
    });

    for (const promise of riftChunkPromises) {
        await promise;
    }

    return canvas.toBuffer();
}

function drawTierNumbers(ctx: CanvasRenderingContext2D, riftChunk: TierInfo[]) {
    const tierCoordinates = [297, 450, 603, 755, 910, 1063, 1217, 1370];
    ctx.font = "20px Roboto";
    ctx.lineWidth = 5;

    const TIER_Y = 229;
    riftChunk.forEach((tierInfo: TierInfo, index: number) => {
        ctx.fillStyle = tierInfo.TierGroup === 1 ? "#FFED56" : "white"; // WBP_CoreArchiveRiftPanel.uasset

        const tierNumber = tierInfo.TierId.toString();
        ctx.strokeText(tierNumber, tierCoordinates[index], TIER_Y);
        ctx.fillText(tierNumber, tierCoordinates[index], TIER_Y);
    });
}

async function drawTrackItems(cosmeticData: Record<string, Cosmetic>, trackItems: TierInfoItem[], ctx: CanvasRenderingContext2D, trackY: number, index: number) {
    let currencies: ICurrencyAmount[] = []
    let cosmetics: Cosmetic[] = [];

    trackItems.forEach((trackItem: TierInfoItem) => {
        if (trackItem.Type === "inventory" && !AC_CURRENCY_PACKS.includes(trackItem.Id)) {
            const cosmetic = cosmeticData[trackItem.Id];
            if (cosmetic) {
                cosmetics.push(cosmetic);
            }
        } else if (AC_CURRENCY_PACKS.includes(trackItem.Id)) {
            let currency = Currencies["Cells"] as ICurrencyAmount;

            const amount = trackItem.Id.split("_")[1]
            currency.amount = parseInt(amount);

            currencies.push(currency);
        } else if (trackItem.Type === "currency") {
            let currency = Currencies[trackItem.Id] as ICurrencyAmount;

            if (currency) {
                currency.amount = trackItem.Amount;
                currencies.push(currency);
            }
        }
    })

    let combinedBuffers: Buffer[] = [];
    if (cosmetics.length !== 0) {
        combinedBuffers = await generateStoreCustomizationIcons(cosmetics);
    }

    if (currencies.length !== 0) {
        const currencyBuffers = await generateCurrencyImage(currencies);
        combinedBuffers.push(...currencyBuffers);
    }

    const alignedItemsBuffer = await alignRiftItems(combinedBuffers);

    ctx.drawImage(alignedItemsBuffer, TRACK_COORDINATES[index], trackY, 128, 128);
}

async function alignRiftItems(buffers: Buffer[]) {
    const images: Image[] = await Promise.all(buffers.map(buffer => loadImage(buffer)));

    const canvas = createCanvas(0, 0);
    const ctx = canvas.getContext("2d");

    let width, height;
    switch (images.length) {
        case 1:
            width = images[0].width;
            height = images[0].height;
            canvas.width = width;
            canvas.height = height;
            ctx.drawImage(images[0], 0, 0);
            break;
        case 2:
            width = 128;
            height = 256;
            canvas.width = width;
            canvas.height = height;

            images.forEach((image: Image, index: number) => {
                ctx.drawImage(image, 0, index * 128, 128, 128)
            });
            break;
        case 3:
        case 4:
            width = 128;
            height = 128;
            canvas.width = 128;
            canvas.height = 128;

            images.forEach((image: Image, index: number) => {
                const x = (index % 2) * 64; // 2 columns
                const y = Math.floor(index / 2) * 64; // 2 rows
                ctx.drawImage(image, x, y, 64, 64); // Draw resized 64x64 image
            });
            break;
    }

    return canvas;
}