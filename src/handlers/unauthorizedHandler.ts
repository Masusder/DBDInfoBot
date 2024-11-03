import {
    ButtonInteraction,
    EmbedBuilder
} from "discord.js";

export async function sendUnauthorizedMessage(interaction: ButtonInteraction) {
    const embed = new EmbedBuilder()
        .setColor('Red')
        .setDescription(':x: Only the person who used the command can do that.');

    await interaction.reply({ embeds: [embed], ephemeral: true });
}