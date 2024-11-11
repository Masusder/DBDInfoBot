import {
    getCachedGameData,
    initializeGameDataCache
} from '../cache';
import { Character } from "../types";
import { EGameData } from "@utils/dataUtils";
import { Locale } from "discord.js";
import { CharacterExtended } from "../types/character";

export async function initializeCharactersCache(locale: Locale): Promise<void> {
    await initializeGameDataCache<Character>('/api/characters', EGameData.CharacterData, locale);
}

// region Helpers

// Retrieve a single character by exact name
export async function getCharacterDataByName(name: string, locale: Locale): Promise<CharacterExtended | undefined> {
    const cachedCharacters = await getCachedCharacters(locale);

    const characterId = Object.keys(cachedCharacters).find(key => cachedCharacters[key].Name.toLowerCase() === name.toLowerCase());

    if (characterId) {
        return { CharacterIndex: characterId, ...cachedCharacters[characterId] };
    }

    return undefined;
}

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

// Retrieve character that matches the specified parent item
export async function getCharacterByParentItem(parentItem: string, locale: Locale): Promise<Character | undefined> {
    const cachedCharacters = await getCachedCharacters(locale);

    return Object.values(cachedCharacters).find(character => character.ParentItem === parentItem);
}

// Retrieve character index by its name
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