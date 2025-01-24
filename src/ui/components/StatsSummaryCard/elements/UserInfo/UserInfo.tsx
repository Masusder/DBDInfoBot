import React from "react";
import {
    formatGrades,
    GradeDetails
} from "@ui/components/StatsSummaryCard/data/grade";
import {
    returnStatValue
} from "@ui/components/StatsSummaryCard/utils/statUtils";
import { FadingDivider } from "../../../General/Dividers";
import {
    IPlayerData,
    IStat
} from "@ui/components/StatsSummaryCard/types/playerStats";
import { combineBaseUrlWithPath } from "@utils/stringUtils";

function UserInfo({ playerData }: { playerData: IPlayerData }) {
    const pipsKiller = returnStatValue(playerData.stats, 'DBD_KillerSkulls');
    const pipsSurvivor = returnStatValue(playerData.stats, 'DBD_CamperSkulls');

    const gradeDataKiller = formatGrades(pipsKiller, 'Killer');
    const gradeDataSurvivor = formatGrades(pipsSurvivor, 'Survivor');

    return (
        <div className="user-info-container">
            <div className="user-info-avatar-container">
                <img className="user-info-avatar" src={playerData.steam.avatarIcon} alt=""/>
            </div>
            <div className="user-info-text-container">
                <div className="user-info-text-player-name">{playerData.steam.playerName}</div>
                <div className="user-info-text-player-id">{playerData.steam.steamId}</div>
                <div className="user-info-main-progressbar-container">
                    <GradeProgressbar role="Killer" value={Math.min(85, Math.max(0, pipsKiller))} countPosition="top"/>
                    <GradeProgressbar role="Survivor" value={Math.min(85, Math.max(0, pipsSurvivor))}
                                      countPosition="bottom"/>
                    <div className="user-info-grade-progress-text">Grade progress (by pips amount)</div>
                </div>
            </div>
            <FadingDivider direction="vertical" height="auto" width="2px"/>
            <div className="user-info-grade-prestige-container">
                <Grade gradeData={gradeDataKiller} role="Killer"/>
                <HighestPrestige statsData={playerData.stats}/>
                <Grade gradeData={gradeDataSurvivor} role="Survivor"/>
            </div>
        </div>
    );
}

const HighestPrestige: React.FC<{ statsData: IStat[] }> = ({ statsData }) => {
    const prestigeLevel = returnStatValue(statsData, 'DBD_BloodwebMaxPrestigeLevel');
    const clampedPrestigeLevel = Math.min(100, Math.max(1, prestigeLevel));

    const prestigeIconPath = combineBaseUrlWithPath(`/images/Prestige/PrestigeIcon_${clampedPrestigeLevel}.png`);

    return (
        <div className="user-info-grade-container">
            <span className="user-info-grade-text">Highest Prestige Reached</span>
            <div className="user-info-grade-text" style={{ marginBottom: "21px" }}/>
            <img className="user-info-grade-image" src={prestigeIconPath} alt=""/>
        </div>
    );
};

const Grade: React.FC<{ gradeData: GradeDetails, role: string }> = ({ gradeData, role }) => {
    const title = role === 'Killer' ? 'Killer Grade' : 'Survivor Grade';

    return (
        <div className="user-info-grade-container">
            <span className="user-info-grade-text">{title}</span>
            <span className="user-info-grade-text"
                  style={{ color: gradeData.color, marginBottom: "7.5px" }}>{gradeData["gradeName"]}</span>
            <div className="user-info-grade-rank-container">
                <img className="user-info-grade-image" src={gradeData.gradeImage} alt=""/>
                <div className="user-info-grade-number" style={{ color: gradeData.color }}>
                    {gradeData.level}
                </div>
            </div>
            {gradeData.pipsImage ?
                <img className="user-info-grade-image" style={{ width: "64px" }} src={gradeData.pipsImage}
                     alt=""/> : null}
        </div>
    );
};

type GradeProgressbarProps = {
    role: string;
    value: number;
    countPosition: 'bottom' | 'top';
};

const GradeProgressbar: React.FC<GradeProgressbarProps> = ({ role, value, countPosition }) => {
    const scaledValue = (value / 85) * 100;

    const color = role === 'Killer' ? 'red' : '#009DFF';
    const icon = role === 'Killer' ? combineBaseUrlWithPath('/images/UI/Icons/Archive/questIcons_killer.png') : combineBaseUrlWithPath('/images/UI/Icons/Archive/questIcons_survivor.png');
    const progressBarStyle = {
        width: `${scaledValue}%`,
        background: color,
        height: '100%'
    };

    return (
        <div className="user-info-progress-bar-container">
            <img className="user-info-progress-bar-icon" src={icon} alt=""/>
            <div className="user-info-horizontal-progress-bar">
                <div className="user-info-progress-bar-fill" style={progressBarStyle}></div>
                <span className="user-info-progress-label">{scaledValue.toFixed(1)}%</span>
            </div>
            <div className="user-info-progress-bar-grade-count" style={{ color, [countPosition]: "-15px" }}>{value}/85
            </div>
        </div>
    );
};

export default UserInfo;