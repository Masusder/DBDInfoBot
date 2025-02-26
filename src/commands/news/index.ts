import i18next from "i18next";
import { SlashCommandBuilder } from "@discordjs/builders";
import {
    ChatInputCommandInteraction,
    EmbedBuilder,
    Locale,
    NewsChannel,
    StringSelectMenuBuilder,
    StringSelectMenuOptionBuilder,
    TextChannel,
} from "discord.js";
import { getCachedNews } from "@services/newsService";
import { sendErrorMessage } from "@handlers/errorResponseHandler";
import {
    adjustForTimezone,
    generateCustomId,
    isValidData,
} from "@utils/stringUtils";
import {
    NewsData,
    NewsItem
} from "@tps/news";
import {
    commandLocalizationHelper,
    t
} from "@utils/localizationUtils";
import { ELocaleNamespace } from "@tps/enums/ELocaleNamespace";
import { paginationHandler } from "@handlers/paginationHandler";
import {
    sendInboxContent,
    sendNewsContent
} from "@commands/news/interactionData";
import logger from "@logger";

export const data = i18next.isInitialized
    ? new SlashCommandBuilder()
        .setName('news')
        .setNameLocalizations(commandLocalizationHelper('news_command.name'))
        .setDescription(i18next.t('news_command.description', { lng: 'en' }))
        .setDescriptionLocalizations(commandLocalizationHelper('news_command.description'))
        .setContexts([0, 1, 2])
        .setIntegrationTypes([0, 1])
    : undefined;

export async function execute(interaction: ChatInputCommandInteraction) {
    const locale = interaction.locale;

    try {
        await interaction.deferReply();

        const newsData: NewsData = await getCachedNews(locale);

        if (!isValidData(newsData)) {
            const message = t('news_command.error_retrieving_data', locale, ELocaleNamespace.Errors);
            await sendErrorMessage(interaction, message);
            return;
        }

        let newsList = newsData.news;
        newsList = newsList.sort((a: any, b: any) => {
            const dateA = new Date(adjustForTimezone(a.startDate));
            const dateB = new Date(adjustForTimezone(b.startDate));
            return dateB.getTime() - dateA.getTime(); // Newest first
        });

        const generateSelectMenu = (pageItems: NewsItem[]): StringSelectMenuBuilder => {
            const selectMenu = new StringSelectMenuBuilder()
                .setCustomId('select_news_article')
                .setPlaceholder(t('news_command.select_news_article', locale, ELocaleNamespace.Messages))
                .setMinValues(1)
                .setMaxValues(1);

            pageItems.forEach((newsItem, index: number) => {
                const option = new StringSelectMenuOptionBuilder()
                    .setLabel(newsItem.title || `${t('news_command.news', locale, ELocaleNamespace.Messages)} ${index + 1}`)
                    .setValue(newsItem.id.toString());
                selectMenu.addOptions(option);
            });

            return selectMenu;
        };

        const generateNewsListEmbed = (
            pageItems: any[],
            currentPage: number,
            totalPages: number
        ): EmbedBuilder => {
            const embed = new EmbedBuilder()
                .setFooter({
                    text: t('generic_pagination.page_number', locale, ELocaleNamespace.Messages, {
                        current_page: currentPage.toString(),
                        total_pages: totalPages.toString()
                    })
                });

            pageItems.forEach((newsItem, index) => {
                const formattedDate = new Date(adjustForTimezone(newsItem.startDate)).toLocaleDateString();
                embed.addFields({
                    name: `${index + 1}. ${newsItem.title}`,
                    value: `${t('news_command.published_on', locale, ELocaleNamespace.Messages)} ${formattedDate}`,
                    inline: true
                });
            });

            return embed;
        };

        await paginationHandler({
            items: newsList,
            itemsPerPage: 25,
            generateEmbed: generateNewsListEmbed,
            interactionUserId: interaction.user.id,
            interactionReply: interaction,
            locale: locale,
            generateSelectMenu
        });
    } catch (error) {
        logger.error("Error executing news command:", error);
    }
}

export async function batchSendNews(
    channel: TextChannel | NewsChannel,
    dispatchedNewsIds: string[],
    newsData: NewsData
) {
    try {
        const newsList = newsData.news;
        const inboxList = newsData.messages;

        for (const newsItem of newsList.filter(news => !dispatchedNewsIds.includes(news.id))) {
            await sendNewsContent(newsItem, channel, Locale.EnglishUS);
        }

        for (const inboxItem of inboxList.filter(inbox => !dispatchedNewsIds.includes(generateCustomId(inbox.received.toString())))) {
            await sendInboxContent(inboxItem, channel, Locale.EnglishUS);
        }
    } catch (error) {
        logger.error("Error executing batch news command:", error);
    }
}