import {
    Client,
    TextChannel
} from "discord.js";
import { getCachedShrine } from "@services/shrineService";
import {
    adjustForTimezone,
    compareCustomId,
    generateCustomId
} from "@utils/stringUtils";
import { execute as executeShrine } from "@commands/shrine";
import Constants from "@constants";
import client from "../client";

export async function startShrineJob() {
    await checkAndScheduleShrine();
}

async function checkAndScheduleShrine() {
    try {
        console.log('Checking Shrine...');
        const shrineData = await getCachedShrine();

        if (!shrineData?.currentShrine) {
            console.log("No current Shrine data found. Scheduling next check in 5 minutes.");
            setTimeout(() => checkAndScheduleShrine(), 5 * 60 * 1000); // Retry in 5 minutes
            return;
        }

        const { currentShrine } = shrineData;

        const shrineMessageSent = await isShrineMessageSent(currentShrine, client);

        if (!shrineMessageSent) {
            await sendShrine(client);
        } else {
            console.log("This week's Shrine has already been sent.");
        }

        // Schedule the next check after the current shrine's end date
        const timeUntilNextCheck = adjustForTimezone(currentShrine.endDate) - Date.now();
        const nextCheckDate = new Date(Date.now() + timeUntilNextCheck);
        console.log(`Next Shrine check scheduled for: ${nextCheckDate.toLocaleString()}`);
        setTimeout(() => checkAndScheduleShrine(), timeUntilNextCheck);
    } catch (error) {
        console.error('Error checking Shrine:', error);
        // Retry after 1 hour if an error occurs
        setTimeout(() => checkAndScheduleShrine(), 60 * 60 * 1000);
    }
}

async function isShrineMessageSent(currentShrine: any, client: Client): Promise<boolean> {
    const channel = client.channels.cache.get(Constants.DBDLEAKS_SHRINE_CHANNEL_ID) as TextChannel;
    if (!channel) return false;

    const messages = await channel.messages.fetch({ limit: 10 });

    return messages.some((msg) => {
        return msg.embeds.some((embed) => {
            if (embed.footer && embed.footer.text) {
                const footerText = embed.footer.text;
                const idMatch = footerText.match(/ID: (\S+)/);

                if (idMatch) {
                    const extractedId = idMatch[1];
                    return compareCustomId(extractedId, generateCustomId(currentShrine.endDate));
                }
            }
            return false;
        });
    });
}

async function sendShrine(client: Client) {
    const channel = client.channels.cache.get(Constants.DBDLEAKS_SHRINE_CHANNEL_ID) as TextChannel;
    if (!channel) return;

    await executeShrine({} as any, channel);
}
