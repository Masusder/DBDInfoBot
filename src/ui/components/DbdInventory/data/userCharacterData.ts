import { Character } from "@tps/character";
import { DbdCharacterItem } from "@commands/inventory/schemas/characterDataSchema";

export function findUserCharacterData(
    character: Character,
    userCharacterData: DbdCharacterItem[]
): DbdCharacterItem | null {
    for (let i = 0; i < userCharacterData.length; i++) {
        if (userCharacterData[i].objectId.toLowerCase() === character.Id.toLowerCase()) {
            return userCharacterData[i];
        }
    }

    return null;
}