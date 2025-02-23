import {
    CallToAction,
    InboxItem,
    MessageBody,
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
    checkExistingImageUrl,
    formatHtmlToDiscordMarkdown,
    generateCustomId,
    splitTextIntoChunksBySentence,
    transformPackagedPath
} from "@utils/stringUtils";
import { t } from "@utils/localizationUtils";
import { ELocaleNamespace } from "@tps/enums/ELocaleNamespace";
import {
    createInboxShowcaseImage,
    createItemShowcaseImage,
    formatNewsLink,
    matchToEvent
} from "../utils";
import publishMessage from "@utils/discord/publishMessage";
import pinMessage from "@utils/discord/pinMessage";
import createNewsEmbed from "@commands/news/interactionData/news/embed";
import createInboxEmbed from "@commands/news/interactionData/inbox/embed";

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
                pinMessage(message).catch(error => {
                    console.error(`Failed to pin message:`, error);
                });
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

async function sendInboxContent(
    inboxItem: InboxItem,
    channel: TextChannel | NewsChannel,
    locale: Locale
): Promise<void> {
    const messageBody: MessageBody = JSON.parse(inboxItem.message.body);

    const embed = createInboxEmbed(inboxItem, messageBody);

    const inboxShowcaseImage = await createInboxShowcaseImage(messageBody.sections, locale);

    const actionRow = messageBody.callToAction ? createNewsButton(messageBody.callToAction, locale) : null;

    const message = await channel.send({
        embeds: [embed],
        files: inboxShowcaseImage ? [{
            attachment: inboxShowcaseImage,
            name: 'inbox_showcase_items.png'
        }] : [],
        components: actionRow ? [actionRow] : []
    });

    if (channel instanceof NewsChannel) {
        publishMessage(message, channel).catch(error => {
            console.error(`Failed to publish message:`, error);
        });
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
        console.error("Error executing batch news command:", error);
    }
}