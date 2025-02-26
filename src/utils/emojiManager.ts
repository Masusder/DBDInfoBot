import {
    ApplicationEmoji,
    Collection,
    Locale
} from "discord.js";
import client from "client";
import { createPerkIcons } from "@utils/imageUtils";
import logger from "@logger";

async function fetchAndCacheEmojis(): Promise<Collection<string, ApplicationEmoji>> {
    if (!client.application) return new Collection();

    try {
        const emojis = await client.application.emojis.fetch();
        emojis.forEach((emoji) => {
            client.application?.emojis.cache.set(emoji.id, emoji);
        });
        return emojis;
    } catch (error) {
        logger.error('Error fetching emojis:', error);
        return new Collection();
    }
}

export async function getOrCreateMultiplePerkEmojis(
    perkIds: string[],
    locale: Locale
): Promise<ApplicationEmoji[]> {
    const existingEmojis = await Promise.all(perkIds.map(perkId => getApplicationEmoji(perkId)));

    const missingPerkIds = perkIds.filter((_perkId, index) => !existingEmojis[index]);

    let perkIconData: { perkId: string, buffer: Buffer }[] = [];
    if (missingPerkIds.length > 0) {
        perkIconData = await createPerkIcons(missingPerkIds, locale) as { perkId: string, buffer: Buffer }[];
    }

    const emojiPromises = perkIds.map(async (perkId, index) => {
        let emoji = existingEmojis[index];

        if (!emoji) {
            const { buffer } = perkIconData.find(data => data.perkId === perkId) || { buffer: null };
            if (buffer) {
                emoji = await getOrCreateApplicationEmoji(perkId, buffer);
            }
        }

        return emoji;
    });

    const emojis = await Promise.all(emojiPromises);

    return emojis.filter(Boolean) as ApplicationEmoji[];
}

export async function getOrCreateApplicationEmoji(
    emojiName: string,
    emojiBuffer: Buffer
): Promise<ApplicationEmoji | null> {
    try {
        if (!client.application) return null;

        const cachedEmoji = client.application.emojis.cache.find((emoji) => emoji.name === emojiName);
        if (cachedEmoji) {
            return cachedEmoji;
        }

        const emojis = await fetchAndCacheEmojis();

        const existingEmoji = emojis.find((emoji) => emoji.name === emojiName);
        if (existingEmoji) {
            return existingEmoji;
        }

        const newEmoji = await client.application.emojis.create({ name: emojiName, attachment: emojiBuffer });
        logger.info(`Application emoji "${emojiName}" created successfully.`);
        return newEmoji;
    } catch (error) {
        logger.error('Error handling application emoji:', error);
        return null;
    }
}

export async function getApplicationEmoji(emojiName: string): Promise<ApplicationEmoji | null> {
    try {
        if (!client.application) return null;

        const cachedEmoji = client.application.emojis.cache.find((emoji) => emoji.name === emojiName);
        if (cachedEmoji) {
            return cachedEmoji;
        }

        const emojis = await fetchAndCacheEmojis();

        const existingEmoji = emojis.find((emoji) => emoji.name === emojiName);

        if (existingEmoji) {
            return existingEmoji;
        } else {
            return null;
        }
    } catch (error) {
        logger.error('Error fetching application emoji:', error);
        return null;
    }
}

export function createEmojiMarkdown(emoji: ApplicationEmoji) {
    return `<:${emoji.name}:${emoji.id}>`
}