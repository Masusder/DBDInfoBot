import { Bundle } from "@tps/bundle";
import { Cosmetic } from "@tps/cosmetic";
import {
    ButtonBuilder,
    ButtonStyle,
} from "discord.js";
import splitButtonsIntoRows from "@utils/discord/splitButtons";

function prepareButtons(
    bundle: Bundle,
    cosmeticIds: Set<string>,
    cosmeticData: Record<string, Cosmetic>
) {
    for (const consumption of bundle.ConsumptionRewards) {
        const id = consumption.Id;
        if (consumption.GameSpecificData.Type === "Customization" && cosmeticData[id]) {

        }
    }

    const buttons = Array.from(cosmeticIds).map(id => new ButtonBuilder()
        .setCustomId(`cosmetic_item::${id}`)
        .setLabel(cosmeticData[id].CosmeticName)
        .setStyle(ButtonStyle.Primary)
    ).filter(button => button !== undefined);

    // If there's more than 10 buttons then simply don't show any
    // as to not overwhelm the users
    if (buttons.length > 10) return [];

    return splitButtonsIntoRows(buttons, 5);
}

export default prepareButtons;