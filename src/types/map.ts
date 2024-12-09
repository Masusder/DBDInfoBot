export interface Map {
    Realm: string;
    MapId?: string;
    Name: string;
    Description: string;
    HookMinDistance: number;
    HookMinCount: number;
    HookMaxCount: number;
    PalletsMinDistance: number;
    PalletsMinCount: number;
    PalletsMaxCount: number;
    DLC?: string;
    Thumbnail?: string;
}