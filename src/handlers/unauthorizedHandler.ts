import {
    ButtonInteraction,
    EmbedBuilder
} from "discord.js";

export async function sendUnauthorizedMessage(interaction: ButtonInteraction) {
    const embed = new EmbedBuilder()
        .setColor('Red')
        .setDescription(':x: Only the person who used the command can do that.');

    try {
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp({ embeds: [embed], ephemeral: true });
        } else {
            await interaction.reply({ embeds: [embed], ephemeral: true });
        }
    } catch (error) {
        console.error("Error sending unauthorized message:", error);
    }
}