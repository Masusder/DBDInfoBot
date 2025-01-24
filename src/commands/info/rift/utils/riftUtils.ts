import {
    Rift,
    TierInfo
} from "@tps/rift";
import { Locale } from "discord.js";
import { adjustForTimezone } from "@utils/stringUtils";
import { Currencies } from "@data/Currencies";
import {
    createEmojiMarkdown,
    getApplicationEmoji
} from "@utils/emojiManager";
import { t } from "@utils/localizationUtils";
import { ELocaleNamespace } from "@tps/enums/ELocaleNamespace";

export async function constructDescription(riftData: Rift, locale: Locale): Promise<string> {
    const adjustedEndDate = Math.floor(adjustForTimezone(riftData.EndDate) / 1000);
    const adjustedStartDate = Math.floor(adjustForTimezone(riftData.StartDate) / 1000);

    const riftFragmentData = Currencies["RiftFragments"];
    const riftFragmentEmoji = await getApplicationEmoji(riftFragmentData.emojiId)
    const riftFragmentEmojiMarkdown = riftFragmentEmoji ? createEmojiMarkdown(riftFragmentEmoji) : '';

    const now = Math.floor(Date.now() / 1000);
    const expired = now > adjustedEndDate;

    let message = ''
    const riftFragmentsText = ` **${riftData.Requirement} ${t(riftFragmentData.localizedName, locale, ELocaleNamespace.General)}** ${riftFragmentEmojiMarkdown}`;

    if (expired) {
        message += `${t('info_command.rift_subcommand.rift_ends_expired', locale, ELocaleNamespace.Messages)} <t:${adjustedEndDate}:R>\n`
        message += t('info_command.rift_subcommand.rift_expired', locale, ELocaleNamespace.Messages, {
            start_date: adjustedStartDate.toString(),
            end_date: adjustedEndDate.toString(),
        });
        message += `\n\n`
        message += t('info_command.rift_subcommand.to_progress_expired', locale, ELocaleNamespace.Messages)
        message += riftFragmentsText
    } else {
        message += `${t('info_command.rift_subcommand.rift_ends_active', locale, ELocaleNamespace.Messages)} <t:${adjustedEndDate}:R>\n`
        message += t('info_command.rift_subcommand.rift_active', locale, ELocaleNamespace.Messages, {
            start_date: adjustedStartDate.toString(),
            end_date: adjustedEndDate.toString(),
        });
        message += `\n\n`
        message += t('info_command.rift_subcommand.to_progress_active', locale, ELocaleNamespace.Messages)
        message += riftFragmentsText
    }

    return message;
}

export function chunkArray(arr: TierInfo[], size: number) {
    const result = [];
    for (let i = 0; i < arr.length; i += size) {
        result.push(arr.slice(i, i + size));
    }
    return result;
}