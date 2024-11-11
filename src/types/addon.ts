/**
 * See https://github.com/Masusder/UEParser/blob/master/UEParser/Models/APIComposerModels/Addon.cs
 */
export interface Addon {
    Type: string;
    ItemType: string;
    ParentItem: string[];
    KillerAbility: string;
    Name: string;
    Description: string;
    Role: string;
    Rarity: string;
    CanBeUsedAfterEvent: boolean;
    Bloodweb: boolean;
    Image: string;
}

export interface AddonExtended extends Addon {
    AddonId: string;
}