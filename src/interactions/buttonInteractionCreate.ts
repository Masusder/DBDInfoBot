import { ButtonInteraction } from 'discord.js';
import { viewOutfitPiecesHandler } from '../handlers/viewOutfitPiecesHandler';
import { showCharacterBackstoryHandler } from "../handlers/showCharacterBackstoryHandler";

export default async(interaction: ButtonInteraction) => {
    if (!interaction.deferred) await interaction.deferUpdate();

    const [action] = interaction.customId.split('::');

    switch (action) {
        case 'view_outfit_pieces':
            await viewOutfitPiecesHandler(interaction);
            break;
        case 'show_character_backstory':
            await showCharacterBackstoryHandler(interaction);
            break;
        default:
            console.warn(`Unhandled interaction type: ${interaction.customId}`);
            break;
    }
}