import { SlashCommandBuilder } from '@discordjs/builders';
import {
    ActionRowBuilder,
    APIEmbedField,
    ApplicationEmoji,
    ButtonBuilder,
    ButtonStyle,
    ChatInputCommandInteraction,
    EmbedBuilder,
    Locale,
    Message,
    NewsChannel
} from 'discord.js';
import i18next from "i18next";
import { getCachedShrine } from "@services/shrineService";
import { getCachedPerks } from "@services/perkService";
import {
    getCharacterDataByIndex
} from "@services/characterService";
import {
    adjustForTimezone,
    combineBaseUrlWithPath,
    formatNumber,
    generateCustomId
} from "@utils/stringUtils";
import {
    commandLocalizationHelper,
    t
} from "@utils/localizationUtils";
import {
    createCanvas,
    loadImage
} from "canvas";
import {
    IShrinePerkItem,
    Perk
} from "../types";
import { Role } from "@data/Role";
import { layerIcons } from "@utils/imageUtils";
import Constants from "@constants/index";
import {
    createEmojiMarkdown,
    getApplicationEmoji,
    getOrCreateApplicationEmoji
} from "@utils/emojiManager";
import { ELocaleNamespace } from '@tps/enums/ELocaleNamespace';
import { ThemeColors } from "@constants/themeColors";
import { Currencies } from "@data/Currencies";
import publishMessage from "@utils/discord/publishMessage";

export const data = i18next.isInitialized
    ? new SlashCommandBuilder()
        .setName('shrine')
        .setNameLocalizations(commandLocalizationHelper('shrine_command.name'))
        .setDescription(i18next.t('shrine_command.description', { lng: 'en' }))
        .setDescriptionLocalizations(commandLocalizationHelper('shrine_command.description'))
        .setContexts([0, 1, 2])
        .setIntegrationTypes([0, 1])
    : undefined;

type CorrectlyCasedPerkData = {
    [key: string]: { bloodpoints: number; shards: number[] };
};

export async function execute(interaction: ChatInputCommandInteraction | Message, channel?: NewsChannel) {
    const locale = interaction instanceof ChatInputCommandInteraction ? interaction.locale : Locale.EnglishUS;

    try {
        if (interaction instanceof ChatInputCommandInteraction) {
            await interaction.deferReply();
        }

        const [shrineData, perkData] = await Promise.all([
            getCachedShrine(),
            getCachedPerks(locale)
        ])

        if (!shrineData || !shrineData.currentShrine || !perkData) return;

        const { currentShrine } = shrineData;

        const correctlyCasedPerkData: CorrectlyCasedPerkData = currentShrine.perks
            .reduce((acc: CorrectlyCasedPerkData, perk: IShrinePerkItem) => {
                const [correctKey, _] = Object.entries(perkData).find(
                    ([key]) => key.toLowerCase() === perk.id.toLowerCase()
                ) || [];

                if (correctKey) {
                    acc[correctKey] = {
                        bloodpoints: perk.bloodpoints,
                        shards: perk.shards
                    };
                }

                return acc;
            }, {});

        const shrineCanvasBuffer = await createShrineCanvas(correctlyCasedPerkData, perkData);

        const [bloodpointEmoji, shardEmoji] = await Promise.all([
            getApplicationEmoji(Currencies["Bloodpoints"].emojiId),
            getApplicationEmoji(Currencies["Shards"].emojiId)
        ]) as ApplicationEmoji[];

        let currenciesMessage = "";
        const perksList: APIEmbedField[] = [];
        const buttons: ButtonBuilder[] = [];
        for (const perkId of Object.keys(correctlyCasedPerkData)) {
            const perkInfo = perkData[perkId];

            if (!perkInfo) continue;

            const perkName = perkInfo.Name;

            let characterName = ' ';
            if (perkInfo.Character !== -1) {
                const characterData = await getCharacterDataByIndex(perkInfo.Character, locale);
                characterName = characterData ? `${t('shrine_command.character', locale, ELocaleNamespace.Messages)} - ${characterData.Name}` : '';
            }

            if (!currenciesMessage) {
                currenciesMessage = `\n\n${createEmojiMarkdown(shardEmoji)} **${t('currencies.shards', locale, ELocaleNamespace.General)}:** ${correctlyCasedPerkData[perkId].shards.join('/')} \n${createEmojiMarkdown(bloodpointEmoji)} **${t('currencies.bloodpoints', locale, ELocaleNamespace.General)}:** ${formatNumber(correctlyCasedPerkData[perkId].bloodpoints)}\n⠀`
            }

            const perkEmoji = await getApplicationEmoji(perkId);
            const perkFieldTitle = perkEmoji ? `${createEmojiMarkdown(perkEmoji)} ${perkName}` : perkName;
            const perkField = {
                name: perkFieldTitle,
                value: characterName,
                inline: true
            };

            perksList.push(perkField);

            const perkButton = new ButtonBuilder()
                .setCustomId(`shrine_perk::${perkId}`)
                .setLabel(perkName)
                .setStyle(ButtonStyle.Secondary)

            if (perkEmoji && perkEmoji.id) {
                perkButton.setEmoji(perkEmoji.id);
            }

            buttons.push(perkButton);
        }

        perksList.filter(Boolean);

        const adjustedEndDate = adjustForTimezone(currentShrine.endDate);
        const adjustedStartDate = adjustForTimezone(currentShrine.startDate);

        const startDateUnix = Math.floor(adjustedStartDate / 1000);
        const adjustedEndDateUnix = Math.floor(adjustedEndDate / 1000);

        const description = `**${t('shrine_command.time_left', locale, ELocaleNamespace.Messages)}** <t:${adjustedEndDateUnix}:R>\n**${t('shrine_command.shrine_active.0', locale, ELocaleNamespace.Messages)}** <t:${startDateUnix}> ${t('shrine_command.shrine_active.1', locale, ELocaleNamespace.Messages)} <t:${adjustedEndDateUnix}>`;

        const customId = generateCustomId(currentShrine.endDate);

        const embed = new EmbedBuilder()
            .setColor(ThemeColors.PRIMARY)
            .setDescription(description + currenciesMessage)
            .setFields(perksList)
            .setImage('attachment://shrine-of-secrets.png')
            .setTimestamp()
            .setAuthor({
                name: t('shrine_command.author_title', locale, ELocaleNamespace.Messages),
                iconURL: combineBaseUrlWithPath('/images/UI/Icons/Help/iconHelp_shrineOfSecrets.png')
            })
            .setFooter({
                text: `ID: ${customId}` // Custom ID to match for Shrine cron job
            });

        const row = new ActionRowBuilder<ButtonBuilder>().addComponents(buttons);

        if (interaction instanceof ChatInputCommandInteraction) {
            await interaction.editReply({
                embeds: [embed],
                files: [{
                    attachment: shrineCanvasBuffer,
                    name: 'shrine-of-secrets.png'
                }],
                components: [row]
            });
        } else if (channel) {
            const message = await channel.send({
                content: `<@&${Constants.DBDLEAKS_SHRINE_NOTIFICATION_ROLE}>`,
                embeds: [embed],
                files: [{
                    attachment: shrineCanvasBuffer,
                    name: 'shrine-of-secrets.png'
                }],
                components: [row]
            });

            await publishMessage(message, channel);
        }
    } catch (error) {
        console.error("Error executing shrine command:", error);
    }
}

