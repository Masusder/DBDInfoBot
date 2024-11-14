import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonInteraction,
    ButtonStyle,
    EmbedBuilder,
    Locale,
    Message
} from "discord.js";
import { getTranslation } from "@utils/localizationUtils";
import { sendUnauthorizedMessage } from "./unauthorizedHandler";

export interface IPaginationOptions {
    items: any[];
    itemsPerPage: number;
    generateEmbed: (pageItems: any[], currentPage: number, totalPages: number) => EmbedBuilder | Promise<EmbedBuilder>;
    generateImage?: (pageItems: any[]) => Promise<Buffer>;
    interactionUserId: string;
    interactionReply: Message;
    timeout?: number;
    locale: Locale;
}

export const generatePaginationButtons = (page: number, totalPages: number, locale: Locale) => {
    return new ActionRowBuilder<ButtonBuilder>().addComponents(
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
};

export type TPaginationType = 'first' | 'previous' | 'next' | 'last';

export function determineNewPage(currentPage: number, paginationType: TPaginationType, totalPages: number): number {
    switch (paginationType) {
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

        let image: Buffer | undefined = undefined;
        if (generateImage) {
            image = await generateImage(itemsForPage);
            embed.setImage('attachment://generated_image.png');
        }

        await interactionReply.edit({
            embeds: [embed],
            components: [generatePaginationButtons(currentPage, totalPages, locale)],
            files: image ? [{ attachment: image, name: 'generated_image.png' }] : []
        });
    };

    await updatePageContent(options.locale);

    const collector = interactionReply.createMessageComponentCollector({
        filter: (i): i is ButtonInteraction => i.isButton(),
        time: options.timeout
    });

    collector.on('collect', async(interaction: ButtonInteraction) => {
        await interaction.deferUpdate();
        const locale = interaction.locale;
        const [action, paginationType] = interaction.customId.split('::');

        if (action === 'pagination') {
            if (interaction.user.id !== interactionUserId) {
                await sendUnauthorizedMessage(interaction);
                return;
            }

            currentPage = determineNewPage(currentPage, paginationType as TPaginationType, totalPages);

            await updatePageContent(locale);
        }
    });

    collector.on('end', async() => {
        try {
            await interactionReply.edit({ components: [] });
        } catch (error) {
            console.error("Error handling pagination ('end' event):", error);
        }
    });
}