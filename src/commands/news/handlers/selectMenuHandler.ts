import { StringSelectMenuInteraction } from "discord.js";
import { NewsData } from "@tps/news";
import { getCachedNews } from "@services/newsService";
import { t } from "@utils/localizationUtils";
import { ELocaleNamespace } from "@tps/enums/ELocaleNamespace";
import { sendErrorMessage } from "@handlers/errorResponseHandler";
import { sendNewsContent } from "../interactionData";

export async function handleSelectMenu(interaction: StringSelectMenuInteraction) {
    const selectedNewsId = interaction.values[0];
    const locale = interaction.locale;

    const newsData: NewsData = await getCachedNews(locale);
    const selectedNewsItem = newsData?.news.find(item => item.id.toString() === selectedNewsId);

    if (selectedNewsItem) {
        await sendNewsContent(selectedNewsItem, interaction, locale);
    } else {
        const message = t('news_command.failed_retrieving_article', locale, ELocaleNamespace.Errors);
        await sendErrorMessage(interaction, message);
    }
}