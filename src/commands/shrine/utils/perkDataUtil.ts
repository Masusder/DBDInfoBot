import { CorrectlyCasedPerkData } from "@commands/shrine/models";
import { Perk } from "@tps/perk";
import { IShrinePerkItem } from "@tps/shrine";

function getCorrectlyCasedPerkData(perks: IShrinePerkItem[], perkData: Record<string, Perk>): CorrectlyCasedPerkData {
    return perks.reduce((acc, perk) => {
        const [correctKey] = Object.entries(perkData).find(([key]) => key.toLowerCase() === perk.id.toLowerCase()) || [];
        if (correctKey) {
            acc[correctKey] = { bloodpoints: perk.bloodpoints, shards: perk.shards };
        }
        return acc;
    }, {} as CorrectlyCasedPerkData);
}

export default getCorrectlyCasedPerkData;