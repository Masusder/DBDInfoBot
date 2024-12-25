/**
 * See https://github.com/Masusder/UEParser/blob/master/UEParser/Models/APIComposerModels/Rift.cs
 */
export interface Rift {
    Name: string;
    Requirement: number;
    EndDate: Date;
    StartDate: Date;
    TierInfo: TierInfo[];
}

export interface TierInfo {
    Free: TierInfoItem[];
    Premium: TierInfoItem[];
    TierGroup: number;
    TierId: number;
}

export interface TierInfoItem {
    Amount: number;
    Id: string;
    Type: string;
}
