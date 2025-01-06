import { createCanvas, loadImage } from "canvas";
import { backgroundCache } from "@utils/imageUtils";
import { IRiftCurrency } from "@data/Currencies";
import { formatNumber } from "@utils/stringUtils";

export async function generateCurrencyImage(currencies: IRiftCurrency[]): Promise<Buffer[]> {
    const layerPromises = currencies.map(async(item) => {
        const { iconPath, backgroundPath, amount } = item;

        let backgroundImage = backgroundCache[backgroundPath] ?? (backgroundCache[backgroundPath] = loadImage(backgroundPath));
        let iconImage = loadImage(iconPath);

        const [bgImage, iconImg] = await Promise.all([backgroundImage, iconImage]);

        const canvas = createCanvas(bgImage.width, bgImage.height);
        const ctx = canvas.getContext('2d');

        ctx.drawImage(bgImage, 0, 0, canvas.width, canvas.height);

        const iconSize = Math.min(canvas.width, canvas.height) * 0.75;
        const x = (canvas.width - iconSize) / 2;
        const y = (canvas.height - iconSize) / 2;

        ctx.drawImage(iconImg, x, y, iconSize, iconSize);

        ctx.font = 'bold 30px Roboto';
        ctx.textAlign = 'right';
        ctx.textBaseline = 'top';
        ctx.lineWidth = 5;
        ctx.fillStyle = 'white';

        ctx.strokeText(formatNumber(amount), canvas.width - 45, 35);
        ctx.fillText(formatNumber(amount), canvas.width - 45, 35);

        return canvas.toBuffer();
    });

    const layeredIcons = await Promise.all(layerPromises);

    if (layeredIcons.length === 1) {
        return [layeredIcons[0]];
    }

    return layeredIcons.filter(icon => icon !== null);
}