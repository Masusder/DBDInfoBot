import {
    ApplicationEmoji
} from "discord.js";
import client from "../index";

export async function getOrCreateApplicationEmoji(
    emojiName: string,
    emojiBuffer: Buffer
): Promise<ApplicationEmoji | null> {
    try {
        if (!client.application) return null;

        const emojis = await client.application.emojis.fetch();

        const existingEmoji = emojis.find((emoji) => emoji.name === emojiName);
        if (existingEmoji) {
            return existingEmoji;
        }

        const newEmoji = await client.application.emojis.create({ name: emojiName, attachment: emojiBuffer });
        console.log(`Application emoji "${emojiName}" created successfully.`);
        return newEmoji;

    } catch (error) {
        console.error('Error handling application emoji:', error);
        return null;
    }
}

export async function getApplicationEmoji(emojiName: string): Promise<ApplicationEmoji | null> {
    try {
        if (!client.application) return null;

        const emojis = await client.application.emojis.fetch();

        const existingEmoji = emojis.find((emoji) => emoji.name === emojiName);

        if (existingEmoji) {
            return existingEmoji;
        } else {
            return null;
        }
    } catch (error) {
        console.error('Error fetching application emoji:', error);
        return null;
    }
}