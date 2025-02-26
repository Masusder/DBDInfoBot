import { Message } from "discord.js";
import logger from "@logger";

async function pinMessage(message: Message) {
    try {
        await message.pin();
    } catch (error) {
        logger.error("Failed to pin the message:", error);
    }
}

export default pinMessage;