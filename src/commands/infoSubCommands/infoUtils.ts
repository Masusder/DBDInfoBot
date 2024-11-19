import {
    createCanvas,
    Image,
    loadImage
} from "canvas";

export async function layerIcons(background: string | Buffer | Image, icon: string | Buffer | Image, canvasWidth: number = 512, canvasHeight: number = 512): Promise<Buffer> {
    const canvas = createCanvas(canvasWidth, canvasHeight);
    const ctx = canvas.getContext('2d');

    const [backgroundImage, iconImage] = await Promise.all([
        background instanceof Image ? background : loadImage(background),
        icon instanceof Image ? icon : loadImage(icon),
    ]);

    ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);

    const iconSize = 512;
    const x = (canvas.width - iconSize) / 2;
    const y = (canvas.height - iconSize) / 2;
    ctx.drawImage(iconImage, x, y, iconSize, iconSize);

    return canvas.toBuffer();
}