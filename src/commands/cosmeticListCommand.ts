import {
    ChatInputCommandInteraction,
    EmbedBuilder,
    SlashCommandBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ButtonInteraction,
} from "discord.js";
import { getCharacterIndexByName } from "../services/characterService";
import { getCosmeticListByCharacterIndex } from "../services/cosmeticService";

const COSMETICS_PER_PAGE = 5;

export const data = new SlashCommandBuilder()
    .setName('cosmetic_list')
    .setDescription('Check list of cosmetics for specific character')
    .addStringOption(option =>
        option
            .setName('character')
            .setDescription('Name of the character')
            .setAutocomplete(true)
            .setRequired(true)
    );

export async function execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply();

    const characterName = interaction.options.getString('character');
    const characterIndex = getCharacterIndexByName(characterName);

    if (characterIndex === undefined) {
        await interaction.editReply({ content: 'Character not found.' });
        return;
    }

    const cosmetics = getCosmeticListByCharacterIndex(characterIndex);
    if (cosmetics.length === 0) {
        await interaction.editReply({ content: 'No cosmetics found for this character.' });
        return;
    }
}
