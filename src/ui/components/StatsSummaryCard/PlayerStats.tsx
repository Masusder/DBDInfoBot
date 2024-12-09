import UserInfo from "./elements/UserInfo/UserInfo.tsx";
import {
    Delimiter,
    FadingDivider
} from "./elements/Dividers/Dividers.tsx";
import GeneralInfo from "./elements/GeneralInfo/GeneralInfo.tsx";
import Maps from "./elements/Maps/ Maps.tsx";
import { RandomStats } from "./elements/Stats/RandomStats.tsx";
import TopKiller from "./elements/TopKiller/TopKiller.tsx";
import BestStat from "./elements/BestStat/BestStat.tsx";
import React from "react";

function PlayerStats({ characterData, mapsData, playerData }: any) {
    return (
        <div className="playerStats-infographicContainer">
            <div className="playerStats-infographicHeader">
                <div className="playerStats-logoContainer">
                    <img className="playerStats-dbdinfoLogo"
                         src="https://www.dbd-info.com/images/Logo/DBDInfoLogo_Footer.png"
                         alt=""/>
                    <div className="playerStats-logoText"><b>Created by:</b> Masusder</div>
                </div>
                <div className="playerStats-infographicTitleContainer">
                    <i className="fa-solid fa-info-circle fa-2x"
                       style={{ marginTop: '4px', filter: 'drop-shadow(dodgerblue 0px 0px 5px)' }}/>
                    <div className="playerStats-infographicTitle"
                         style={{ filter: 'drop-shadow(dodgerblue 0px 0px 5px)' }}>Player Stats Summary
                    </div>
                </div>
            </div>
            <div className="playerStats-divider"/>
            <div className="playerStats-infographicTopPanel">
                <UserInfo playerData={playerData}/>
            </div>
            <Delimiter position="left"/>
            <Delimiter position="right"/>
            <GeneralInfo playerData={playerData}/>
            <FadingDivider margin="30px 0px 30px 0px"/>
            <div className="playerStats-infographicBottomPanel">
                <RandomStats playerData={playerData}/>
                <div className="playerStats-infographicBottomPanelMiddle">
                    <BestStat playerData={playerData}/>
                    <FadingDivider/>
                    <TopKiller playerData={playerData} characterData={characterData}/>
                </div>
                <Maps playerData={playerData} mapsData={mapsData}/>
            </div>
        </div>
    );
}


export default PlayerStats;