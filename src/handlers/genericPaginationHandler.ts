import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonInteraction,
    ButtonStyle,
    ChatInputCommandInteraction,
    EmbedBuilder,
    Locale
} from "discord.js";
import { getTranslation } from "@utils/localizationUtils";
import { sendUnauthorizedMessage } from "./unauthorizedHandler";

export interface IPaginationOptions {
    items: any[];
    itemsPerPage: number;
    generateEmbed: (pageItems: any[], currentPage: number, totalPages: number) => EmbedBuilder | Promise<EmbedBuilder>;
    generateImage?: (pageItems: any[]) => Promise<Buffer>;
    interactionUserId: string;
    interactionReply: ChatInputCommandInteraction | ButtonInteraction;
    timeout?: number;
    locale: Locale;
    showPageNumbers?: boolean;
}

export const generatePaginationButtons = (page: number, totalPages: number, locale: Locale, showPageNumbers: boolean = true) => {
    const actionRow1 = new ActionRowBuilder<ButtonBuilder>();
    const actionRow2 = new ActionRowBuilder<ButtonBuilder>();
    const actionRow3 = new ActionRowBuilder<ButtonBuilder>();

    actionRow1.addComponents(
        new ButtonBuilder()
            .setCustomId('pagination::first')
            .setLabel(getTranslation('generic_pagination.first', locale, 'messages'))
            .setStyle(ButtonStyle.Primary)
            .setDisabled(page === 1),
        new ButtonBuilder()
            .setCustomId('pagination::previous')
            .setLabel(getTranslation('generic_pagination.previous', locale, 'messages'))
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(page === 1),
        new ButtonBuilder()
            .setCustomId(`pagination::current::${page}::${totalPages}`)
            .setLabel(`${getTranslation('generic_pagination.page_number.0', locale, 'messages')} ${page} ${getTranslation('generic_pagination.page_number.1', locale, 'messages')} ${totalPages}`)
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(true),
        new ButtonBuilder()
            .setCustomId('pagination::next')
            .setLabel(getTranslation('generic_pagination.next', locale, 'messages'))
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(page === totalPages),
        new ButtonBuilder()
            .setCustomId('pagination::last')
            .setLabel(getTranslation('generic_pagination.last', locale, 'messages'))
            .setStyle(ButtonStyle.Primary)
            .setDisabled(page === totalPages)
    );

    if (showPageNumbers && totalPages > 1) {
        const pagesToShow = 10;
        const startPage = Math.max(1, page - Math.floor(pagesToShow / 2));
        const endPage = Math.min(totalPages, startPage + pagesToShow - 1);

        const pageButtons = [];
        for (let i = startPage; i <= endPage; i++) {
            pageButtons.push(
                new ButtonBuilder()
                    .setCustomId(`pagination::page::${i}`)
                    .setLabel(i.toString())
                    .setStyle(ButtonStyle.Secondary)
                    .setDisabled(i === page)
            );
        }

        // Split the page buttons into two action rows (5 buttons per row)
        // This is required as Discord has limit of 5 component items
        const firstRowPageButtons = pageButtons.slice(0, 5);
        const secondRowPageButtons = pageButtons.slice(5, 10);

        firstRowPageButtons.forEach((button) => actionRow2.addComponents(button));
        secondRowPageButtons.forEach((button) => actionRow3.addComponents(button));
    }

    const components = [actionRow1];
    if (actionRow3.components.length > 0) components.unshift(actionRow3);
    if (actionRow2.components.length > 0) components.unshift(actionRow2);

    return components;
};

export type TPaginationType = 'page' | 'first' | 'previous' | 'next' | 'last';

export function determineNewPage(currentPage: number, paginationType: TPaginationType, totalPages: number, pageNumber: string): number {
    switch (paginationType) {
        case 'page':
            return parseInt(pageNumber, 10);
        case 'first':
            return 1;
        case 'previous':
            return Math.max(1, currentPage - 1);
        case 'next':
            return Math.min(totalPages, currentPage + 1);
        case 'last':
            return totalPages;
        default:
            return currentPage; // Fallback, shouldn't happen
    }
}

export async function genericPaginationHandler(options: IPaginationOptions) {
    const { items, itemsPerPage, generateEmbed, generateImage, interactionUserId, interactionReply } = options;

    let currentPage = 1;
    const totalPages = Math.ceil(items.length / itemsPerPage);

    const getItemsForPage = (page: number) => {
        const start = (page - 1) * itemsPerPage;
        return items.slice(start, start + itemsPerPage);
    };

    const updatePageContent = async(locale: Locale) => {
        const itemsForPage = getItemsForPage(currentPage);
        const embed = await generateEmbed(itemsForPage, currentPage, totalPages);

        const response = await interactionReply.editReply({
            embeds: [embed],
            components: generatePaginationButtons(currentPage, totalPages, locale, options?.showPageNumbers),
            files: []
        });

        if (generateImage) {
            try {
                const image = await generateImage(itemsForPage);
                if (image) {
                    embed.setImage('attachment://generated_image.png');
                    await interactionReply.editReply({
                        embeds: [embed],
                        files: [{ attachment: image, name: 'generated_image.png' }],
                    });
                }
            } catch (error) {
                console.error("Error generating image:", error);
            }
        }

        return response;
    };

    const message = await updatePageContent(options.locale);

    const collector = message.createMessageComponentCollector({
        filter: (i): i is ButtonInteraction => i.isButton(),
        time: options.timeout
    });

    collector.on('collect', async(interaction: ButtonInteraction) => {
        try {
            await interaction.deferUpdate();
            const locale = interaction.locale;
            const [action, paginationType, pageNumber] = interaction.customId.split('::');

            if (action === 'pagination') {
                if (interaction.user.id !== interactionUserId) {
                    await sendUnauthorizedMessage(interaction);
                    return;
                }

                currentPage = determineNewPage(currentPage, paginationType as TPaginationType, totalPages, pageNumber);

                await updatePageContent(locale);
            }
        } catch (error) {
            console.error("Error handling pagination:", error);
        }
    });

    collector.on('end', async() => {
        try {
            await interactionReply.editReply({ components: [] });
        } catch (error) {
            console.error("Error handling pagination ('end' event):", error);
        }
    });
}