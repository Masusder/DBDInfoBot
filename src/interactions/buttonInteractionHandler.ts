import { ButtonInteraction } from 'discord.js';
import { viewOutfitPiecesHandler } from '../handlers/viewOutfitPiecesHandler';

export async function handleButtonInteraction(interaction: ButtonInteraction) {
    if (!interaction.deferred) await interaction.deferUpdate();

    const [action] = interaction.customId.split('::');

    switch (action) {
        case 'view_outfit_pieces':
            await viewOutfitPiecesHandler(interaction);
            break;
        default:
            console.warn(`Unhandled interaction type: ${interaction.customId}`);
            break;
    }
}