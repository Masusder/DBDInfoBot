// import i18next from "i18next";
// import { SlashCommandBuilder } from "@discordjs/builders";
// import {
//     ActionRowBuilder,
//     ChatInputCommandInteraction,
//     EmbedBuilder,
//     Locale,
//     StringSelectMenuBuilder,
//     StringSelectMenuInteraction,
//     StringSelectMenuOptionBuilder,
//     TextChannel
// } from "discord.js";
// import { getCachedNews } from "@services/newsService";
// import { sendErrorMessage } from "@handlers/errorResponseHandler";
// import {
//     adjustForTimezone,
//     checkExistingImageUrl,
//     formatHtmlToDiscordMarkdown,
//     transformPackagedPath
// } from "@utils/stringUtils";
// import { NewsData } from "@tps/news";
//
// export const data = i18next.isInitialized
//     ? new SlashCommandBuilder()
//         .setName('news')
//         // .setNameLocalizations(commandLocalizationHelper('shrine_command.name'))
//         .setDescription("Retrieve latest in-game news.")
//     // .setDescriptionLocalizations(commandLocalizationHelper('shrine_command.description'))
//     : undefined;
//
// export async function execute(interaction: ChatInputCommandInteraction) {
//     const locale = interaction.locale;
//
//     try {
//         await interaction.deferReply();
//
//         const newsData: NewsData = await getCachedNews(locale);
//
//         if (!newsData || isEmptyObject(newsData)) {
//             const message = "Failed to retrieve latest news.";
//             await sendErrorMessage(interaction, message);
//             return;
//         }
//
//         const newsList = newsData.news;
//         const components: ActionRowBuilder<StringSelectMenuBuilder>[] = [];
//
//         const selectMenu = new StringSelectMenuBuilder()
//             .setCustomId('select_news_article')
//             .setPlaceholder('Select a news article')
//             .setMinValues(1)
//             .setMaxValues(1);
//
//         newsList.forEach((newsItem, index: number) => {
//             const option = new StringSelectMenuOptionBuilder()
//                 .setLabel(newsItem.title || `News ${index + 1}`)
//                 .setValue(newsItem.id.toString());
//             selectMenu.addOptions(option);
//         });
//
//         components.push(new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(selectMenu));
//
//         const embed = new EmbedBuilder();
//         newsList.forEach((newsItem, index: number) => {
//             if (newsItem.title) {
//                 embed.addFields({
//                     name: `${index + 1}. ${newsItem.title}`,
//                     value: `Published on: ${new Date(adjustForTimezone(newsItem.startDate)).toLocaleDateString()}`,
//                     inline: true
//                 });
//             }
//         });
//
//         await interaction.editReply({
//             embeds: [embed],
//             components: components
//         });
//     } catch (error) {
//         console.error("Error executing news command:", error);
//     }
// }
//
// export async function handleSelectMenu(interaction: StringSelectMenuInteraction) {
//     const selectedNewsId = interaction.values[0];
//     const locale = interaction.locale;
//
//     const newsData: NewsData = await getCachedNews(locale);
//     const selectedNewsItem = newsData?.news.find(item => item.id.toString() === selectedNewsId);
//
//     if (selectedNewsItem) {
//         const formattedText = selectedNewsItem.newsContent?.content
//             .map(content => content.text ? formatHtmlToDiscordMarkdown(content.text) : "")
//             .join("\n\n");
//
//         const embed = new EmbedBuilder()
//             .setTitle(selectedNewsItem.title)
//             .setFooter({
//                 text: `Article available from: ${new Date(adjustForTimezone(selectedNewsItem.startDate)).toLocaleDateString()} to ${new Date(adjustForTimezone(selectedNewsItem.endDate)).toLocaleDateString()}`
//             });
//
//         const textChunks = splitTextIntoChunksBySentence(formattedText, 4000);
//         if (textChunks.length > 0) {
//             embed.setDescription(textChunks[0]);
//             if (selectedNewsItem.newsContent?.image?.uri && textChunks.length === 1) {
//                 embed.setImage(selectedNewsItem.newsContent?.image?.uri);
//             }
//
//             await interaction.followUp({
//                 embeds: [embed],
//                 ephemeral: true
//             });
//
//             for (let i = 1; i < textChunks.length; i++) {
//                 const followUpEmbed = new EmbedBuilder()
//                     .setDescription(textChunks[i]);
//
//                 if (i === textChunks.length - 1 && selectedNewsItem.newsContent?.image?.uri) {
//                     followUpEmbed.setImage(selectedNewsItem.newsContent?.image?.uri);
//                 }
//
//                 await interaction.followUp({
//                     embeds: [followUpEmbed],
//                     ephemeral: true
//                 });
//             }
//         }
//     } else {
//         await interaction.reply({
//             content: "Failed to retrieve the selected news article.",
//             ephemeral: true
//         });
//     }
// }
//
// export async function batchSendNews(channel: TextChannel, dispatchedNewsIds: string[]) {
//     const locale = Locale.EnglishUS;
//
//     try {
//         const newsData: NewsData = await getCachedNews(locale);
//
//         if (!newsData) return;
//
//         const newsList = newsData.news;
//
//         for (const newsItem of newsList) {
//             if (dispatchedNewsIds.includes(newsItem.id)) continue;
//
//             const embed = new EmbedBuilder();
//
//             if (newsItem.title) {
//                 embed.setTitle(newsItem.title);
//             }
//
//             const formattedText = newsItem.newsContent?.content
//                 .map(content => content.text ? formatHtmlToDiscordMarkdown(content.text) : "")
//                 .join("\n\n");
//
//             const textChunks = splitTextIntoChunksBySentence(formattedText, 4000);
//             if (textChunks.length > 0) {
//                 if (newsItem.startDate && newsItem.endDate && textChunks.length === 1) {
//                     embed.setFooter({
//                         text: `Article available from: ${new Date(newsItem.startDate).toLocaleDateString()} to ${new Date(newsItem.endDate).toLocaleDateString()} | ID: ${newsItem.id}`
//                     });
//                 }
//
//                 const dynamicImage = newsItem.newsContent?.image?.uri;
//                 const packagedImage = newsItem.newsContent?.image?.packagedPath;
//                 const transformedPackagedImage = transformPackagedPath(packagedImage);
//
//                 const existingImage = await checkExistingImageUrl(dynamicImage, transformedPackagedImage);
//
//                 embed.setDescription(textChunks[0]);
//                 if (dynamicImage && textChunks.length === 1) {
//                     embed.setImage(existingImage);
//                 }
//
//                 await channel.send({
//                     embeds: [embed]
//                 });
//
//                 for (let i = 1; i < textChunks.length; i++) {
//                     const followUpEmbed = new EmbedBuilder()
//                         .setDescription(textChunks[i]);
//
//                     if (i === textChunks.length - 1 && existingImage) {
//                         followUpEmbed.setImage(existingImage);
//                     }
//
//                     if (newsItem.startDate && newsItem.endDate && i === textChunks.length - 1) {
//                         followUpEmbed.setFooter({
//                             text: `Article available from: ${new Date(newsItem.startDate).toLocaleDateString()} to ${new Date(newsItem.endDate).toLocaleDateString()} | ID: ${newsItem.id}`
//                         });
//                     }
//
//                     await channel.send({
//                         embeds: [followUpEmbed]
//                     });
//                 }
//             }
//         }
//     } catch (error) {
//         console.error("Error executing news command:", error);
//     }
// }
//
// // region Utils
//
// // function splitText(text: string, maxLength: number): string[] {
// //     const chunks: string[] = [];
// //     while (text.length > maxLength) {
// //         let chunk = text.slice(0, maxLength);
// //
// //         const lastBoundary = Math.max(chunk.lastIndexOf(" "), chunk.lastIndexOf("\n"));
// //
// //         if (lastBoundary > -1) {
// //             chunk = chunk.slice(0, lastBoundary);
// //         }
// //
// //         chunks.push(chunk.trim());
// //         text = text.slice(chunk.length).trim();
// //     }
// //
// //     if (text) {
// //         chunks.push(text.trim());
// //     }
// //
// //     return chunks;
// // }
//
// function splitTextIntoChunksBySentence(text: string, maxLength: number) {
//     const chunks = [];
//     let currentChunk = '';
//     const sentences = text.match(/[^.!?]+[.!?]*/g); // Regex to match sentences ending with a punctuation mark
//
//     if (sentences) {
//         for (const sentence of sentences) {
//             if (currentChunk.length + sentence.length <= maxLength) {
//                 currentChunk += sentence;
//             } else {
//                 if (currentChunk.length > 0) {
//                     chunks.push(currentChunk);
//                 }
//                 currentChunk = sentence;
//             }
//         }
//
//         if (currentChunk.length > 0) {
//             chunks.push(currentChunk);
//         }
//     }
//
//     return chunks;
// }
//
// export function isEmptyObject(obj: any): boolean {
//     return obj && typeof obj === 'object' && Object.keys(obj).length === 0;
// }
// // endregion

