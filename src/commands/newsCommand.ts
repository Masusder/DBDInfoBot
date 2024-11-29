import i18next from "i18next";
import { SlashCommandBuilder } from "@discordjs/builders";
import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ChatInputCommandInteraction,
    EmbedBuilder,
    Locale,
    NewsChannel,
    StringSelectMenuBuilder,
    StringSelectMenuInteraction,
    StringSelectMenuOptionBuilder,
    TextChannel
} from "discord.js";
import { getCachedNews } from "@services/newsService";
import { sendErrorMessage } from "@handlers/errorResponseHandler";
import {
    adjustForTimezone,
    checkExistingImageUrl,
    combineBaseUrlWithPath,
    formatHtmlToDiscordMarkdown,
    splitTextIntoChunksBySentence,
    transformPackagedPath
} from "@utils/stringUtils";
import {
    ContentItem,
    NewsData,
    NewsItem
} from "@tps/news";
import Constants from "../constants";
import { CosmeticTypes } from "@data/CosmeticTypes";
import { combineImagesIntoGrid } from "@utils/imageUtils";
import { getCachedCosmetics } from "@services/cosmeticService";

export const data = i18next.isInitialized
    ? new SlashCommandBuilder()
        .setName('news') // TODO: localize
        .setDescription("Retrieve latest in-game news.") // TODO: localize
    : undefined;

export async function execute(interaction: ChatInputCommandInteraction) {
    const locale = interaction.locale;

    try {
        await interaction.deferReply();

        const newsData: NewsData = await getCachedNews(locale);

        if (!newsData || isEmptyObject(newsData)) {
            const message = "Failed to retrieve latest news."; // TODO: localize
            await sendErrorMessage(interaction, message);
            return;
        }

        const newsList = newsData.news;
        const components: ActionRowBuilder<StringSelectMenuBuilder>[] = [];

        const selectMenu = new StringSelectMenuBuilder()
            .setCustomId('select_news_article')
            .setPlaceholder('Select a news article') // TODO: localize
            .setMinValues(1)
            .setMaxValues(1);

        newsList.forEach((newsItem, index) => {
            const option = new StringSelectMenuOptionBuilder()
                .setLabel(newsItem.title || `News ${index + 1}`) // TODO: localize
                .setValue(newsItem.id.toString());
            selectMenu.addOptions(option);
        });

        components.push(new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(selectMenu));

        const embed = new EmbedBuilder();
        newsList.forEach((newsItem, index) => {
            if (newsItem.title) {
                embed.addFields({
                    name: `${index + 1}. ${newsItem.title}`,
                    value: `Published on: ${new Date(adjustForTimezone(newsItem.startDate)).toLocaleDateString()}`, // TODO: localize
                    inline: true
                });
            }
        });

        await interaction.editReply({
            embeds: [embed],
            components: components
        });
    } catch (error) {
        console.error("Error executing news command:", error);
    }
}

// region Handlers
export async function handleSelectMenu(interaction: StringSelectMenuInteraction) {
    const selectedNewsId = interaction.values[0];
    const locale = interaction.locale;

    const newsData: NewsData = await getCachedNews(locale);
    const selectedNewsItem = newsData?.news.find(item => item.id.toString() === selectedNewsId);

    if (selectedNewsItem) {
        await sendNewsContent(selectedNewsItem, interaction, locale);
    } else {
        await interaction.reply({
            content: "Failed to retrieve the selected news article.", // TODO: localize
            ephemeral: true
        });
    }
}

// endregion

