import { IPlayerData } from "@ui/types/playerStats";

export interface IAdeptDetails {
    maxAdepts: number;
    achievedAdepts: number;
    achievedAdeptsIDs: { [key: string]: boolean | number };
    achievedPercentage: number;
}

export function returnAdepts(
    role: "Killer" | "Survivor",
    playerStatsData: IPlayerData
): IAdeptDetails {
    const adeptKeys = Object.keys(playerStatsData.statsSchema[`Adepts${role}`]);
    const maxAdeptsAmount = adeptKeys.length;

    const { stats, achievements } = playerStatsData;

    // If no achievements, return early
    if (!achievements) {
        return { maxAdepts: maxAdeptsAmount, achievedAdepts: 0, achievedAdeptsIDs: {}, achievedPercentage: 0 };
    }

    const achievedAdeptsObj: { [key: string]: boolean | number } = {};
    const achievedAdeptsArray: string[] = [];

    stats.forEach(({ name, value }) => {
        if (adeptKeys.includes(name)) {
            achievedAdeptsObj[name] = value;
            achievedAdeptsArray.push(name);
        }
    });

    const roleAchievements: Record<string, Record<string, string>> = {
        Killer: {
            ACH_UNLOCK_CHUCKLES_PERKS: "DBD_FinishWithPerks_Idx268435456",
            ACH_UNLOCKBANSHEE_PERKS: "DBD_FinishWithPerks_Idx268435457",
            ACH_UNLOCKHILLBILY_PERKS: "DBD_FinishWithPerks_Idx268435458",
        },
        Survivor: {
            ACH_UNLOCK_DWIGHT_PERKS: "DBD_FinishWithPerks_Idx0",
            ACH_UNLOCK_MEG_PERKS: "DBD_FinishWithPerks_Idx1",
            ACH_UNLOCK_CLAUDETTE_PERKS: "DBD_FinishWithPerks_Idx2",
            ACH_UNLOCK_JACK_PERKS: "DBD_FinishWithPerks_Idx3",
        },
    };

    // Process achievements based on role
    const achievementsMap = roleAchievements[role];
    achievements.forEach(({ apiname, achieved }) => {
        const adeptKey = achievementsMap[apiname];
        if (adeptKey && achieved) {
            achievedAdeptsObj[adeptKey] = achieved;
            achievedAdeptsArray.push(adeptKey);
        }
    });

    const achievedAdeptsArrayFinal = Array.from(new Set(achievedAdeptsArray));
    const achievedAdepts = achievedAdeptsArrayFinal.length;
    const achievedPercentage = maxAdeptsAmount
        ? (achievedAdepts / maxAdeptsAmount) * 100
        : 0;

    return {
        maxAdepts: maxAdeptsAmount,
        achievedAdepts,
        achievedAdeptsIDs: achievedAdeptsObj,
        achievedPercentage: parseFloat(achievedPercentage.toFixed(1))
    };
}
