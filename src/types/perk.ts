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
    Role: 'Killer' | 'Survivor';
    TeachableLevel: number;
    Tunables: string[][];
}

export interface PerkExtended extends Perk {
    PerkId: string;
}