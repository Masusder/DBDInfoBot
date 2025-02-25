import { ButtonInteraction } from 'discord.js';
import { viewOutfitPiecesHandler } from '@commands/info/cosmetic/handlers/viewOutfitPiecesHandler';
import { showCharacterBackstoryHandler } from "@commands/info/character/handlers/showCharacterBackstoryHandler";
import { globalStatsTabHandler } from "@commands/stats/global/handlers/globalStatsTabHandler";
import { characterHintsHandler } from "@commands/info/character/handlers/characterHintsHandler";
import { riftTierHandler } from "@commands/info/rift/handlers/riftTierHandler";
import { handlePerkButtonInteraction, } from "@commands/info/perk";
import { cosmeticHandler } from "@commands/info/cosmetic/handlers/cosmeticHandler";

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
        case 'show_character_hints':
            await characterHintsHandler(interaction);
            break;
        case 'shrine_perk':
            await handlePerkButtonInteraction(interaction);
            break;
        case 'global_stats_tab':
            await globalStatsTabHandler(interaction);
            break;
        case 'rift_tier':
            await riftTierHandler(interaction);
            break;
        case 'cosmetic_item':
            await cosmeticHandler(interaction);
            break;
        default:
            console.warn(`Unhandled interaction type: ${interaction.customId}`);
            break;
    }
}