import React from 'react';
import { combineBaseUrlWithPath } from "@utils/stringUtils.ts";
import {
    findTopKillerStat,
    formatNumber,
    returnStatValue
} from "@ui/utils/statUtils.ts";
import { IPlayerData } from "@ui/types/playerStats.ts";
import { Character } from "@tps/character.ts";

type TopKillerProps = {
    playerData: IPlayerData;
    characterData: { [key: string]: Character };
}

function TopKiller({ playerData, characterData }: TopKillerProps) {
    const topKiller = findTopKillerStat(playerData.statsSchema);

    if (!topKiller || !topKiller?.character || !topKiller.statId || !topKiller.percentage) return null;

    const charBg = combineBaseUrlWithPath(characterData[topKiller.character].BackgroundImagePath);

    return (
        <div className="topKiller-container">
            <div className="topKiller-split-container">
                <div className="topKiller-content-container">
                    <div className="topKiller-title-container">
                        <i className="fa-solid fa-award fa-2x fontawesomeIcon" style={{ marginTop: '4px' }} />
                        <div className="topKiller-title">Top Killer</div>
                    </div>
                    <div className="topKiller-outperformed-text">Outperformed other players in:</div>
                    <div className="topKiller-stat-description">{topKiller.description}</div>
                </div>
                <div className="topKiller-bottom-content-panel">
                    <div className="topKiller-value-container">
                        <div className="topKiller-value-title">COUNT</div>
                        <div className="topKiller-value">{formatNumber(returnStatValue(playerData.stats, topKiller.statId))}</div>
                    </div>
                    <div className="topKiller-value-container">
                        <div className="topKiller-value-title">% BETTER THAN</div>
                        <div className="topKiller-value">{topKiller.percentage}</div>
                    </div>
                </div>
            </div>
            <img className="topKiller-bg" src={charBg} alt="" />
        </div>
    );
}


export default TopKiller;