import {

    StringSelectMenuInteraction
} from 'discord.js';
import { handleSelectMenu } from "@commands/newsCommand";


export default async(interaction: StringSelectMenuInteraction) => {
    if (!interaction.deferred) await interaction.deferUpdate();

    const [action] = interaction.customId.split('::');

    switch (action) {
        case 'select_news_article':
            await handleSelectMenu(interaction);
            break;
        default:
            console.warn(`Unhandled interaction type: ${interaction.customId}`);
            break;
    }
}