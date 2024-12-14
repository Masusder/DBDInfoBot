import React from "react";
import { returnAdepts } from "@ui/data/adepts.ts";
import {
    calculateAch,
    getPlaytime
} from "./generalUtils.ts";
import { IPlayerData } from "@ui/types/playerStats.ts";

function GeneralInfo({ playerData }: { playerData: IPlayerData }) {
    const adeptDetailsKiller = returnAdepts('Killer', playerData);
    const adeptDetailsSurvivor = returnAdepts('Survivor', playerData);
    const achData = calculateAch(playerData);

    return (
        <div className="general-info-container">
            <GeneralBox title="Total playtime"
                        value={getPlaytime(playerData.steam.playtime)}/>
            <GeneralBox title="Playtime in last two weeks"
                        value={getPlaytime(playerData.steam.playtimeLastTwoWeeks)}/>
            <GeneralBox title="Adepts survivor"
                        value={`${adeptDetailsSurvivor.achievedAdepts} / ${adeptDetailsSurvivor.maxAdepts}`}
                        progressBar={true} color="dodgerblue" percentage={adeptDetailsSurvivor.achievedPercentage}/>
            <GeneralBox title="Adepts killer"
                        value={`${adeptDetailsKiller.achievedAdepts} / ${adeptDetailsKiller.maxAdepts}`}
                        progressBar={true} color="red" percentage={adeptDetailsKiller.achievedPercentage}/>
            <GeneralBox title="Achievement progress" value={`${achData.achievedAch} / ${achData.totalAch}`}
                        progressBar={true} percentage={achData.percentage}/>
        </div>
    );
}

const GeneralBox = ({ title, value, progressBar = false, color, percentage }: {
    title: string,
    value: string,
    progressBar?: boolean,
    color?: string
    percentage?: number;
}) => {
    return (
        <div className="general-info-box">
            <div className="general-info-title">{title}</div>
            <div className="general-info-value">{value}</div>
            {progressBar ? <div className="general-info-circular-progress-bar-container">
                <CircularProgressBar value={percentage!} color={color}/>
            </div> : null}
        </div>
    );
};

interface CircularProgressBarProps {
    value: number;
    size?: number;
    strokeWidth?: number;
    color?: string;
    backgroundColor?: string;
}

const CircularProgressBar: React.FC<CircularProgressBarProps> = (
    {
        value,
        size = 50,
        strokeWidth = 8,
        color = "#4FE871",
        backgroundColor = "#ddd"
    }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const progress = Math.min(Math.max(value, 0), 100);
    const offset = circumference - (progress / 100) * circumference;

    return (
        <svg width={size} height={size}>
            <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke={backgroundColor}
                strokeWidth={strokeWidth}
            />
            <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke={color}
                strokeWidth={strokeWidth}
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                strokeLinecap="round"
                transform={`rotate(-90 ${size / 2} ${size / 2})`} // Rotate to start at top
            />
            <text
                x="50%"
                y="50%"
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize={size / 5}
                fill={color}
            >
                {`${progress}%`}
            </text>
        </svg>
    );
};

export default GeneralInfo;