// region Helpers/Utils
async function createNewsEmbed(newsItem: NewsItem, textContent: string, imageUrl: string | null, isIdNeeded: boolean, isFirstEmbed: boolean = false, isLastChunk: boolean = false) {
    const embed = new EmbedBuilder()
        .setDescription(textContent)
        .setColor(Constants.DEFAULT_DISCORD_COLOR)
        .setTimestamp(new Date(adjustForTimezone(newsItem.startDate)));

    if (isFirstEmbed) {
        embed.setTitle(newsItem.title || "Untitled News").setThumbnail(combineBaseUrlWithPath('/images/UI/Icons/ItemAddons/Kepler/iconAddon_OldNewspaper.png')); // TODO: localize
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

function createNewsButton(callToAction: { text: string; link: string }): ActionRowBuilder<ButtonBuilder> | null {
    let link = callToAction.link;
    link = formatNewsLink(link);

    if (!link || !link.startsWith('https')) return null;

    const button = new ButtonBuilder()
        .setLabel(callToAction.text || 'Click here') // TODO: localize
        .setStyle(ButtonStyle.Link)
        .setURL(link);

    return new ActionRowBuilder<ButtonBuilder>().addComponents(button);
}

async function sendNewsContent(newsItem: NewsItem, interactionOrChannel: ChatInputCommandInteraction | StringSelectMenuInteraction | TextChannel | NewsChannel, locale: Locale) {
    const formattedText = newsItem.newsContent?.content
        .map(content => content.text ? formatHtmlToDiscordMarkdown(content.text) : "")
        .join("\n\n");

    const textChunks = splitTextIntoChunksBySentence(formattedText, 4000);

    if (textChunks.length > 0) {
        const dynamicImage = newsItem.newsContent?.image?.uri;
        const packagedImage = newsItem.newsContent?.image?.packagedPath;
        const transformedPackagedImage = transformPackagedPath(packagedImage);
        const existingImage = await checkExistingImageUrl(dynamicImage, transformedPackagedImage);
        const isIdNeeded = interactionOrChannel instanceof TextChannel || interactionOrChannel instanceof NewsChannel;
        const callToAction = newsItem.newsContent?.callToAction;

        const firstEmbed = await createNewsEmbed(newsItem, textChunks[0], textChunks.length === 1 ? existingImage : null, isIdNeeded, true, textChunks.length === 1);
        const actionRow = callToAction ? createNewsButton(callToAction) : null;

        // Check if interactionOrChannel is an interaction or a channel
        if (interactionOrChannel instanceof TextChannel || interactionOrChannel instanceof NewsChannel) {
            await interactionOrChannel.send({
                embeds: [firstEmbed],
                components: actionRow && textChunks.length === 1 ? [actionRow] : []
            });
        } else {
            await interactionOrChannel.followUp({
                embeds: [firstEmbed],
                components: actionRow && textChunks.length === 1 ? [actionRow] : [],
                ephemeral: true
            });
        }

        for (let i = 1; i < textChunks.length; i++) {
            const isLastChunk = i === textChunks.length - 1;
            const followUpEmbed = await createNewsEmbed(newsItem, textChunks[i], isLastChunk ? existingImage : null, isIdNeeded, false, isLastChunk);

            if (interactionOrChannel instanceof TextChannel || interactionOrChannel instanceof NewsChannel) {
                await interactionOrChannel.send({
                    embeds: [followUpEmbed],
                    components: actionRow && isLastChunk ? [actionRow] : []
                });
            } else {
                await interactionOrChannel.followUp({
                    embeds: [followUpEmbed],
                    components: actionRow && isLastChunk ? [actionRow] : [],
                    ephemeral: true
                });
            }
        }

        const itemShowcaseImage = await createItemShowcaseImage(newsItem.newsContent.content, locale);

        if (itemShowcaseImage) {
            const embed = new EmbedBuilder()
                .setTitle(`${newsItem.title} - Showcased Items`) // TODO: localize
                .setDescription("These items are featured in the associated news article:") // TODO: localize
                .setColor(0x1e90ff)
                .setImage('attachment://news_showcase_items.png')

            if (interactionOrChannel instanceof TextChannel || interactionOrChannel instanceof NewsChannel) {
                await interactionOrChannel.send({
                    embeds: [embed],
                    files: [
                        {
                            attachment: itemShowcaseImage,
                            name: 'news_showcase_items.png'
                        }
                    ],
                });
            } else {
                await interactionOrChannel.followUp({
                    embeds: [embed],
                    files: [
                        {
                            attachment: itemShowcaseImage,
                            name: 'news_showcase_items.png'
                        }
                    ],
                    ephemeral: true
                });
            }
        }
    }
}

export async function batchSendNews(channel: TextChannel | NewsChannel, dispatchedNewsIds: string[], newsData: NewsData) {
    try {
        const newsList = newsData.news;

        for (const newsItem of newsList.filter(news => !dispatchedNewsIds.includes(news.id))) {
            await sendNewsContent(newsItem, channel, Locale.EnglishUS);
        }
    } catch (error) {
        console.error("Error executing batch news command:", error);
    }
}

function formatNewsLink(link: string): string {
    if (link.startsWith('https')) {
        return link;
    }

    if (link.startsWith("dbd://StoreCollections")) {
        const regex = /collectionId=([^&]+)/;
        const match = link.match(regex);

        if (match && match[1]) {
            const collectionId = match[1];
            return combineBaseUrlWithPath(`/store/collections/${collectionId}`);
        }
    }

    if (link.startsWith("dbd://StoreSpecials")) {
        // noinspection SpellCheckingInspection
        return combineBaseUrlWithPath('/store/cosmetics?filter=%7B%22IsDiscounted%22%3Atrue%7D');
    }

    return link;
}

async function createItemShowcaseImage(content: ContentItem[], locale: Locale): Promise<Buffer | null> {
    let cosmeticIds: string[] = [];
    for (const item of content) {
        if (item.type === 'ItemShowcase' && item.showcasedItem) {
            for (const showcasedItem of item.showcasedItem) {
                if (CosmeticTypes[showcasedItem.type]) { // Make sure we have valid type
                    cosmeticIds.push(showcasedItem.id);
                }
            }
        }
    }

    if (cosmeticIds.length === 0) return null;

    const cosmeticData = await getCachedCosmetics(locale);

    const imageUrls: string[] = [];
    for (const id of cosmeticIds) {
        const cosmeticItem = cosmeticData[id];

        if (cosmeticItem && cosmeticItem.IconFilePathList) {
            imageUrls.push(combineBaseUrlWithPath(cosmeticItem.IconFilePathList));
        }
    }

    if (imageUrls.length > 0) {
        return await combineImagesIntoGrid(imageUrls, 5, 10);
    }

    return null;
}

export function isEmptyObject(obj: any): boolean {
    return obj && typeof obj === 'object' && Object.keys(obj).length === 0;
}

// endregion