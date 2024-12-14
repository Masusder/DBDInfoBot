import React from "react";
import { FadingDivider } from "../Dividers/Dividers.tsx";
import {
    collectMapDetails,
    IMapDetails
} from "@ui/data/maps.ts";
import { IPlayerData } from "@ui/types/playerStats.ts";
import { Map } from '@tps/map.ts';
import { combineBaseUrlWithPath } from "@utils/stringUtils.ts";

type MapsProps = {
    playerData: IPlayerData;
    mapsData: { [key: string]: Map };
}

export function Maps({ playerData, mapsData }: MapsProps) {
    const mapDetails = collectMapDetails(playerData, mapsData);

    if (mapDetails.length === 0) return null;

    return (
        <div className="maps-container">
            <div className="maps-title-container">
                <i className="fa-solid fa-map fa-2x fontawesomeIcon" style={{ marginTop: '4px' }}/>
                <div className="maps-title">
                    Top Maps
                </div>
            </div>
            <div className="maps-boxes-container">
                <MapBox importance={'great'} mapDetails={mapDetails[0]}/>
                <FadingDivider/>
                <MapBox importance={'medium'} mapDetails={mapDetails[1]}/>
                <FadingDivider/>
                <MapBox importance={'low'} mapDetails={mapDetails[2]}/>
            </div>
        </div>
    );
}

type MapIconProps = {
    importance: 'great' | 'medium' | 'low';
    mapDetails: IMapDetails;
}

const MapBox: React.FC<MapIconProps> = ({ importance, mapDetails }) => {
    return (
        <div className="maps-box">
            <img className="maps-icon"
                 src={combineBaseUrlWithPath(mapDetails.iconPath)} alt=""/>
            <div className="maps-fields-container">
                <div className="maps-field">
                    <div className="maps-field-title">
                        %&nbsp;COMPARISON
                    </div>
                    <div className="maps-field-value">
                        {mapDetails.percentage}
                    </div>
                </div>
                <div className="maps-field">
                    <div className="maps-field-title">
                        COUNT
                    </div>
                    <div className="maps-field-value">
                        {mapDetails.value}
                    </div>
                </div>
                <div className="maps-name">
                    {mapDetails.description}
                </div>
            </div>
            <div className={`maps-importance maps-importance-${importance}`}/>
        </div>
    );
};

export default Maps;