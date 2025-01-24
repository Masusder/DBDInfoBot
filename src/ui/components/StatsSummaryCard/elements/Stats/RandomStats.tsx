import React from "react";
import {
    returnStatValue,
    rollRandomStats
} from "@ui/components/StatsSummaryCard/utils/statUtils";
import { FadingDivider } from "../../../General/Dividers";
import {
    IPlayerData,
    IStatSchema
} from "@ui/components/StatsSummaryCard/types/playerStats";
import {
    combineBaseUrlWithPath,
    formatNumber
} from "@utils/stringUtils";

export function RandomStats({ playerData }: { playerData: IPlayerData }) {
    const randomStats = rollRandomStats(playerData.statsSchema);

    return (
        <div className="randomStats__mainContainer">
            <div className="randomStats__titleContainer">
                <i className="fa-solid fa-shuffle fa-2x fontawesomeIcon" style={{ marginTop: '4px' }}/>
                <div className="randomStats__title">
                    Randomly Selected Stats
                </div>
            </div>
            <div className="randomStats__container">
                <div className="randomStats__comboBox">
                    <StatsBox playerData={playerData} statSchemaData={randomStats[0]}/>
                    <StatsBox playerData={playerData} statSchemaData={randomStats[1]}/>
                </div>
                <FadingDivider/>
                <div className="randomStats__comboBox">
                    <StatsBox playerData={playerData} statSchemaData={randomStats[2]}/>
                    <StatsBox playerData={playerData} statSchemaData={randomStats[3]}/>
                </div>
                <FadingDivider/>
                <div className="randomStats__comboBox">
                    <StatsBox playerData={playerData} statSchemaData={randomStats[4]}/>
                    <StatsBox playerData={playerData} statSchemaData={randomStats[5]}/>
                </div>
            </div>
        </div>
    );
}

type StatsBoxProps = {
    playerData: IPlayerData;
    statSchemaData: IStatSchema;
}
const StatsBox: React.FC<StatsBoxProps> = ({ playerData, statSchemaData }) => {
    if (!statSchemaData.statId || !statSchemaData.iconPath) return null;

    const value = returnStatValue(playerData.stats, statSchemaData.statId);
    let linearGradient = 'linear-gradient(135deg, rgba(45, 48, 54, 0.2) 60%, rgba(85, 85, 85, 0.33))';
    switch (statSchemaData.role) {
        case 'Killer':
            linearGradient = 'linear-gradient(135deg, rgba(45, 48, 54, 0.2) 60%, rgba(255, 30, 30, 0.2))';
            break;
        case 'Survivor':
            linearGradient = 'linear-gradient(135deg, rgba(45, 48, 54, 0.2) 60%, rgba(30, 144, 255, 0.2))';
            break;
        case 'None':
            linearGradient = 'linear-gradient(135deg, rgba(45, 48, 54, 0.2) 60%, rgba(85, 85, 85, 0.33))';
            break;
        default:
            break;
    }

    return (
        <div className="randomStats__box" style={{ background: linearGradient }}>
            <img className="randomStats__icon" src={combineBaseUrlWithPath(statSchemaData.iconPath)} alt=""/>
            <div className="randomStats__boxContent">
                <div className="randomStats__value">{formatNumber(Math.trunc(value))}</div>
                <div className="randomStats__description">{statSchemaData.description}</div>
            </div>
        </div>
    );
};