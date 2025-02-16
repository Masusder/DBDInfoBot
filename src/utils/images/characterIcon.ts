import {
    createCanvas,
    loadImage
} from "canvas";
import {
    backgroundCache,
} from "@utils/imageUtils";
import { getCachedCharacters } from "@services/characterService";
import { Locale } from "discord.js";
import { Role } from "@data/Role";
import { combineBaseUrlWithPath } from "@utils/stringUtils";
import sharp from "sharp";

async function generateCharacterIcons(
    characterIndexes: string[],
    locale: Locale,
    compressImages: boolean = false
): Promise<Buffer[]> {
    const characterData = await getCachedCharacters(locale);

    const layerPromises = characterIndexes.map(async(characterIndex) => {
        const character = characterData[characterIndex];
        const background = Role[character.Role as 'Killer' | 'Survivor'].charPortrait;

        let backgroundImage = backgroundCache[background] ?? (backgroundCache[background] = loadImage(background));
        let iconImage = loadImage(combineBaseUrlWithPath(character.IconFilePath));

        const [bgImage, iconImg] = await Promise.all([backgroundImage, iconImage]);

        const canvas = createCanvas(bgImage.width, bgImage.height);
        const ctx = canvas.getContext('2d');

        ctx.drawImage(bgImage, 0, 0, canvas.width, canvas.height);

        const iconSize = Math.min(canvas.width, canvas.height);
        const x = (canvas.width - iconSize) / 2;
        const y = (canvas.height - iconSize) / 2;

        ctx.drawImage(iconImg, x, y, iconSize, iconSize);

        let buffer = canvas.toBuffer();

        if (compressImages) {
            buffer = await sharp(buffer)
                .resize({ width: 64, height: 64, fit: 'inside' })
                .toBuffer();
        }

        return buffer;
    });

    const layeredIcons = await Promise.all(layerPromises);

    return layeredIcons.filter(icon => icon !== null);
}

export default generateCharacterIcons;