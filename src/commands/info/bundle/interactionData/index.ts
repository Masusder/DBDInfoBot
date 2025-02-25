import { Bundle } from "@tps/bundle";
import { Cosmetic } from "@tps/cosmetic";
import { Locale } from "discord.js";
import prepareAttachments from "@commands/info/bundle/interactionData/attachments";
import buildBundleContentEmbed from "@commands/info/bundle/interactionData/embed";
import prepareButtons from "@commands/info/bundle/interactionData/buttons";
import { getCosmeticIds } from "@commands/info/bundle/utils";

async function generateBundleInteractionData(
    bundle: Bundle,
    cosmeticData: Record<string, Cosmetic>,
    locale: Locale
) {
    const cosmeticIds = getCosmeticIds(bundle, cosmeticData);
    const buttons = prepareButtons(bundle, cosmeticIds, cosmeticData);
    const [embed, attachments] = await Promise.all([
        buildBundleContentEmbed(bundle, cosmeticData, locale),
        prepareAttachments(bundle, cosmeticData, cosmeticIds, locale)
    ])

    return { embed, attachments, buttons };
}

export default generateBundleInteractionData;