import { ButtonInteraction } from 'discord.js';
import { getCosmeticData } from '../services/cosmeticService';
import { combineImages, getCosmeticPiecesImage } from "../commands/cosmeticCommand";

export async function handleButtonInteraction(interaction: ButtonInteraction) {
    if (!interaction.deferred) await interaction.deferUpdate();

    if (interaction.customId === 'view_outfit_pieces') {
        const cosmeticData = getCosmeticData(<string>interaction.message.embeds[0].title);

        if (cosmeticData) {
            const outfitPieces = getCosmeticPiecesImage(cosmeticData.OutfitItems);
            const combinedImageBuffer = await combineImages(outfitPieces);

            await interaction.followUp({
                content: 'Here are the outfit pieces:',
                files: [{ attachment: combinedImageBuffer, name: 'combined-image.png' }],
                ephemeral: true,
            });
        } else {
            await interaction.reply({ content: 'Error retrieving cosmetic data.', ephemeral: true });
        }
    }
}