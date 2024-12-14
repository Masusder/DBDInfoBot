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

    const addAchievement = (achievementName: string, adeptKey: string) => {
        const achievement = achievements.find((ach) => ach.apiname === achievementName);
        if (achievement) {
            achievedAdeptsObj[adeptKey] = achievement.achieved;
            achievedAdeptsArray.push(adeptKey);
        }
    };

    if (role === "Killer") {
        addAchievement("ACH_UNLOCK_CHUCKLES_PERKS", "DBD_FinishWithPerks_Idx268435456");
        addAchievement("ACH_UNLOCKBANSHEE_PERKS", "DBD_FinishWithPerks_Idx268435457");
        addAchievement("ACH_UNLOCKHILLBILY_PERKS", "DBD_FinishWithPerks_Idx268435458");
    } else if (role === "Survivor") {
        addAchievement("ACH_UNLOCK_DWIGHT_PERKS", "DBD_FinishWithPerks_Idx0");
        addAchievement("ACH_UNLOCK_MEG_PERKS", "DBD_FinishWithPerks_Idx1");
        addAchievement("ACH_UNLOCK_CLAUDETTE_PERKS", "DBD_FinishWithPerks_Idx2");
        addAchievement("ACH_UNLOCK_JACK_PERKS", "DBD_FinishWithPerks_Idx3");
    }

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
