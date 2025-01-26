export interface DLC {
    Name: string | null;
    HeaderImage: string | null;
    BannerImage: string;
    DetailedDescription: string | null;
    Description: string | null;
    SteamId: string;
    EpicId: string;
    PS4Id: string;
    XB1_XSX_GDK: string;
    SwitchId: string;
    WindowsStoreId: string;
    PS5Id: string;
    StadiaId: string;
    ReleaseDate: string | null;
    AllowsCrossProg: boolean;
    Screenshots: any[] | null;
    SortOrder: number;
}

export interface DLCExtended extends DLC {
    DlcId: string;
}