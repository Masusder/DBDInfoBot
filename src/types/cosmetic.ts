import { ERole } from "@tps/enums/ERole";

/**
 * See https://github.com/Masusder/UEParser/blob/master/UEParser/Models/APIComposerModels/Cosmetic.cs
 */
export interface TemporaryDiscount {
    currencyId: string;
    discountPercentage: number;
    endDate: string;
    startDate: string;
}

export interface Cosmetic {
    CosmeticId: string;
    CosmeticName: string;
    Description: string;
    IconFilePathList: string;
    EventId?: string | null;
    ModelDataPath?: string | null;
    CollectionName: string;
    InclusionVersion: string;
    CustomizedAudioStateCollection: string;
    Type: string;
    Category: string;
    Character: number;
    Unbreakable: boolean;
    Purchasable: boolean;
    ReleaseDate: string;
    LimitedTimeEndDate?: string | null;
    Role: ERole;
    Rarity: string;
    Prefix?: string | null;
    TomeId?: string | null;
    OutfitItems: string[];
    DiscountPercentage: number;
    IsDiscounted: boolean;
    Prices: Record<string, number>[];
    TemporaryDiscounts: TemporaryDiscount[];
}