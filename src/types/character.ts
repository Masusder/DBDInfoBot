import { ERole } from "@tps/enums/ERole";

/**
 * See https://github.com/Masusder/UEParser/blob/master/UEParser/Models/APIComposerModels/Character.cs
 */
export interface Character {
    Name: string;
    Role: ERole;
    Gender: string;
    ParentItem: string;
    DLC: string;
    DefaultItems: string[];
    Difficulty: string;
    BackStory: string;
    Biography: string;
    IconFilePath: string;
    BackgroundImagePath: string;
    Hints: Hint[];
    Id: string;
    CharacterIndex?: string;
}

export interface Hint {
    Role: ERole;
    Title: string;
    Description: string;
    IconPath: string;
}

export interface CharacterExtended extends Character {
    CharacterIndex: string;
}
