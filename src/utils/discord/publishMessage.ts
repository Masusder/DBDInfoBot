import {
    Message,
    NewsChannel
} from "discord.js";
import logger from "@logger";

/**
 * Publishes a message if it is sent in a news channel.
 *
 * @param message The message to check and publish.
 * @param channel The channel where message is published.
 * @returns A promise that resolves to `true` if the message was published, `false` otherwise.
 */
async function publishMessage(message: Message, channel: NewsChannel): Promise<boolean> {
    try {
        await message.crosspost();
        logger.info(`Published message in ${channel.name}`);
        return true;
    } catch (error) {
        logger.error('Failed to publish message:', error);
        return false;
    }
}

export default publishMessage;