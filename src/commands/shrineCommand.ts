import { SlashCommandBuilder } from '@discordjs/builders';
import {
    APIEmbedField,
    ChatInputCommandInteraction,
    EmbedBuilder,
    Locale,
    Message,
    TextChannel
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
import { getTranslation } from "@utils/localizationUtils";
import {
    createCanvas,
    loadImage
} from "canvas";
import { Perk } from "../types";
import { Role } from "@data/Role";
import { layerIcons } from "@commands/infoSubCommands/infoUtils";

export const data = i18next.isInitialized
    ? new SlashCommandBuilder()
        .setName('shrine')
        .setNameLocalizations({
            'en-US': i18next.t('shrine_command.name', { lng: 'en' }),
            'en-GB': i18next.t('shrine_command.name', { lng: 'en' }),
            'de': i18next.t('shrine_command.name', { lng: 'de' }),
            'es-ES': i18next.t('shrine_command.name', { lng: 'es' }),
            'es-419': i18next.t('shrine_command.name', { lng: 'es-MX' }),
            'fr': i18next.t('shrine_command.name', { lng: 'fr' }),
            'it': i18next.t('shrine_command.name', { lng: 'it' }),
            'ja': i18next.t('shrine_command.name', { lng: 'ja' }),
            'ko': i18next.t('shrine_command.name', { lng: 'ko' }),
            'pl': i18next.t('shrine_command.name', { lng: 'pl' }),
            'pt-BR': i18next.t('shrine_command.name', { lng: 'pt-BR' }),
            'ru': i18next.t('shrine_command.name', { lng: 'ru' }),
            'th': i18next.t('shrine_command.name', { lng: 'th' }),
            'tr': i18next.t('shrine_command.name', { lng: 'tr' }),
            'zh-CN': i18next.t('shrine_command.name', { lng: 'zh-Hans' }),
            'zh-TW': i18next.t('shrine_command.name', { lng: 'zh-Hant' })
        })
        .setDescription(i18next.t('shrine_command.description', { lng: 'en' }))
        .setDescriptionLocalizations({
            'en-US': i18next.t('shrine_command.description', { lng: 'en' }),
            'en-GB': i18next.t('shrine_command.description', { lng: 'en' }),
            'de': i18next.t('shrine_command.description', { lng: 'de' }),
            'es-ES': i18next.t('shrine_command.description', { lng: 'es' }),
            'es-419': i18next.t('shrine_command.description', { lng: 'es-MX' }),
            'fr': i18next.t('shrine_command.description', { lng: 'fr' }),
            'it': i18next.t('shrine_command.description', { lng: 'it' }),
            'ja': i18next.t('shrine_command.description', { lng: 'ja' }),
            'ko': i18next.t('shrine_command.description', { lng: 'ko' }),
            'pl': i18next.t('shrine_command.description', { lng: 'pl' }),
            'pt-BR': i18next.t('shrine_command.description', { lng: 'pt-BR' }),
            'ru': i18next.t('shrine_command.description', { lng: 'ru' }),
            'th': i18next.t('shrine_command.description', { lng: 'th' }),
            'tr': i18next.t('shrine_command.description', { lng: 'tr' }),
            'zh-CN': i18next.t('shrine_command.description', { lng: 'zh-Hans' }),
            'zh-TW': i18next.t('shrine_command.description', { lng: 'zh-Hant' })
        }) : undefined;

type ShrinePerk = {
    id: string;
    bloodpoints: number;
    shards: number[];
};

type CorrectlyCasedPerkData = {
    [key: string]: { bloodpoints: number; shards: number[] };
};

export async function execute(interaction: ChatInputCommandInteraction | Message, channel?: TextChannel) {
    const locale = interaction instanceof ChatInputCommandInteraction ? interaction.locale : Locale.EnglishUS;

    try {
        if (interaction instanceof ChatInputCommandInteraction) {
            await interaction.deferReply();
        }

        const shrineData = await getCachedShrine();
        const perkData = await getCachedPerks(locale);

        if (!shrineData && !shrineData.currentShrine && !perkData) return;

        const { currentShrine } = shrineData;

        const correctlyCasedPerkData: CorrectlyCasedPerkData = currentShrine.perks
            .reduce((acc: CorrectlyCasedPerkData, perk: ShrinePerk) => {
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

        const perksList: APIEmbedField[] = [];
        for (const perkId of Object.keys(correctlyCasedPerkData)) {
            const perkInfo = perkData[perkId];

            if (!perkInfo) continue;

            const perkName = perkInfo.Name;
            let characterName = '';

            if (perkInfo.Character !== -1) {
                const characterData = await getCharacterDataByIndex(perkInfo.Character, locale);
                characterName = characterData ? `- ${getTranslation('shrine_command.character', locale, 'messages')}: ${characterData.Name}\n` : '';
            }

            const perkField = {
                name: perkName,
                value: `${characterName}- ${getTranslation('currencies.shards', locale, 'general')}: ${correctlyCasedPerkData[perkId].shards.join('/')} \n- ${getTranslation('currencies.bloodpoints', locale, 'general')}: ${formatNumber(correctlyCasedPerkData[perkId].bloodpoints)}`,
                inline: true
            };

            perksList.push(perkField);
        }

        perksList.filter(Boolean);

        const adjustedEndDate = adjustForTimezone(currentShrine.endDate);
        const adjustedStartDate = adjustForTimezone(currentShrine.startDate);

        const startDateUnix = Math.floor(adjustedStartDate / 1000);
        const adjustedEndDateUnix = Math.floor(adjustedEndDate / 1000);
        getTranslation('shrine_command.time_left', locale, 'messages')
        const description = `**${getTranslation('shrine_command.time_left', locale, 'messages')}** <t:${adjustedEndDateUnix}:R>\n**${getTranslation('shrine_command.shrine_active.0', locale, 'messages')}** <t:${startDateUnix}> ${getTranslation('shrine_command.shrine_active.1', locale, 'messages')} <t:${adjustedEndDateUnix}>`;

        const shrineCanvasBuffer = await createShrineCanvas(correctlyCasedPerkData, perkData);

        const customId = generateCustomId(currentShrine.endDate);

        const embed = new EmbedBuilder()
            .setColor("#1e90ff")
            .setDescription(description)
            .setFields(perksList)
            .setImage('attachment://shrine-of-secrets.png')
            .setTimestamp()
            .setAuthor({
                name: getTranslation('shrine_command.author_title', locale, 'messages'),
                iconURL: combineBaseUrlWithPath('/images/UI/Icons/Help/iconHelp_shrineOfSecrets.png')
            })
            .setFooter({
                text: `ID: ${customId}` // Custom ID to match for Shrine cron job
            });

        if (interaction instanceof ChatInputCommandInteraction) {
            await interaction.editReply({
                embeds: [embed],
                files: [{
                    attachment: shrineCanvasBuffer,
                    name: 'shrine-of-secrets.png'
                }]
            });
        } else {
            await channel?.send({
                embeds: [embed],
                files: [{
                    attachment: shrineCanvasBuffer,
                    name: 'shrine-of-secrets.png'
                }]
            });
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
    const backgroundImage = await loadImage(backgroundUrl);
    ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);

    const iconSize = 256;
    const positions = [
        { x: (canvas.width - iconSize) / 2 + 25, y: 10 },  // Top (Centered horizontally)
        { x: canvas.width - iconSize - 56, y: (canvas.height - iconSize) / 2 },  // Right (Centered vertically)
        { x: 96, y: (canvas.height - iconSize) / 2 },  // Left (Centered vertically)
        { x: (canvas.width - iconSize) / 2 + 25, y: canvas.height - iconSize - 10 }  // Bottom (Centered horizontally)
    ];
    const perkIds = Object.keys(correctlyCasedPerkData);

    for (let i = 0; i < perkIds.length; i++) {
        const perkId = perkIds[i];
        const role = perkData[perkId].Role;

        const perkBackgroundUrl = Role[role].perkBackground;
        const iconUrl = combineBaseUrlWithPath(perkData[perkId].IconFilePathList);

        const perkIconBuffer = await layerIcons(perkBackgroundUrl, iconUrl);

        const icon = await loadImage(perkIconBuffer);

        const position = positions[i % positions.length];
        ctx.drawImage(icon, position.x, position.y, iconSize, iconSize);
    }

    const logoUrl = combineBaseUrlWithPath('/images/Logo/DBDInfoLogo.png');
    const logoIcon = await loadImage(logoUrl);
    const bottomRightPosition = { x: canvas.width - 150 - 10, y: canvas.height - 117 - 10 };
    ctx.drawImage(logoIcon, bottomRightPosition.x, bottomRightPosition.y, 150, 117);

    return canvas.toBuffer('image/png');
}