async function createShrineCanvas(correctlyCasedPerkData: CorrectlyCasedPerkData, perkData: {
    [key: string]: Perk
}): Promise<Buffer> {
    const canvas = createCanvas(800, 606);
    const ctx = canvas.getContext('2d');

    const backgroundUrl = combineBaseUrlWithPath('/images/Other/shrine-of-secrets-empty.png');
    const logoUrl = combineBaseUrlWithPath('/images/Logo/DBDInfoLogo.png');
    const [backgroundImage, logoIcon] = await Promise.all([
        loadImage(backgroundUrl),
        loadImage(logoUrl)
    ]);
    ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);

    const iconSize = 256;
    const positions = [
        { x: (canvas.width - iconSize) / 2 + 25, y: 10 },  // Top (Centered horizontally)
        { x: canvas.width - iconSize - 56, y: (canvas.height - iconSize) / 2 },  // Right (Centered vertically)
        { x: 96, y: (canvas.height - iconSize) / 2 },  // Left (Centered vertically)
        { x: (canvas.width - iconSize) / 2 + 25, y: canvas.height - iconSize - 10 }  // Bottom (Centered horizontally)
    ];

    const emojiCreationPromises: Promise<void | ApplicationEmoji | null>[] = [];
    const perkIds = Object.keys(correctlyCasedPerkData);
    const perkPromises = perkIds.map(async(perkId, index) => {
        const role = perkData[perkId].Role;
        const perkBackgroundUrl = Role[role].perkBackground;
        const iconUrl = combineBaseUrlWithPath(perkData[perkId].IconFilePathList);

        const perkIconBuffer = await layerIcons(perkBackgroundUrl, iconUrl) as Buffer;

        emojiCreationPromises.push(
            getOrCreateApplicationEmoji(perkId, perkIconBuffer).catch(() => {
            })
        );

        const icon = await loadImage(perkIconBuffer);

        const position = positions[index % positions.length];
        ctx.drawImage(icon, position.x, position.y, iconSize, iconSize);
    });

    await Promise.all(perkPromises);
    await Promise.all(emojiCreationPromises);

    const bottomRightPosition = { x: canvas.width - 150 - 10, y: canvas.height - 117 - 10 };
    ctx.drawImage(logoIcon, bottomRightPosition.x, bottomRightPosition.y, 150, 117);

    return canvas.toBuffer('image/png');
}