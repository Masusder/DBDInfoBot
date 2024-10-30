/**
 * See https://github.com/Masusder/UEParser/blob/master/UEParser/Models/APIComposerModels/Character.cs
 */
export interface Character {
    /**
     * Character name
     */
    Name: string;

    /**
     * Character role
     * Killer or Survivor
     */
    Role: string;

    /**
     * Character gender
     */
    Gender: string;

    /**
     * Associated power to the character
     */
    ParentItem: string;

    /**
     * Associated DLC to the character
     */
    DLC: string;

    /**
     * Difficulty of the character
     */
    Difficulty: string;

    /**
     * Back story of the character
     */
    BackStory: string;

    /**
     * Biography of the character
     */
    Biography: string;

    /**
     * Path to portrait of the character
     */
    IconFilePath: string;

    /**
     * Path to background of the character
     */
    BackgroundImagePath: string;

    /**
     * Character ID (it should be noted that it's different from character index!)
     */
    Id: string;
}
