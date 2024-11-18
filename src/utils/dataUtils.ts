// import { getCachedCharacters } from "@services/characterService";
// import { getCachedPerks } from "@services/perkService";
// import { getCachedAddons } from "@services/addonService";
// import { getCachedOfferings } from "@services/offeringService";
// import { getCachedCosmetics } from "@services/cosmeticService";
// import {
//     Addon,
//     Character,
//     Cosmetic,
//     Offering,
//     Perk,
//     Item
// } from "../types";
// import { Locale } from "discord.js";
// import { getCachedItems } from "@services/itemService";

export enum EGameData {
    CosmeticData = 'cosmeticData',
    CharacterData = 'characterData',
    PerkData = 'perkData',
    AddonData = 'addonData',
    OfferingData = 'offeringData',
    ItemData = 'itemData'
}

// interface GameDataOptions {
//     cosmeticData?: boolean;
//     characterData?: boolean;
//     perkData?: boolean;
//     addonData?: boolean;
//     offeringData?: boolean;
//     itemData?: boolean;
// }
//
// interface GameData {
//     cosmeticData: { [key: string]: Cosmetic };
//     characterData: { [key: string]: Character };
//     perkData: { [key: string]: Perk };
//     addonData: { [key: string]: Addon };
//     offeringData: { [key: string]: Offering };
//     itemData: { [key: string]: Item };
// }

// export async function getGameData(options: GameDataOptions = {}, locale: Locale): Promise<GameData> {
//     const dataFetchers: { [key in keyof GameDataOptions]: (locale: Locale) => Promise<any> } = {
//         cosmeticData: getCachedCosmetics,
//         characterData: getCachedCharacters,
//         perkData: getCachedPerks,
//         addonData: getCachedAddons,
//         offeringData: getCachedOfferings,
//         itemData: getCachedItems
//     };
//
//     const tasks = Object.entries(dataFetchers)
//         .filter(([key]) => options[key as keyof GameDataOptions])
//         .map(([_, fetcher]) => fetcher(locale));
//
//     const results = await Promise.all(tasks);
//     return Object.keys(dataFetchers).reduce((acc, key) => {
//         acc[key as keyof GameData] = options[key as keyof GameDataOptions] ? results.shift() : null;
//         return acc;
//     }, {} as GameData);
// }
