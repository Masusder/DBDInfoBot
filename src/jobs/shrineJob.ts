import {
    ChannelType,
    Client,
    TextChannel
} from "discord.js";
import { getCachedShrine } from "@services/shrineService";
import {
    adjustForTimezone,
    compareCustomId,
    generateCustomId
} from "@utils/stringUtils";
import { sendShrineToChannel } from "@commands/shrine";
import Constants from "@constants";
import client from "../client";
import logger from "@logger";

export async function startShrineJob() {
    await checkAndScheduleShrine();
}

async function checkAndScheduleShrine() {
    try {
        logger.info('Checking Shrine...');
        const shrineData = await getCachedShrine();

        if (!shrineData?.currentShrine) {
            logger.info("No current Shrine data found. Scheduling next check in 5 minutes.");
            setTimeout(() => checkAndScheduleShrine(), 5 * 60 * 1000); // Retry in 5 minutes
            return;
        }

        const { currentShrine } = shrineData;

        const shrineMessageSent = await isShrineMessageSent(currentShrine, client);

        if (!shrineMessageSent) {
            await sendShrine(client);
        } else {
            logger.info("This week's Shrine has already been sent.");
        }

        // Schedule the next check after the current shrine's end date
        const timeUntilNextCheck = adjustForTimezone(currentShrine.endDate) - Date.now();
        const nextCheckDate = new Date(Date.now() + timeUntilNextCheck);
        logger.info(`Next Shrine check scheduled for: ${nextCheckDate.toLocaleString()}`);
        setTimeout(() => checkAndScheduleShrine(), timeUntilNextCheck);
    } catch (error) {
        logger.error('Error checking Shrine:', error);
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
    const channel = client.channels.cache.get(Constants.DBDLEAKS_SHRINE_CHANNEL_ID);

    if (!channel) {
        logger.error("Not found Shrine channel.");
        return;
    }

    if (channel.type !== ChannelType.GuildAnnouncement) {
        logger.error("Shrine: Invalid channel type. Only Announcement Channel is supported.")
        return;
    }

    await sendShrineToChannel(channel);
}
