import { CorrectlyCasedPerkData } from "@commands/shrine/models";
import { Perk } from "@tps/perk";
import {
    ButtonBuilder,
    ButtonStyle
} from "discord.js";
import { getApplicationEmoji } from "@utils/emojiManager";

async function generatePerkButtons(correctlyCasedPerkData: CorrectlyCasedPerkData, perkData: Record<string, Perk>): Promise<ButtonBuilder[]> {
    return await Promise.all(Object.keys(correctlyCasedPerkData).map(async perkId => {
        const perkInfo = perkData[perkId];
        if (!perkInfo) return new ButtonBuilder();

        const perkButton = new ButtonBuilder()
            .setCustomId(`shrine_perk::${perkId}`)
            .setLabel(perkInfo.Name)
            .setStyle(ButtonStyle.Secondary);

        const perkEmoji = await getApplicationEmoji(perkId);
        if (perkEmoji) {
            perkButton.setEmoji(perkEmoji.id);
        }

        return perkButton;
    }));
}

export default generatePerkButtons;