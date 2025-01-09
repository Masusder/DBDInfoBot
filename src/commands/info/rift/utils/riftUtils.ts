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
import { getTranslation } from "@utils/localizationUtils";
import { ELocaleNamespace } from "@tps/enums/ELocaleNamespace";

export async function constructDescription(riftData: Rift, locale: Locale): Promise<string> {
    const adjustedEndDate = Math.floor(adjustForTimezone(riftData.EndDate) / 1000);
    const adjustedStartDate = Math.floor(adjustForTimezone(riftData.StartDate) / 1000);

    const riftFragmentData = Currencies["RiftFragments"];
    const riftFragmentEmoji = await getApplicationEmoji(riftFragmentData.emojiId)
    const riftFragmentEmojiMarkdown = riftFragmentEmoji ? createEmojiMarkdown(riftFragmentEmoji) : '';

    return `Rift ends in: <t:${adjustedEndDate}:R>\nRift is active from <t:${adjustedStartDate}> to <t:${adjustedEndDate}>\n\n To progress by one tier you need to earn: **${riftData.Requirement} ${getTranslation(riftFragmentData.localizedName, locale, ELocaleNamespace.General)}** ${riftFragmentEmojiMarkdown}`;  // TODO: localize
}

export function chunkArray(arr: TierInfo[], size: number) {
    const result = [];
    for (let i = 0; i < arr.length; i += size) {
        result.push(arr.slice(i, i + size));
    }
    return result;
}