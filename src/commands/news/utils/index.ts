import { Locale } from "discord.js";
import { ContentItem, } from "@tps/news";
import { combineBaseUrlWithPath } from "@utils/stringUtils";
import { getCachedCosmetics } from "@services/cosmeticService";
import { CosmeticTypes } from "@data/CosmeticTypes";
import { generateStoreCustomizationIcons } from "@commands/info/cosmetic/utils";
import { combineImagesIntoGrid } from "@utils/imageUtils";
import { INewsDataTable } from "../types";
import { NewsDataTable } from "../data";
import { getCharacterIndexById } from "@services/characterService";
import generateCharacterIcons from "@utils/images/characterIcon";

// Devs introduced internal routes with release of revamped news section
// internal routes start with "dbd://" prefix
export function formatNewsLink(link: string): string {
    switch (true) {
        case link.startsWith('https'):
            return link;

        case link.startsWith("dbd://StoreCollections"): {
            const match = link.match(/collectionId=([^&]+)/);
            if (match) return combineBaseUrlWithPath(`/store/collections/${match[1]}`);
            break;
        }

        case link.startsWith("dbd://StoreSpecials"):
            // noinspection SpellCheckingInspection
            return combineBaseUrlWithPath('/store/cosmetics?filter=%7B%22IsDiscounted%22%3Atrue%7D');

        case (link.startsWith("dbd://StoreKillers") || link.startsWith("dbd://StoreSurvivors")): {
            const match = link.match(/characterIndex=([^&]+)/);
            if (match) return combineBaseUrlWithPath(`/store/cosmetics?filter=%7B%22Character%22%3A${match[1]}%7D`);
            break;
        }
    }

    return link;
}

export async function createItemShowcaseImage(content: ContentItem[], locale: Locale): Promise<Buffer | null> {
    const cosmeticData = await getCachedCosmetics(locale);

    let cosmeticIds: string[] = [];
    let characterIndexes: string[] = [];
    for (const item of content) {
        if (item.type === 'ItemShowcase' && item.showcasedItem) {
            for (const showcasedItem of item.showcasedItem) {
                const id = showcasedItem.id;

                switch (true) {
                    case (cosmeticData[id] !== undefined && CosmeticTypes[cosmeticData[id].Type] !== undefined): {
                        cosmeticIds.push(showcasedItem.id);
                        break;
                    }
                    case true: {
                        const characterIndex = await getCharacterIndexById(id, locale);

                        if (characterIndex !== undefined) {
                            characterIndexes.push(characterIndex);
                        }

                        break;
                    }
                }
            }
        }
    }

    if (cosmeticIds.length === 0 && characterIndexes.length === 0) return null;

    const customizationBuffers = await generateStoreCustomizationIcons(cosmeticIds, cosmeticData) as Buffer[];
    const characterBuffers = await generateCharacterIcons(characterIndexes, locale);

    return await combineImagesIntoGrid([...customizationBuffers, ...characterBuffers], 5, 10);
}

export function matchToEvent(eventId: string | null): INewsDataTable {
    if (!eventId) {
        return NewsDataTable.News;
    }

    switch (true) {
        case eventId.startsWith("Halloween"):
            return NewsDataTable.Halloween;
        case eventId.startsWith("Winter"):
            return NewsDataTable.Winter;
        case eventId.startsWith("Spring"):
            return NewsDataTable.Spring;
        case eventId.startsWith("Anniversary"):
            return NewsDataTable.Anniversary;
        default:
            return NewsDataTable.News;
    }
}