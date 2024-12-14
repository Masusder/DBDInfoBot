
import { IPlayerData } from "@ui/types/playerStats.ts";
import { formatNumber } from "@utils/stringUtils.ts";

export function getPlaytime(playtime: number | null): string {
    return playtime !== null
        ? formatNumber(Math.trunc(playtime / 60)) + "h"
        : "---";
}

interface IAchData {
    achievedAch: number;
    totalAch: number;
    percentage: number;
}

export function calculateAch(playerData: IPlayerData): IAchData {
    const achievedAch = playerData.achievements.filter(
        (achievement) => achievement.achieved === 1
    ).length;
    const totalAch = playerData.achievementSchema.length;
    const percentage = parseFloat(((achievedAch / totalAch) * 100).toFixed(1));

    return {
        achievedAch,
        totalAch,
        percentage
    };
}