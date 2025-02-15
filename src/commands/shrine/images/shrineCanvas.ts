import { Perk } from "@tps/perk";
import {
    CanvasRenderingContext2D,
    createCanvas,
    loadImage
} from "canvas";
import { combineBaseUrlWithPath } from "@utils/stringUtils";
import { ApplicationEmoji } from "discord.js";
import { Role } from "@data/Role";
import { layerIcons } from "@utils/imageUtils";
import { getOrCreateApplicationEmoji } from "@utils/emojiManager";
import { CorrectlyCasedPerkData } from "@commands/shrine/models";

async function createShrineCanvas(correctlyCasedPerkData: CorrectlyCasedPerkData, perkData: {
    [key: string]: Perk
}): Promise<Buffer> {
    const canvas = createCanvas(800, 606);
    const ctx = canvas.getContext('2d');

    const backgroundUrl = combineBaseUrlWithPath('/images/Other/shrine-of-secrets-empty.png');
    const logoUrl = combineBaseUrlWithPath('/images/Logo/DBDInfoLogo.png');
    const [backgroundImage, logoIcon] = await Promise.all([
        loadImage(backgroundUrl),
        loadImage(logoUrl)
    ]);

    ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);

    const iconSize = 256;
    const positions = [
        { x: (canvas.width - iconSize) / 2 + 25, y: 10 },  // Top (Centered horizontally)
        { x: canvas.width - iconSize - 56, y: (canvas.height - iconSize) / 2 },  // Right (Centered vertically)
        { x: 96, y: (canvas.height - iconSize) / 2 },  // Left (Centered vertically)
        { x: (canvas.width - iconSize) / 2 + 25, y: canvas.height - iconSize - 10 }  // Bottom (Centered horizontally)
    ];

    const emojiCreationPromises: Promise<void | ApplicationEmoji | null>[] = [];
    const perkIds = Object.keys(correctlyCasedPerkData);
    const perkPromises = perkIds.map(async(perkId, index) => {
        const role = perkData[perkId].Role;
        const perkBackgroundUrl = Role[role].perkBackground;
        const iconUrl = combineBaseUrlWithPath(perkData[perkId].IconFilePathList);

        const perkIconBuffer = await layerIcons(perkBackgroundUrl, iconUrl) as Buffer;

        emojiCreationPromises.push(
            getOrCreateApplicationEmoji(perkId, perkIconBuffer).catch(() => {
            })
        );

        const icon = await loadImage(perkIconBuffer);

        const position = positions[index % positions.length];
        ctx.drawImage(icon, position.x, position.y, iconSize, iconSize);
    });

    await Promise.all(perkPromises);
    await Promise.all(emojiCreationPromises);

    const bottomRightPosition = { x: canvas.width - 150 - 10, y: canvas.height - 117 - 10 };
    ctx.drawImage(logoIcon, bottomRightPosition.x, bottomRightPosition.y, 150, 117);

    return canvas.toBuffer('image/png');
}

export default createShrineCanvas;