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

export enum EGameData {
    CosmeticData = 'cosmeticData',
    CharacterData = 'characterData',
    PerkData = 'perkData',
    AddonData = 'addonData',
    OfferingData = 'offeringData'
}

interface GameDataOptions {
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

export async function getGameData(options: GameDataOptions = {}): Promise<GameData> {
    const dataFetchers: { [key in keyof GameDataOptions]: () => Promise<any> } = {
        cosmeticData: getCachedCosmetics,
        characterData: getCachedCharacters,
        perkData: getCachedPerks,
        addonData: getCachedAddons,
        offeringData: getCachedOfferings
    };

    const tasks = Object.entries(dataFetchers)
        .filter(([key]) => options[key as keyof GameDataOptions])
        .map(([_, fetcher]) => fetcher());

    const results = await Promise.all(tasks);
    return Object.keys(dataFetchers).reduce((acc, key) => {
        acc[key as keyof GameData] = options[key as keyof GameDataOptions] ? results.shift() : null;
        return acc;
    }, {} as GameData);
}
