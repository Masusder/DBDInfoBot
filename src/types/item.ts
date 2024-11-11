/**
 * See https://github.com/Masusder/UEParser/blob/master/UEParser/Models/APIComposerModels/Item.cs
 */
export interface Item {
    RequiredAbility: string;
    Role: string;
    Rarity: string;
    Type: string;
    ItemType: string;
    Name: string;
    Description: string;
    IconFilePathList: string;
    Inventory: boolean;
    Chest: boolean;
    Bloodweb: boolean;
    IsBotSupported: boolean;
}

export interface ItemExtended extends Item {
    ItemId: string;
}