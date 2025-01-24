import { returnStatValue } from "@ui/components/StatsSummaryCard/utils/statUtils";
import { Map } from '@tps/map';
import { IPlayerData } from "@ui/components/StatsSummaryCard/types/playerStats";

export interface IMapDetails {
    key: string;
    value: number;
    percentage: string;
    description: string;
    iconPath: string;
}

export function collectMapDetails(playerData: IPlayerData, mapsData: { [key: string]: Map }): IMapDetails[] {
    const mapValues = Object.keys(playerData.statsSchema.EscapesSpecific).map(key => {
        return {
            key: key,
            description: playerData.statsSchema.EscapesSpecific[key].description,
            value: returnStatValue(playerData.stats, key),
            mapId: playerData.statsSchema.EscapesSpecific[key].mapId
        };
    });

    const topMaps = mapValues.sort((a, b) => b.value - a.value).slice(0, 3);
    const totalValue = mapValues.reduce((sum, map) => sum + map.value, 0);

    if (topMaps.length < 3) throw Error('Not enough maps to calculate top maps');

    return topMaps.map(map => ({
        key: map.key,
        value: map.value,
        percentage: ((map.value / totalValue) * 100).toFixed(2) + '%',
        description: map.description,
        iconPath: map.mapId ? mapsData[map.mapId]?.Thumbnail! : ''
    }));
}