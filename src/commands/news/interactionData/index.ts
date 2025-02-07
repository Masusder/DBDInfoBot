import {
    CallToAction,
    NewsData,
    NewsItem
} from "@tps/news";
import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ChatInputCommandInteraction,
    EmbedBuilder,
    Locale,
    MessageFlags,
    NewsChannel,
    StringSelectMenuInteraction,
    TextChannel
} from "discord.js";
import {
    adjustForTimezone,
    checkExistingImageUrl,
    combineBaseUrlWithPath,
    formatHtmlToDiscordMarkdown,
    splitTextIntoChunksBySentence,
    transformPackagedPath
} from "@utils/stringUtils";
import { t } from "@utils/localizationUtils";
import { ELocaleNamespace } from "@tps/enums/ELocaleNamespace";
import { INewsDataTable } from "../types";
import { createItemShowcaseImage, formatNewsLink, matchToEvent } from "../utils";
import publishMessage from "@utils/discord/publishMessage";
import pinMessage from "@utils/discord/pinMessage";

export async function createNewsEmbed(
    newsItem: NewsItem,
    textContent: string,
    imageUrl: string | null,
    isIdNeeded: boolean,
    isFirstEmbed: boolean = false,
    isLastChunk: boolean = false,
    locale: Locale,
    newsDataTable: INewsDataTable,
    isSticky: boolean
) {

    const embed = new EmbedBuilder()
        .setDescription(textContent)
        .setColor(newsDataTable.primaryColor)
        .setTimestamp(new Date(adjustForTimezone(newsItem.startDate)));

    if (isSticky) {
        embed.setAuthor({
            name: t('news_command.pinned_article', locale, ELocaleNamespace.Messages),
            iconURL: combineBaseUrlWithPath('/images/News/icon_PinnedMessage.png')
        });
    }

    if (isFirstEmbed) {
        embed.setTitle(newsItem.title || t('news_command.untitled_news', locale, ELocaleNamespace.Messages))
            .setThumbnail(newsDataTable.icon);
    }

    if (isIdNeeded && isLastChunk) {
        embed.setFooter({
            text: `ID: ${newsItem.id}`
        });
    }

    if (imageUrl) {
        embed.setImage(imageUrl);
    }

    return embed;
}

export function createNewsButton(callToAction: CallToAction, locale: Locale): ActionRowBuilder<ButtonBuilder> | null {
    let link = callToAction.link;
    link = formatNewsLink(link);

    if (!link || !link.startsWith('https')) return null;

    const button = new ButtonBuilder()
        .setLabel(callToAction.text || t('news_command.click_here', locale, ELocaleNamespace.Messages))
        .setStyle(ButtonStyle.Link)
        .setURL(link);

    return new ActionRowBuilder<ButtonBuilder>().addComponents(button);
}

