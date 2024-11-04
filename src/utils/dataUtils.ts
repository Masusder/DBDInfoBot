import { getCachedCharacters } from "../services/characterService";
import { getCachedPerks } from "../services/perkService";
import { getCachedAddons } from "../services/addonService";
import { getCachedOfferings } from "../services/offeringService";
import { getCachedCosmetics } from "../services/cosmeticService";
import {
    Addon,
    Character,
    Cosmetic,
    Offering,
    Perk
} from "../types";

interface GetGameDataOptions {
    cosmeticData?: boolean;
    characterData?: boolean;
    perkData?: boolean;
    addonData?: boolean;
    offeringData?: boolean;
}

interface GameData {
    cosmeticData: { [key: string]: Cosmetic };
    characterData: { [key: string]: Character };
    perkData: { [key: string]: Perk };
    addonData: { [key: string]: Addon };
    offeringData: { [key: string]: Offering };
}

export async function getGameData(options: GetGameDataOptions = {}): Promise<GameData> {
    const dataFetchers: { [key in keyof GetGameDataOptions]: () => Promise<any> } = {
        cosmeticData: getCachedCosmetics,
        characterData: getCachedCharacters,
        perkData: getCachedPerks,
        addonData: getCachedAddons,
        offeringData: getCachedOfferings
    };

    const tasks = Object.entries(dataFetchers)
        .filter(([key]) => options[key as keyof GetGameDataOptions])
        .map(([_, fetcher]) => fetcher());

    const results = await Promise.all(tasks);
    return Object.keys(dataFetchers).reduce((acc, key) => {
        acc[key as keyof GameData] = options[key as keyof GetGameDataOptions] ? results.shift() : null;
        return acc;
    }, {} as GameData);
}
