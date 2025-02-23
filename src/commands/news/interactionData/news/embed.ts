import { NewsItem } from "@tps/news";
import {
    EmbedBuilder,
    Locale
} from "discord.js";
import { INewsDataTable } from "@commands/news/types";
import {
    adjustForTimezone,
    combineBaseUrlWithPath
} from "@utils/stringUtils";
import { t } from "@utils/localizationUtils";
import { ELocaleNamespace } from "@tps/enums/ELocaleNamespace";

async function createNewsEmbed(
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

export default createNewsEmbed;