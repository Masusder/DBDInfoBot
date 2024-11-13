import {
    ButtonInteraction,
    EmbedBuilder,
    Locale
} from 'discord.js';
import { getCosmeticDataById } from '@services/cosmeticService';
import {
    combineBaseUrlWithPath,
    extractInteractionId
} from '@utils/stringUtils';
import axios from "axios";
import {
    createCanvas,
    loadImage
} from "canvas";
import { getTranslation } from "@utils/localizationUtils";

export async function viewOutfitPiecesHandler(interaction: ButtonInteraction) {
    const cosmeticId = extractInteractionId(interaction.customId);
    const locale = interaction.locale;

    if (!cosmeticId) {
        await interaction.followUp({ content: getTranslation('info_command.cosmetic_subcommand.button_interaction.invalid_id', locale, 'errors'), ephemeral: true });
        return;
    }

    const cosmeticData = await getCosmeticDataById(cosmeticId, locale);
    if (!cosmeticData) {
        await interaction.followUp({ content: getTranslation('info_command.cosmetic_subcommand.button_interaction.error_retrieving_data', locale, 'errors'), ephemeral: true });
        return;
    }

    const outfitPieces = await getCosmeticPiecesCombinedImage(cosmeticData.OutfitItems, locale);
    const combinedImageBuffer = await combineImages(outfitPieces);

    const embed = new EmbedBuilder()
        .setTitle(`${getTranslation('info_command.cosmetic_subcommand.button_interaction.outfit_pieces', locale, 'messages')} ${cosmeticData.CosmeticName}`)
        .setColor(interaction.message.embeds[0].color)
        .setImage('attachment://combined-outfit-pieces.png');

    for (const pieceId of cosmeticData.OutfitItems) {
        const pieceData = await getCosmeticDataById(pieceId, locale);
        if (pieceData) {
            embed.addFields({
                name: pieceData.CosmeticName,
                value: pieceData.Description,
                inline: true
            });
        }
    }

    await interaction.followUp({
        embeds: [embed],
        files: [{ attachment: combinedImageBuffer, name: 'combined-outfit-pieces.png' }],
        ephemeral: true
    });
}

async function getCosmeticPiecesCombinedImage(cosmeticPieces: string[], locale: Locale) {
    const urls: string[] = [];
    for (const cosmeticPieceId of cosmeticPieces) {
        const cosmeticPieceData = await getCosmeticDataById(cosmeticPieceId, locale);

        if (cosmeticPieceData) {
            urls.push(combineBaseUrlWithPath(cosmeticPieceData.IconFilePathList));
        }
    }

    return urls;
}

async function combineImages(imageUrls: string[]): Promise<Buffer> {
    const imageBuffers: Buffer[] = await Promise.all(
        imageUrls.map(async(url) => {
            try {
                const response = await axios.get(url, { responseType: 'arraybuffer' });
                return Buffer.from(response.data);
            } catch (error) {
                console.error(`Error fetching image from ${url}:`, error);
                throw error;
            }
        })
    );

    const images = await Promise.all(imageBuffers.map(buffer => loadImage(buffer)));

    const totalWidth = images.reduce((sum, img) => sum + img.width, 0);
    const maxHeight = Math.max(...images.map(img => img.height));

    const canvas = createCanvas(totalWidth, maxHeight);
    const ctx = canvas.getContext('2d');

    let currentX = 0;
    for (const img of images) {
        ctx.drawImage(img, currentX, 0);
        currentX += img.width;
    }

    return canvas.toBuffer('image/png');
}