export interface IShrine {
    currentShrine: IShrineItem;
    pastShrines: IShrineItem[] | null;
}

export interface IShrineItem {
    id?: number,
    perks: IShrinePerkItem[];
    startDate: string;
    endDate: string;
}

export interface IShrinePerkItem {
    id: string;
    bloodpoints: number;
    shards: number[];
}