import {
    getCachedGameData,
    initializeGameDataCache
} from '../cache';
import {
    Character,
    CharacterExtended
} from "../types";
import { EGameData } from "@utils/dataUtils";
import { Locale } from "discord.js";

/**
 * Initializes the character cache for the specified locale.
 * This function fetches character data from the API and stores it in the cache.
 *
 * @param locale - The locale to load character data for.
 * @returns {Promise<void>} A promise that resolves when the character cache has been initialized.
 */
export async function initializeCharactersCache(locale: Locale): Promise<void> {
    await initializeGameDataCache<Character>('/api/characters', EGameData.CharacterData, locale);
}

// region Helpers

/**
 * Retrieves a single character's data by its exact name.
 *
 * @param name - The name of the character to retrieve.
 * @param locale - The locale to fetch the character data for.
 * @returns {Promise<CharacterExtended | undefined>} A promise that resolves to the character's data if found, or undefined if not.
 */
export async function getCharacterDataByName(name: string, locale: Locale): Promise<CharacterExtended | undefined> {
    const cachedCharacters = await getCachedCharacters(locale);

    const characterId = Object.keys(cachedCharacters).find(key => cachedCharacters[key].Name.toLowerCase() === name.toLowerCase());

    if (characterId) {
        return { CharacterIndex: characterId, ...cachedCharacters[characterId] };
    }

    return undefined;
}

/**
 * Retrieves a single character's data by its index.
 *
 * @param index - The index of the character to retrieve.
 * @param locale - The locale to fetch the character data for.
 * @returns {Promise<Character | undefined>} A promise that resolves to the character's data if found, or undefined if not.
 */
export async function getCharacterDataByIndex(index: string | number, locale: Locale): Promise<Character | undefined> {
    const cachedCharacters = await getCachedCharacters(locale);
    return cachedCharacters[index];
}

/**
 * Retrieves a list of characters whose names match the query.
 *
 * @param query - The search query to match character names against.
 * @param locale - The locale to fetch the character data for.
 * @returns {Promise<Character[]>} A promise that resolves to an array of matching characters.
 */
export async function getCharacterChoices(query: string, locale: Locale): Promise<Character[]> {
    const cachedCharacters = await getCachedCharacters(locale);

    const lowerCaseQuery = query.toLowerCase();
    return Object.entries(cachedCharacters)
        .filter(([_, character]) => character.Name.toLowerCase().includes(lowerCaseQuery))
        .map(([key, character]) => {
            return { ...character, CharacterIndex: key };
        });
}

/**
 * Retrieves a character by matching its parent item.
 *
 * @param parentItem - The parent item to search for.
 * @param locale - The locale to fetch the character data for.
 * @returns {Promise<Character | undefined>} A promise that resolves to the character's data if found, or undefined if not.
 */
export async function getCharacterByParentItem(parentItem: string, locale: Locale): Promise<Character | undefined> {
    const cachedCharacters = await getCachedCharacters(locale);

    return Object.values(cachedCharacters).find(character => character.ParentItem === parentItem);
}

// noinspection JSUnusedGlobalSymbols
/**
 * Retrieves the index of a character by its name.
 *
 * @param name - The name of the character to search for.
 * @param locale - The locale to fetch the character data for.
 * @returns {Promise<number | undefined>} A promise that resolves to the character index if found, or undefined if not.
 */
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

/**
 * Retrieves the cached character data for the specified locale.
 * If the data is not already cached, it will initialize the cache.
 *
 * @param locale - The locale to fetch the cached character data for.
 * @returns {Promise<{ [key: string]: Character }>} A promise that resolves to the cached character data.
 */
export async function getCachedCharacters(locale: Locale): Promise<{ [key: string]: Character }> {
    return getCachedGameData<Character>('characterData', locale, () => initializeCharactersCache(locale));
}

// endregion