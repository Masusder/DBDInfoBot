import { CosmeticTypes } from "@data/CosmeticTypes";
import { NewsContentItem } from "@tps/news";
import { Cosmetic } from "@tps/cosmetic";
import {
    ButtonBuilder,
    ButtonStyle
} from "discord.js";
import splitButtonsIntoRows from "@utils/discord/splitButtons";

function createShowcaseButtons(newsContent: NewsContentItem[], cosmeticData: Record<string, Cosmetic>) {
    let buttons: ButtonBuilder[] = [];
    for (const item of newsContent) {
        if (item.type.toLowerCase() === 'itemshowcase' && item.showcasedItem) {
            for (const showcasedItem of item.showcasedItem) {
                const cosmetic = cosmeticData[showcasedItem.id]

                if (cosmetic !== undefined && CosmeticTypes[cosmetic.Type] !== undefined) {
                    buttons.push(
                        new ButtonBuilder()
                            .setCustomId(`cosmetic_item::${cosmetic.CosmeticId}`)
                            .setLabel(cosmetic.CosmeticName)
                            .setStyle(ButtonStyle.Primary)
                    );
                }
            }
        }
    }

    return splitButtonsIntoRows(buttons, 5);
}

export default createShowcaseButtons;