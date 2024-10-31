import { ButtonInteraction, EmbedBuilder } from 'discord.js';
import { getCosmeticDataByName, getCosmeticDataById } from '../services/cosmeticService';
import { combineImages, getCosmeticPiecesCombinedImage } from "../commands/cosmeticCommand";
import { extractCosmeticId } from "../utils/stringUtils";

export async function handleButtonInteraction(interaction: ButtonInteraction) {
    if (!interaction.deferred) await interaction.deferUpdate();

    if (interaction.customId.startsWith('view_outfit_pieces::')) {
        const cosmeticId = extractCosmeticId(interaction.customId);

        if (!cosmeticId) {
            await interaction.followUp({ content: 'Invalid cosmetic ID.', ephemeral: true });
            return;
        }

        const cosmeticData = getCosmeticDataById(cosmeticId);
        if (cosmeticData) {
            const outfitPieces = getCosmeticPiecesCombinedImage(cosmeticData.OutfitItems);
            const combinedImageBuffer = await combineImages(outfitPieces);

            const embed = new EmbedBuilder()
                .setTitle(`Outfit Pieces for ${cosmeticData.CosmeticName}`)
                .setColor(interaction.message.embeds[0].color)
                .setImage('attachment://combined-outfit-pieces.png');

            for (const pieceId of cosmeticData.OutfitItems) {
                const pieceData = getCosmeticDataById(pieceId);

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
        } else {
            await interaction.followUp({ content: 'Error retrieving cosmetic data.', ephemeral: true });
        }
    }
    }