export async function sendNewsContent(
    newsItem: NewsItem,
    interactionOrChannel: ChatInputCommandInteraction | StringSelectMenuInteraction | TextChannel | NewsChannel,
    locale: Locale
) {
    const formattedText = newsItem.newsContent?.content
        .map(content => content.text ? formatHtmlToDiscordMarkdown(content.text) : "")
        .join("\n\n");

    const textChunks = splitTextIntoChunksBySentence(formattedText, 4000);

    if (textChunks.length > 0) {
        const dynamicImage = newsItem.newsContent?.image?.uri;
        const packagedImage: string | null = newsItem.newsContent?.image?.packagedPath;
        const transformedPackagedImage = packagedImage ? transformPackagedPath(packagedImage) : null;
        const existingImage = await checkExistingImageUrl(dynamicImage, transformedPackagedImage);
        const isIdNeeded = interactionOrChannel instanceof TextChannel || interactionOrChannel instanceof NewsChannel;
        const callToAction = newsItem.newsContent?.callToAction;
        const eventId: string | null = newsItem?.metaData?.eventID || null;
        const isSticky = newsItem.metaData?.isSticky || false;

        const newsDataTable = matchToEvent(eventId);

        const firstEmbed = await createNewsEmbed(
            newsItem,
            textChunks[0],
            textChunks.length === 1 ? existingImage : null,
            isIdNeeded, true, textChunks.length === 1,
            locale,
            newsDataTable,
            isSticky
        );
        const actionRow = callToAction ? createNewsButton(callToAction, locale) : null;

        if (interactionOrChannel instanceof TextChannel || interactionOrChannel instanceof NewsChannel) {
            const message = await interactionOrChannel.send({
                embeds: [firstEmbed],
                components: actionRow && textChunks.length === 1 ? [actionRow] : []
            });

            // If pinning or publish fails that doesn't really matter
            if (isSticky) {
                await pinMessage(message);
            }

            if (interactionOrChannel instanceof NewsChannel) {
                publishMessage(message, interactionOrChannel).catch(error => {
                    console.error(`Failed to publish message:`, error);
                });
            }
        } else {
            await interactionOrChannel.followUp({
                embeds: [firstEmbed],
                components: actionRow && textChunks.length === 1 ? [actionRow] : [],
                flags: MessageFlags.Ephemeral
            });
        }

        for (let i = 1; i < textChunks.length; i++) {
            const isLastChunk = i === textChunks.length - 1;
            const followUpEmbed = await createNewsEmbed(
                newsItem,
                textChunks[i],
                isLastChunk ? existingImage : null,
                isIdNeeded, false,
                isLastChunk,
                locale,
                newsDataTable,
                false
            );

            if (interactionOrChannel instanceof TextChannel || interactionOrChannel instanceof NewsChannel) {
                const message = await interactionOrChannel.send({
                    embeds: [followUpEmbed],
                    components: actionRow && isLastChunk ? [actionRow] : []
                });

                if (interactionOrChannel instanceof NewsChannel) {
                    publishMessage(message, interactionOrChannel).catch(error => {
                        console.error(`Failed to publish message:`, error);
                    });
                }
            } else {
                await interactionOrChannel.followUp({
                    embeds: [followUpEmbed],
                    components: actionRow && isLastChunk ? [actionRow] : [],
                    flags: MessageFlags.Ephemeral
                });
            }
        }

        const itemShowcaseImage = await createItemShowcaseImage(newsItem.newsContent.content, locale);

        if (itemShowcaseImage) {
            const embed = new EmbedBuilder()
                .setTitle(`${newsItem.title} - ${t('news_command.showcased_items', locale, ELocaleNamespace.Messages)}`)
                .setDescription(t('news_command.items_featured_in_article', locale, ELocaleNamespace.Messages))
                .setColor(newsDataTable.secondaryColor)
                .setImage('attachment://news_showcase_items.png');

            if (interactionOrChannel instanceof TextChannel || interactionOrChannel instanceof NewsChannel) {
                const message = await interactionOrChannel.send({
                    embeds: [embed],
                    files: [
                        {
                            attachment: itemShowcaseImage,
                            name: 'news_showcase_items.png'
                        }
                    ]
                });

                if (interactionOrChannel instanceof NewsChannel) {
                    publishMessage(message, interactionOrChannel).catch(error => {
                        console.error(`Failed to publish message:`, error);
                    });
                }
            } else {
                await interactionOrChannel.followUp({
                    embeds: [embed],
                    files: [
                        {
                            attachment: itemShowcaseImage,
                            name: 'news_showcase_items.png'
                        }
                    ],
                    flags: MessageFlags.Ephemeral
                });
            }
        }
    }
}

export async function batchSendNews(
    channel: TextChannel | NewsChannel,
    dispatchedNewsIds: string[],
    newsData: NewsData
) {
    try {
        const newsList = newsData.news;

        for (const newsItem of newsList.filter(news => !dispatchedNewsIds.includes(news.id))) {
            await sendNewsContent(newsItem, channel, Locale.EnglishUS);
        }
    } catch (error) {
        console.error("Error executing batch news command:", error);
    }
}