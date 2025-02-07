import { Message } from "discord.js";

async function pinMessage(message: Message) {
    try {
        await message.pin();
    } catch (error) {
        console.error("Failed to pin the message:", error);
    }
}

export default pinMessage;