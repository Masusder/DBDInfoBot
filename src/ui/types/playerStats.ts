export interface IPlayerData {
    steam: {
        avatarIcon: string;
        playerName: string;
        steamId: string;
        playtime: number;
        playtimeLastTwoWeeks: number;
    },
    stats: IStat[],
    achievements: IAchievement[],
    achievementSchema: IAchievementSchema[],
    statsSchema: IStatsSchema
}

export interface IAchievement {
    apiname: string;
    achieved: number;
    unlocktime: number;
}

export interface IAchievementSchema {
    name: string,
    defaultvalue: number,
    displayName: string,
    hidden: number,
    description?: string,
    icon: string,
    icongray: string
}

export interface IStat {
    name: string;
    value: number;
}

export interface IStatsSchema {
    [key: string]: { [statName: string]: IStatSchema };
}

export interface IStatSchema {
    description: string;
    iconPath?: string;
    role?: 'Killer' | 'Survivor' | 'None';
    character?: string;
    statId?: string;
    percentage?: string;
    mapId?: string;
}