import axios from '../utils/apiClient';
import { Character } from "../types/character";
import { setCache, getCache } from '../cache';

export async function initializeCharactersCache(): Promise<void> {
    try {
        const response = await axios.get('/api/characters');
        if (response.data.success) {
            const charactersData: { [key: string]: Character } = response.data.data;
            setCache('characterData', charactersData);
            console.log(`Fetched and cached ${Object.keys(charactersData).length} characters.`);
        } else {
            console.error("Failed to fetch characters: API responded with success = false");
        }
    } catch (error) {
        console.error('Error fetching characters:', error);
    }
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
    let cachedCharacters = getCache<{ [key: string]: Character }>('characterData');

    if (!cachedCharacters || Object.keys(cachedCharacters).length === 0) {
        console.warn("Character cache expired or empty. Fetching new data...");
        await initializeCharactersCache();
        cachedCharacters = getCache<{ [key: string]: Character }>('characterData') || {};
    }

    return cachedCharacters;
}
// endregion