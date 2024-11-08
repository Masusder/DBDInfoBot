import {
    getCachedGameData,
    initializeGameDataCache
} from '../cache';
import { Character } from "../types";
import { EGameData } from "@utils/dataUtils";
import { Locale } from "discord.js";

export async function initializeCharactersCache(locale: Locale): Promise<void> {
    await initializeGameDataCache<Character>('/api/characters', EGameData.CharacterData, locale);
}

// region Helpers
// Retrieve a single character by index
export async function getCharacterDataByIndex(index: string | number, locale: Locale): Promise<Character | undefined> {
    const cachedCharacters = await getCachedCharacters(locale);
    return cachedCharacters[index];
}

export async function getCharacterChoices(query: string, locale: Locale): Promise<Character[]> {
    const cachedCharacters = await getCachedCharacters(locale);

    const lowerCaseQuery = query.toLowerCase();
    return Object.entries(cachedCharacters)
        .filter(([_, character]) => character.Name.toLowerCase().includes(lowerCaseQuery))
        .map(([key, character]) => {
            return { ...character, CharacterIndex: key };
        });
}

export async function getCharacterIndexByName(name: string | null, locale: Locale): Promise<number | undefined> {
    const cachedCharacters = await getCachedCharacters(locale);

    if (!name) return undefined;

    const lowerCaseName = name.toLowerCase();
    for (const [key, character] of Object.entries(cachedCharacters)) {
        if (character.Name.toLowerCase().includes(lowerCaseName)) {
            return parseInt(key);
        }
    }

    return undefined;
}

export async function getCachedCharacters(locale: Locale): Promise<{ [key: string]: Character }> {
    return getCachedGameData<Character>('characterData', locale, () => initializeCharactersCache(locale));
}

// endregion