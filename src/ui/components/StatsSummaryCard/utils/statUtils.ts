import {
    IStat,
    IStatSchema,
    IStatsSchema
} from "@ui/components/StatsSummaryCard/types/playerStats";

const excludedCategories = ['AdeptsSurvivor', 'AdeptsKiller', 'EscapesSpecific', 'Rank'];

const parsePercentage = (percentage: string | number | undefined): number => {
    return percentage !== undefined
        ? typeof percentage === 'number'
            ? percentage
            : parseInt(percentage, 10) || 0
        : 0;
}

export function returnStatValue(statsData: IStat[], statId: string): number {
    for (const stat of statsData) {
        if (stat.name === statId) {
            return stat.value;
        }
    }
    return 0;
}

export function rollRandomStats(statsSchema: IStatsSchema, count = 6): IStatSchema[] {
    const allEntries = Object.entries(statsSchema)
        .filter(([key]) => !excludedCategories.includes(key))
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        .flatMap(([_, categoryData]) =>
            Object.entries(categoryData).map(([id, entry]) => ({
                description: entry.description || '',
                role: entry.role || 'None',
                iconPath: entry.iconPath || '',
                statId: id
            }))
        );

    for (let i = allEntries.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [allEntries[i], allEntries[j]] = [allEntries[j], allEntries[i]];
    }

    return allEntries.slice(0, count);
}

export function findTopKillerStat(statsSchema: IStatsSchema): IStatSchema {
    const acceptedCategories = ['KillerSpecific', 'SpecificDowns'];

    const allEntries = Object.entries(statsSchema)
        .filter(([key]) => acceptedCategories.includes(key))
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        .flatMap(([_, categoryData]) =>
            Object.entries(categoryData).map(([id, entry]) => ({
                description: entry.description || '',
                character: entry.character || '-1',
                role: entry.role || 'None',
                iconPath: entry.iconPath || '',
                statId: id,
                percentage: entry.percentage || '0%'
            }))
        );

    const topStat = allEntries.reduce((prev, current) =>
        parsePercentage(current.percentage) > parsePercentage(prev.percentage)
            ? current
            : prev
    );

    const formattedPercentage = `${parsePercentage(topStat.percentage).toFixed(1)}%`;

    return {
        description: topStat.description,
        role: topStat.role,
        iconPath: topStat.iconPath,
        statId: topStat.statId,
        percentage: formattedPercentage,
        character: topStat.character
    };
}

export function findBestStat(statsSchema: IStatsSchema): IStatSchema | null {
    let bestStat: IStatSchema | null = null;
    let highestPercentage = 0;

    for (const [category, categoryData] of Object.entries(statsSchema)) {
        if (excludedCategories.includes(category)) continue;
        for (const [id, entry] of Object.entries(categoryData)) {
            const currentPercentage = parsePercentage(entry.percentage);
            if (currentPercentage > highestPercentage) {
                highestPercentage = currentPercentage;
                bestStat = {
                    description: entry.description || '',
                    role: entry.role || 'None',
                    iconPath: entry.iconPath || '',
                    statId: id,
                    percentage: `${currentPercentage.toFixed(1)}%`,
                    character: entry.character || 'Unknown'
                };
            }
        }
    }

    return bestStat;
}