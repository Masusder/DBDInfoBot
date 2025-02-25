import { Bundle } from "@tps/bundle";
import { Cosmetic } from "@tps/cosmetic";
import {
    AttachmentBuilder,
    Locale
} from "discord.js";
import {
    Currencies,
    ICurrencyAmount
} from "@data/Currencies";
import { getCharacterIndexById } from "@services/characterService";
import { combineBaseUrlWithPath } from "@utils/stringUtils";
import { fetchImageBuffer } from "@commands/info/bundle/utils";
import { generateStoreCustomizationIcons } from "@commands/info/cosmetic/utils";
import generateCharacterIcons from "@utils/images/characterIcon";
import { generateCurrencyImage } from "@utils/images/currencyImage";
import { combineImagesIntoGrid } from "@utils/imageUtils";

async function prepareAttachments(
    bundle: Bundle,
    cosmeticData: Record<string, Cosmetic>,
    cosmeticIdsSet: Set<string>,
    locale: Locale
) {
    let characterIndexes: string[] = [];
    let riftPassIconBuffer: Buffer | null = null;
    let currencies: ICurrencyAmount[] = [];
    for (const consumption of bundle.ConsumptionRewards) {
        const id = consumption.Id;

        if (consumption.GameSpecificData.Type === "Character") {
            const characterIndex = await getCharacterIndexById(id, locale);

            if (characterIndex !== undefined) {
                characterIndexes.push(characterIndex);
            }
        }

        if (consumption.GameSpecificData.Type === "RiftPass") {
            const riftPassIconUrl = combineBaseUrlWithPath('/images/Other/RiftPassIcon.png');
            riftPassIconBuffer = await fetchImageBuffer(riftPassIconUrl);
        }

        if (consumption.GameSpecificData.Type === "RiftTier") {
            const currency = Currencies["RiftFragments"] as ICurrencyAmount;

            currency.amount = consumption.Amount;
            currencies.push(currency);
        }
    }

    const [customizationBuffers, characterBuffers, currencyBuffers] = await Promise.all([
        generateStoreCustomizationIcons(Array.from(cosmeticIdsSet), cosmeticData, true),
        generateCharacterIcons(characterIndexes, locale),
        generateCurrencyImage(currencies)
    ]);

    const imagesToCombine = [...customizationBuffers, ...characterBuffers, ...currencyBuffers];
    if (riftPassIconBuffer) {
        imagesToCombine.push(riftPassIconBuffer);
    }

    if (imagesToCombine.length === 0) {
        return [];
    }

    let imagesPerRow = 5;
    if (imagesToCombine.length >= 40) {
        imagesPerRow = 10;
    }

    const bundleContentImage = await combineImagesIntoGrid(imagesToCombine, imagesPerRow, 20);

    return [
        new AttachmentBuilder(bundleContentImage, { name: `bundle_${bundle.Id}.png` })
    ]
}

export default prepareAttachments;