import { ThemeColors } from "@constants/themeColors";
import { getCharacterDataByIndex } from "@services/characterService";
import { ELocaleNamespace } from "@tps/enums/ELocaleNamespace";
import {
    createEmojiMarkdown,
    getApplicationEmoji,
    getOrCreateApplicationEmoji
} from "@utils/emojiManager";
import { t } from "@utils/localizationUtils";
import {
    adjustForTimezone,
    combineBaseUrlWithPath,
    formatNumber,
    generateCustomId
} from "@utils/stringUtils";
import {
    APIEmbedField,
    ApplicationEmoji,
    EmbedBuilder,
    Locale
} from "discord.js";
import { CorrectlyCasedPerkData } from "../models";
import { Perk } from "@tps/perk";
import { Currencies } from "@data/Currencies";
import { IShrineItem } from "@tps/shrine";
import generateCharacterIcons from "@utils/images/characterIcon";

async function generateShrineEmbed(
    locale: Locale,
    currentShrine: IShrineItem,
    correctlyCasedPerkData: CorrectlyCasedPerkData,
    perkData: Record<string, Perk>
): Promise<EmbedBuilder> {
    const [bloodpointEmoji, shardEmoji] = await Promise.all([
        getApplicationEmoji(Currencies["Bloodpoints"].emojiId),
        getApplicationEmoji(Currencies["Shards"].emojiId)
    ]) as ApplicationEmoji[];

    const perksList = await generatePerksList(correctlyCasedPerkData, perkData, locale);
    const currenciesMessage = generateCurrenciesMessage(correctlyCasedPerkData, shardEmoji, bloodpointEmoji, locale);

    const adjustedEndDateUnix = Math.floor(adjustForTimezone(currentShrine.endDate) / 1000);
    const adjustedStartDateUnix = Math.floor(adjustForTimezone(currentShrine.startDate) / 1000);

    const description = `**${t('shrine_command.time_left', locale, ELocaleNamespace.Messages)}** <t:${adjustedEndDateUnix}:R>\n` +
        `${t('shrine_command.shrine_active', locale, ELocaleNamespace.Messages, {
            start_date: adjustedStartDateUnix.toString(),
            end_date: adjustedEndDateUnix.toString()
        })}`;

    return new EmbedBuilder()
        .setColor(ThemeColors.PRIMARY)
        .setDescription(description + currenciesMessage)
        .setFields(perksList)
        .setImage('attachment://shrine-of-secrets.png')
        .setTimestamp(new Date(adjustForTimezone(currentShrine.startDate)))
        .setAuthor({
            name: t('shrine_command.author_title', locale, ELocaleNamespace.Messages),
            iconURL: combineBaseUrlWithPath('/images/UI/Icons/Help/iconHelp_shrineOfSecrets.png')
        })
        .setFooter({ text: `ID: ${generateCustomId(currentShrine.endDate)}` });
}

// region Embed Utils
async function generatePerksList(
    correctlyCasedPerkData: CorrectlyCasedPerkData,
    perkData: Record<string, Perk>,
    locale: Locale
): Promise<APIEmbedField[]> {
    const perkEmojis = await Promise.all(Object.keys(correctlyCasedPerkData).map(getApplicationEmoji));
    const emojiMap = Object.fromEntries(Object.keys(correctlyCasedPerkData).map((
        id,
        index
    ) => [id, perkEmojis[index]]));

    let perkFields: APIEmbedField[] = [];
    for (const perkId of Object.keys(correctlyCasedPerkData)) {
        const perkInfo = perkData[perkId];

        if (!perkInfo) continue;

        let characterName = ' ';
        if (perkInfo.Character !== -1) {
            const characterData = await getCharacterDataByIndex(perkInfo.Character, locale);
            if (characterData) {
                const characterIcon = await generateCharacterIcons([characterData.CharacterIndex], locale, true);

                if (characterIcon[0]) {
                    const characterEmoji = await getOrCreateApplicationEmoji(characterData.Id, characterIcon[0]);
                    characterName = characterEmoji
                        ? `${createEmojiMarkdown(characterEmoji)} ${characterData.Name}`
                        : characterData.Name;
                } else {
                    characterName = characterData.Name;
                }
            }
        }

        const perkEmoji = emojiMap[perkId];
        const perkFieldTitle = perkEmoji ? `${createEmojiMarkdown(perkEmoji)} ${perkInfo.Name}` : perkInfo.Name;

        perkFields.push({
            name: perkFieldTitle,
            value: characterName,
            inline: true
        });
    }

    return perkFields;
}

function generateCurrenciesMessage(
    correctlyCasedPerkData: CorrectlyCasedPerkData,
    shardEmoji: ApplicationEmoji,
    bloodpointEmoji: ApplicationEmoji,
    locale: Locale
): string {
    const firstPerkId = Object.keys(correctlyCasedPerkData)[0];

    if (!firstPerkId) return "";

    return `\n\n${createEmojiMarkdown(shardEmoji)} **${t('currencies.shards', locale, ELocaleNamespace.General)}:** ${correctlyCasedPerkData[firstPerkId].shards.join('/')}` +
        `\n${createEmojiMarkdown(bloodpointEmoji)} **${t('currencies.bloodpoints', locale, ELocaleNamespace.General)}:** ${formatNumber(correctlyCasedPerkData[firstPerkId].bloodpoints)}\n⠀`;
}

// endregion

export default generateShrineEmbed;