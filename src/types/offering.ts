/**
 * See https://github.com/Masusder/UEParser/blob/master/UEParser/Models/APIComposerModels/Offering.cs
 */
export interface Offering {
    Type: string;
    StatusEffects: string[];
    Tags: string[];
    Available: string;
    Name: string;
    Description: string;
    Role: string;
    Rarity: string;
    Image: string;
}

export interface OfferingExtended extends Offering {
    OfferingId: string;
}