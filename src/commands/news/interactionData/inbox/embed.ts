import { EmbedBuilder } from "discord.js";
import {
    adjustForTimezone,
    formatHtmlToDiscordMarkdown,
    generateCustomId
} from "@utils/stringUtils";
import {
    InboxItem,
    MessageBody
} from "@tps/news";
import { NewsDataTable } from "@commands/news/data";

function createInboxEmbed(inboxItem: InboxItem, messageBody: MessageBody) {
    const textContent = messageBody.sections
        .filter((section) => section.type === "text" && section.text)
        .map((section) => section.text)
        .join("\n");

    const embed = new EmbedBuilder()
        .setTitle(inboxItem.message.title)
        .setDescription(formatHtmlToDiscordMarkdown(textContent) || "Description not available.")
        .setColor(NewsDataTable.Inbox.primaryColor)
        .setTimestamp(new Date(adjustForTimezone(inboxItem.received)))
        .setImage('attachment://inbox_showcase_items.png')
        .setThumbnail(NewsDataTable.Inbox.icon)
        .addFields({
            name: 'Expiration',
            value: `<t:${inboxItem.expireAt}:R>`,
            inline: true,
        });

    embed.setFooter({
        text: `ID: ${generateCustomId(inboxItem.received.toString())}`
    });

    return embed;
}

export default createInboxEmbed;