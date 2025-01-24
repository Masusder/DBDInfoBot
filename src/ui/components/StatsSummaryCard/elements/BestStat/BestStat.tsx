import {
    findBestStat,
    returnStatValue
} from "@ui/components/StatsSummaryCard/utils/statUtils";
import React from "react";
import {
    IPlayerData,
    IStatSchema
} from "@ui/components/StatsSummaryCard/types/playerStats";
import {
    combineBaseUrlWithPath,
    formatNumber
} from "@utils/stringUtils";

type BestStatProps = {
    playerData: IPlayerData;
}

function BestStat({ playerData }: BestStatProps) {
    const bestStat = findBestStat(playerData.statsSchema);

    if (!bestStat) return null;

    return (
        <div className="bestStat-bestStatContainer">
            <div className="bestStat-bestStatTitleContainer">
                <i className="fa-solid fa-crown fa-2x fontawesomeIcon" style={{ marginTop: '4px', color: 'gold' }}/>
                <div className="bestStat-bestStatTitle">Best Stat</div>
            </div>
            <BestStatBox playerData={playerData} bestStat={bestStat}/>
        </div>
    );
}

type BestStatsBoxProps = {
    playerData: IPlayerData;
    bestStat: IStatSchema;
}
const BestStatBox: React.FC<BestStatsBoxProps> = ({ playerData, bestStat }: BestStatsBoxProps) => {
    if (!bestStat.statId || !bestStat.iconPath) return null;

    const value = returnStatValue(playerData.stats, bestStat.statId);

    return (
        <div className="bestStat-statsBox">
            <img className="bestStat-statIcon" src={combineBaseUrlWithPath(bestStat.iconPath)} alt=""/>
            <div className="bestStat-statsBoxContent">
                <div className="bestStat-statValue">{formatNumber(Math.trunc(value))}</div>
                <div className="bestStat-statDescription">{bestStat.description}</div>
            </div>
            <div className="bestStat-bestDescription">Better than {bestStat.percentage} players!</div>
        </div>
    );
};

export default BestStat;
