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