/**
 * See https://github.com/Masusder/UEParser/blob/master/UEParser/Models/APIComposerModels/Bundle.cs
 */
export interface Bundle {
    Id: string;
    SpecialPackTitle: string;
    ImagePath: string | null;
    Uri: string | null;
    StartDate?: Date;
    EndDate?: Date;
    SortOrder: number;
    MinNumberOfUnownedForPurchase: number;
    Purchasable: boolean;
    IsChapterBundle: boolean;
    IsLicensedBundle: boolean;
    DlcId?: string;
    FullPrice: FullPrice[];
    ImageComposition: ImageComposition | null;
    Discount: number;
    ConsumptionRewards: ConsumptionRewards[];
    Consumable: boolean;
    Type: string;
    SegmentationTags?: any[];
}

export interface ImageComposition {
    MaxItemCount: number;
    OverrideDefaults: boolean;
    Type: string;
}

export interface GameSpecificData {
    HasPriorityForPackImageComposition: boolean;
    IgnoreOwnership: boolean;
    IncludeInOwnership: boolean;
    IncludeInPricing: boolean;
    Type: string;
}

export interface FullPrice {
    CurrencyId: string;
    Price: number;
}

export interface ConsumptionRewards {
    Amount: number;
    Id: string;
    Type: string;
    GameSpecificData: GameSpecificData;
}