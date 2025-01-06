import { ButtonInteraction } from 'discord.js';
import { viewOutfitPiecesHandler } from '@handlers/viewOutfitPiecesHandler';
import { showCharacterBackstoryHandler } from "@handlers/showCharacterBackstoryHandler";
import { handlePerkCommandInteraction } from "@commands/infoSubCommands/perk";
import { globalStatsTabHandler } from "@handlers/globalStatsTabHandler";
import { characterHintsHandler } from "@handlers/characterHintsHandler";
import { riftTierHandler } from "@handlers/riftTierHandler";

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
            await handlePerkCommandInteraction(interaction);
            break;
        case 'global_stats_tab':
            await globalStatsTabHandler(interaction);
            break;
        case 'rift_tier':
            await riftTierHandler(interaction);
            break;
        default:
            console.warn(`Unhandled interaction type: ${interaction.customId}`);
            break;
    }
}