import i18next from "i18next";
import { SlashCommandBuilder } from "@discordjs/builders";
import {
    ActionRowBuilder,
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
    NewsData,
    NewsItem
} from "@tps/news";
import Constants from "../constants";

export const data = i18next.isInitialized
    ? new SlashCommandBuilder()
        .setName('news')
        .setDescription("Retrieve latest in-game news.")
    : undefined;

export async function execute(interaction: ChatInputCommandInteraction) {
    const locale = interaction.locale;

    try {
        await interaction.deferReply();

        const newsData: NewsData = await getCachedNews(locale);

        if (!newsData || isEmptyObject(newsData)) {
            const message = "Failed to retrieve latest news.";
            await sendErrorMessage(interaction, message);
            return;
        }

        const newsList = newsData.news;
        const components: ActionRowBuilder<StringSelectMenuBuilder>[] = [];

        const selectMenu = new StringSelectMenuBuilder()
            .setCustomId('select_news_article')
            .setPlaceholder('Select a news article')
            .setMinValues(1)
            .setMaxValues(1);

        newsList.forEach((newsItem, index) => {
            const option = new StringSelectMenuOptionBuilder()
                .setLabel(newsItem.title || `News ${index + 1}`)
                .setValue(newsItem.id.toString());
            selectMenu.addOptions(option);
        });

        components.push(new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(selectMenu));

        const embed = new EmbedBuilder();
        newsList.forEach((newsItem, index) => {
            if (newsItem.title) {
                embed.addFields({
                    name: `${index + 1}. ${newsItem.title}`,
                    value: `Published on: ${new Date(adjustForTimezone(newsItem.startDate)).toLocaleDateString()}`,
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

async function createNewsEmbed(newsItem: NewsItem, textContent: string, imageUrl: string | null, isIdNeeded: boolean, isFirstEmbed: boolean = false, isLastChunk: boolean = false) {
    const embed = new EmbedBuilder()
        .setDescription(textContent)
        .setColor(Constants.DEFAULT_DISCORD_COLOR)
        .setTimestamp(new Date(adjustForTimezone(newsItem.startDate)));

    if (isFirstEmbed) {
        embed.setTitle(newsItem.title || "Untitled News").setThumbnail(combineBaseUrlWithPath('/images/UI/Icons/ItemAddons/Kepler/iconAddon_OldNewspaper.png'));
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

async function sendNewsContent(newsItem: NewsItem, interactionOrChannel: ChatInputCommandInteraction | StringSelectMenuInteraction | TextChannel | NewsChannel) {
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

        const firstEmbed = await createNewsEmbed(newsItem, textChunks[0], textChunks.length === 1 ? existingImage : null, isIdNeeded, true, textChunks.length === 1);

        // Check if interactionOrChannel is an interaction or a channel
        if (interactionOrChannel instanceof TextChannel || interactionOrChannel instanceof NewsChannel) {
            await interactionOrChannel.send({ embeds: [firstEmbed] });
        } else {
            await interactionOrChannel.followUp({
                embeds: [firstEmbed],
                ephemeral: true
            });
        }

        for (let i = 1; i < textChunks.length; i++) {
            const isLastChunk = i === textChunks.length - 1;
            const followUpEmbed = await createNewsEmbed(newsItem, textChunks[i], isLastChunk ? existingImage : null, isIdNeeded, false, isLastChunk);

            if (interactionOrChannel instanceof TextChannel || interactionOrChannel instanceof NewsChannel) {
                await interactionOrChannel.send({ embeds: [followUpEmbed] });
            } else {
                await interactionOrChannel.followUp({
                    embeds: [followUpEmbed],
                    ephemeral: true
                });
            }
        }
    }
}

export async function handleSelectMenu(interaction: StringSelectMenuInteraction) {
    const selectedNewsId = interaction.values[0];
    const locale = interaction.locale;

    const newsData: NewsData = await getCachedNews(locale);
    const selectedNewsItem = newsData?.news.find(item => item.id.toString() === selectedNewsId);

    if (selectedNewsItem) {
        await sendNewsContent(selectedNewsItem, interaction);
    } else {
        await interaction.reply({
            content: "Failed to retrieve the selected news article.",
            ephemeral: true
        });
    }
}

export async function batchSendNews(channel: TextChannel | NewsChannel, dispatchedNewsIds: string[]) {
    const locale = Locale.EnglishUS;

    try {
        const newsData: NewsData = await getCachedNews(locale);

        if (!newsData) return;

        const newsList = newsData.news;

        for (const newsItem of newsList.filter(news => !dispatchedNewsIds.includes(news.id))) {
            await sendNewsContent(newsItem, channel);
        }
    } catch (error) {
        console.error("Error executing batch news command:", error);
    }
}

export function isEmptyObject(obj: any): boolean {
    return obj && typeof obj === 'object' && Object.keys(obj).length === 0;
}