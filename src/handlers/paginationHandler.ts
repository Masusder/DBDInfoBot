import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonInteraction,
    ButtonStyle,
    EmbedBuilder,
    Message
} from "discord.js";

export interface IPaginationOptions {
    items: any[];
    itemsPerPage: number;
    generateEmbed: (pageItems: any[], currentPage: number, totalPages: number) => EmbedBuilder;
    interactionUserId: string;
    interactionReply: Message;
}

export const generatePaginationButtons = (page: number, totalPages: number) => {
    return new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
            .setCustomId('pagination::first')
            .setLabel('First')
            .setStyle(ButtonStyle.Primary)
            .setDisabled(page === 1),
        new ButtonBuilder()
            .setCustomId('pagination::previous')
            .setLabel('Previous')
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(page === 1),
        new ButtonBuilder()
            .setCustomId(`pagination::current::${page}::${totalPages}`)
            .setLabel(`Page ${page} of ${totalPages}`)
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(true),
        new ButtonBuilder()
            .setCustomId('pagination::next')
            .setLabel('Next')
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(page === totalPages),
        new ButtonBuilder()
            .setCustomId('pagination::last')
            .setLabel('Last')
            .setStyle(ButtonStyle.Primary)
            .setDisabled(page === totalPages)
    );
};

export async function paginationHandler(options: IPaginationOptions) {
    const { items, itemsPerPage, generateEmbed, interactionUserId, interactionReply } = options;

    let currentPage = 1;
    const totalPages = Math.ceil(items.length / itemsPerPage);

    const getItemsForPage = (page: number) => {
        const start = (page - 1) * itemsPerPage;
        return items.slice(start, start + itemsPerPage);
    };

    await interactionReply.edit({
        embeds: [generateEmbed(getItemsForPage(currentPage), currentPage, totalPages)],
        components: [generatePaginationButtons(currentPage, totalPages)],
    });

    const collector = interactionReply.createMessageComponentCollector({
        filter: (i): i is ButtonInteraction => i.isButton() && i.user.id === interactionUserId,
        time: 60000,
    });

    collector.on('collect', async (interaction: ButtonInteraction) => {
        const [action, paginationType] = interaction.customId.split('::');

        if (action === 'pagination') {
            if (paginationType === 'first') currentPage = 1;
            else if (paginationType === 'previous') currentPage = Math.max(1, currentPage - 1);
            else if (paginationType === 'next') currentPage = Math.min(totalPages, currentPage + 1);
            else if (paginationType === 'last') currentPage = totalPages;

            await interaction.update({
                embeds: [generateEmbed(getItemsForPage(currentPage), currentPage, totalPages)],
                components: [generatePaginationButtons(currentPage, totalPages)],
            });
        }
    });

    collector.on('end', async () => {
        await interactionReply.edit({ components: [] });
    });
}