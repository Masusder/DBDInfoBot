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
    CallToAction,
    ContentItem,
    NewsData,
    NewsItem
} from "@tps/news";
import Constants from "../constants";
import { CosmeticTypes } from "@data/CosmeticTypes";
import { combineImagesIntoGrid } from "@utils/imageUtils";
import { getCachedCosmetics } from "@services/cosmeticService";
import {
    commandLocalizationHelper,
    getTranslation
} from "@utils/localizationUtils";
import { ELocaleNamespace } from "@tps/enums/ELocaleNamespace";

export const data = i18next.isInitialized
    ? new SlashCommandBuilder()
        .setName('news')
        .setNameLocalizations(commandLocalizationHelper('news_command.name'))
        .setDescription(i18next.t('news_command.description', { lng: 'en' }))
        .setDescriptionLocalizations(commandLocalizationHelper('news_command.description'))
    : undefined;

export async function execute(interaction: ChatInputCommandInteraction) {
    const locale = interaction.locale;

    try {
        await interaction.deferReply();

        const newsData: NewsData = await getCachedNews(locale);

        if (!newsData || isEmptyObject(newsData)) {
            const message = getTranslation('news_command.error_retrieving_data', locale, ELocaleNamespace.Errors);
            await sendErrorMessage(interaction, message, false);
            return;
        }

        const newsList = newsData.news;
        const components: ActionRowBuilder<StringSelectMenuBuilder>[] = [];

        const selectMenu = new StringSelectMenuBuilder()
            .setCustomId('select_news_article')
            .setPlaceholder(getTranslation('news_command.select_news_article', locale, ELocaleNamespace.Messages))
            .setMinValues(1)
            .setMaxValues(1);

        newsList.forEach((newsItem, index) => {
            const option = new StringSelectMenuOptionBuilder()
                .setLabel(newsItem.title || `${getTranslation('news_command.news', locale, ELocaleNamespace.Messages)} ${index + 1}`)
                .setValue(newsItem.id.toString());
            selectMenu.addOptions(option);
        });

        components.push(new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(selectMenu));

        const embed = new EmbedBuilder();
        newsList.forEach((newsItem, index) => {
            if (newsItem.title) {
                embed.addFields({
                    name: `${index + 1}. ${newsItem.title}`,
                    value: `${getTranslation('news_command.published_on', locale, ELocaleNamespace.Messages)} ${new Date(adjustForTimezone(newsItem.startDate)).toLocaleDateString()}`,
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
        const message = getTranslation('news_command.failed_retrieving_article', locale, ELocaleNamespace.Errors);
        await sendErrorMessage(interaction, message, false);
    }
}

// endregion

// region Helpers/Utils
async function createNewsEmbed(
    newsItem: NewsItem,
    textContent: string,
    imageUrl: string | null,
    isIdNeeded: boolean,
    isFirstEmbed: boolean = false,
    isLastChunk: boolean = false,
    locale: Locale) {
    const embed = new EmbedBuilder()
        .setDescription(textContent)
        .setColor(Constants.DEFAULT_DISCORD_COLOR)
        .setTimestamp(new Date(adjustForTimezone(newsItem.startDate)));

    if (isFirstEmbed) {
        embed.setTitle(newsItem.title || getTranslation('news_command.untitled_news', locale, ELocaleNamespace.Messages)).setThumbnail(combineBaseUrlWithPath('/images/UI/Icons/ItemAddons/Kepler/iconAddon_OldNewspaper.png'));
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

function createNewsButton(callToAction: CallToAction, locale: Locale): ActionRowBuilder<ButtonBuilder> | null {
    let link = callToAction.link;
    link = formatNewsLink(link);

    if (!link || !link.startsWith('https')) return null;

    const button = new ButtonBuilder()
        .setLabel(callToAction.text || getTranslation('news_command.click_here', locale, ELocaleNamespace.Messages))
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
        const packagedImage: string | null = newsItem.newsContent?.image?.packagedPath;
        const transformedPackagedImage = packagedImage ? transformPackagedPath(packagedImage) : null;
        const existingImage = await checkExistingImageUrl(dynamicImage, transformedPackagedImage);
        const isIdNeeded = interactionOrChannel instanceof TextChannel || interactionOrChannel instanceof NewsChannel;
        const callToAction = newsItem.newsContent?.callToAction;

        const firstEmbed = await createNewsEmbed(
            newsItem,
            textChunks[0],
            textChunks.length === 1 ? existingImage : null,
            isIdNeeded, true, textChunks.length === 1, locale
        );
        const actionRow = callToAction ? createNewsButton(callToAction, locale) : null;

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
            const followUpEmbed = await createNewsEmbed(
                newsItem,
                textChunks[i],
                isLastChunk ? existingImage : null,
                isIdNeeded, false,
                isLastChunk,
                locale
            );

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
                .setTitle(`${newsItem.title} - ${getTranslation('news_command.showcased_items', locale, ELocaleNamespace.Messages)}`)
                .setDescription(getTranslation('news_command.items_featured_in_article', locale, ELocaleNamespace.Messages))
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
    const cosmeticData = await getCachedCosmetics(locale);

    let cosmeticIds: string[] = [];
    for (const item of content) {
        if (item.type === 'ItemShowcase' && item.showcasedItem) {
            for (const showcasedItem of item.showcasedItem) {
                const cosmetic = cosmeticData[showcasedItem.id];
                if (cosmetic && CosmeticTypes[cosmetic.Type]) { // Make sure we have valid type
                    cosmeticIds.push(showcasedItem.id);
                }
            }
        }
    }

    if (cosmeticIds.length === 0) return null;

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