import { ButtonInteraction, EmbedBuilder } from 'discord.js';
import { getCosmeticDataById } from '../services/cosmeticService';
import {
    combineImages,
    getCosmeticPiecesCombinedImage
} from '../commands/cosmeticCommand';
import { extractInteractionId } from '../utils/stringUtils';

export async function handleViewOutfitPieces(interaction: ButtonInteraction) {
    const cosmeticId = extractInteractionId(interaction.customId);

    if (!cosmeticId) {
        await interaction.followUp({ content: 'Invalid cosmetic ID.', ephemeral: true });
        return;
    }

    const cosmeticData = await getCosmeticDataById(cosmeticId);
    if (!cosmeticData) {
        await interaction.followUp({ content: 'Error retrieving cosmetic data.', ephemeral: true });
        return;
    }

    const outfitPieces = await getCosmeticPiecesCombinedImage(cosmeticData.OutfitItems);
    const combinedImageBuffer = await combineImages(outfitPieces);

    const embed = new EmbedBuilder()
        .setTitle(`Outfit Pieces for ${cosmeticData.CosmeticName}`)
        .setColor(interaction.message.embeds[0].color)
        .setImage('attachment://combined-outfit-pieces.png');

    for (const pieceId of cosmeticData.OutfitItems) {
        const pieceData = await getCosmeticDataById(pieceId);
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
        ephemeral: true,
    });
}