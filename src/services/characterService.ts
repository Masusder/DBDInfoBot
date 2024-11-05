import {
    getCachedGameData,
    initializeGameDataCache
} from '../cache';
import { Character } from "../types";
import { EGameData } from "../utils/dataUtils";

export async function initializeCharactersCache(): Promise<void> {
    await initializeGameDataCache<Character>('/api/characters', EGameData.CharacterData);
}

// region Helpers
// Retrieve a single character by index
export async function getCharacterDataByIndex(index: string | number): Promise<Character | undefined> {
    const cachedCharacters = await getCachedCharacters();
    return cachedCharacters[index];
}

export async function getCharacterChoices(query: string): Promise<Character[]> {
    const cachedCharacters = await getCachedCharacters();

    const lowerCaseQuery = query.toLowerCase();
    return Object.entries(cachedCharacters)
        .filter(([_, character]) => character.Name.toLowerCase().includes(lowerCaseQuery))
        .map(([key, character]) => {
            return { ...character, CharacterIndex: key };
        });
}

export async function getCharacterIndexByName(name: string | null): Promise<number | undefined> {
    const cachedCharacters = await getCachedCharacters();

    if (!name) return undefined;

    const lowerCaseName = name.toLowerCase();
    for (const [key, character] of Object.entries(cachedCharacters)) {
        if (character.Name.toLowerCase().includes(lowerCaseName)) {
            return parseInt(key);
        }
    }

    return undefined;
}

export async function getCachedCharacters(): Promise<{ [key: string]: Character }> {
    return getCachedGameData<Character>('characterData', initializeCharactersCache);
}

// endregion