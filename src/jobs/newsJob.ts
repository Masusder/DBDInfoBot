import {
    Locale,
    NewsChannel,
    TextChannel
} from "discord.js";
import cron from "node-cron";
import { getCachedNews } from "@services/newsService";
import {
    batchSendNews,
    isEmptyObject
} from "@commands/newsCommand";
import Constants from "../constants";
import client from "../client";

export async function startNewsJob() {
    cron.schedule('*/15 * * * *', async() => {
        await resolveNewsArticles();
    });
}

export async function resolveNewsArticles() {
    try {
        console.log('Checking News...');
        const newsData = await getCachedNews(Locale.EnglishUS)

        if (!newsData || isEmptyObject(newsData)) {
            console.log("Not found News data.");
            return;
        }

        const channel = client.channels.cache.get(Constants.DBDLEAKS_INGAME_NEWS_CHANNEL_ID) as NewsChannel;
        if (!channel) {
            console.warn(`No news channel found with id ${Constants.DBDLEAKS_INGAME_NEWS_CHANNEL_ID}`);
            return [];
        }

        const ids = await grabDispatchedNewsArticleIdentifiers(channel);

        await batchSendNews(channel, ids, newsData);
    } catch (error) {
        console.error('Error checking for News:', error);
    }
}

async function grabDispatchedNewsArticleIdentifiers(channel: TextChannel | NewsChannel): Promise<string[]> {
    const messages = await channel.messages.fetch({ limit: 100 });

    const extractedIds: string[] = [];
    messages.forEach((msg) => {
        msg.embeds.forEach((embed) => {
            if (embed.footer?.text) {
                const footerText = embed.footer.text;
                const idMatch = footerText.match(/ID: (\S+)/);

                if (idMatch) {
                    extractedIds.push(idMatch[1]);
                }
            }
        });
    });

    return extractedIds;
}