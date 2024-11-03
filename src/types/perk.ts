/**
 * See https://github.com/Masusder/UEParser/blob/master/UEParser/Models/APIComposerModels/Perk.cs
 */
export interface Perk {
    Character: number;
    Name: string;
    Description: string;
    IconFilePathList: string;
    Categories?: string;
    Tag: string;
    Role: string;
    TeachableLevel: number;
    Tunables: string[][];
}