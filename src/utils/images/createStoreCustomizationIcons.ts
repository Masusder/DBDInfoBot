import {
    createCanvas,
    Image,
    loadImage
} from "canvas";
import * as icons from "@resources/base64Icons.json";
import { truncateString } from "@utils/stringUtils";
import {
    backgroundCache,
    IStoreCustomizationItem
} from "@utils/imageUtils";

async function createStoreCustomizationIcons(storeCustomizationItems: IStoreCustomizationItem[]): Promise<Buffer[]> {
    const items = Array.isArray(storeCustomizationItems) ? storeCustomizationItems : [storeCustomizationItems];

    const layerPromises = items.map(async(item) => {
        const {
            icon,
            text,
            includeText,
            background,
            prefix,
            isLinked,
            isLimited,
            isOnSale,
            isKillSwitched,
            color
        } = item;

        let backgroundImage = backgroundCache[background] ?? (backgroundCache[background] = loadImage(background));
        let iconImage = loadImage(icon);

        const [bgImage, iconImg] = await Promise.all([backgroundImage, iconImage]);

        const canvas = createCanvas(512, 512);
        const ctx = canvas.getContext('2d');

        ctx.drawImage(bgImage, 0, 0, canvas.width, canvas.height);

        if (prefix && prefix === 'Visceral') {
            const visceralIcon = new Image();
            visceralIcon.src = icons.VISCERAL_OVERLAY;

            const visceralIconSize = Math.min(canvas.width, canvas.height);
            ctx.drawImage(visceralIcon, 0, 0, visceralIconSize, visceralIconSize);
        }

        const iconSize = Math.min(canvas.width, canvas.height) * 0.9;
        const x = (canvas.width - iconSize) / 2;
        const y = (canvas.height - iconSize) / 2;

        const clipLeft = 80;
        const clipRight = 428;
        const clipTop = 36;

        ctx.save();

        // In-game icons are bounded to specific area, we need to consider that
        ctx.beginPath();
        ctx.rect(clipLeft, clipTop, clipRight - clipLeft, canvas.height);
        ctx.clip();

        ctx.drawImage(iconImg, x, y, iconSize, iconSize);

        ctx.restore();

        if (isLinked) {
            const setIcon = new Image();
            setIcon.src = icons.LINKED_SET;

            const setIconSize = Math.min(canvas.width, canvas.height) * 0.15;

            ctx.globalAlpha = 0.85;
            ctx.drawImage(setIcon, 90, 40, setIconSize, setIconSize);
            ctx.globalAlpha = 1;
        }

        if (isLimited) {
            const limitedFlag = new Image();
            limitedFlag.src = icons.LIMITED_FLAG;

            ctx.drawImage(limitedFlag, 382, 45, limitedFlag.width, limitedFlag.height);
        }

        if (isOnSale) {
            const onSaleFlag = new Image();
            onSaleFlag.src = icons.SALE_FLAG;

            ctx.drawImage(onSaleFlag, 382, 108, onSaleFlag.width, onSaleFlag.height);
        }

        if (isKillSwitched) {
            const killSwitchedOverlay = new Image();
            killSwitchedOverlay.src = icons.KILLSWITCH_OVERLAY_COSMETIC;

            ctx.drawImage(killSwitchedOverlay, 0, 0, 512, 512);
        }

        if (includeText) {
            const truncatedText = truncateString(text, 13);
            const fontSize = 36;

            ctx.font = `bold ${fontSize}px Roboto`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

            ctx.lineWidth = 3;
            ctx.strokeStyle = 'black';
            ctx.lineJoin = 'round';

            const paddingBottom = 60;
            ctx.globalAlpha = 0.9;
            ctx.strokeText(truncatedText, canvas.width / 2, canvas.height - paddingBottom);

            ctx.fillStyle = color;
            ctx.fillText(truncatedText, canvas.width / 2, canvas.height - paddingBottom);
            ctx.globalAlpha = 1;
        }

        return canvas.toBuffer();
    });

    const layeredIcons = await Promise.all(layerPromises);

    if (layeredIcons.length === 1) {
        return [layeredIcons[0]];
    }

    return layeredIcons.filter(icon => icon !== null);
}

export default createStoreCustomizationIcons;