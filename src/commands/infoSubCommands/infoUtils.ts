import {
    createCanvas,
    loadImage
} from "canvas";

export async function layerIcons(backgroundUrl: string, iconUrl: string, canvasWidth: number = 512, canvasHeight: number = 512): Promise<Buffer> {
    const canvas = createCanvas(canvasWidth, canvasHeight);
    const ctx = canvas.getContext('2d');

    const backgroundImage = await loadImage(backgroundUrl);
    const iconImage = await loadImage(iconUrl);

    ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);

    const iconSize = 512;
    const x = (canvas.width - iconSize) / 2;
    const y = (canvas.height - iconSize) / 2;
    ctx.drawImage(iconImage, x, y, iconSize, iconSize);

    return canvas.toBuffer();
}