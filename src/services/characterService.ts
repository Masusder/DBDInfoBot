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
        console.error('Error fetching cosmetics:', error);
    }
}

// region Helpers
// Retrieve a single character by index
export function getCharacterDataByIndex(index: string | number): Character | undefined {
    const cachedCharacters = getCachedCharacters();
    return cachedCharacters[index];
}

export function getCharacterIndexByName(name: string | null): number | undefined {
    const cachedCharacters = getCachedCharacters();

    if (!name) return undefined;

    const lowerCaseName = name.toLowerCase();
    for (const [key, character] of Object.entries(cachedCharacters)) {
        if (character.Name.toLowerCase().includes(lowerCaseName)) {
            return parseInt(key);
        }
    }

    return undefined;
}

export function getCachedCharacters(): { [key: string]: Character } {
    const cachedCharacters = getCache<{ [key: string]: Character }>('characterData');
    if (!cachedCharacters || Object.keys(cachedCharacters).length === 0) {
        console.warn("No characters found in cache.");
        return {};
    }
    return cachedCharacters;
}
// endregion