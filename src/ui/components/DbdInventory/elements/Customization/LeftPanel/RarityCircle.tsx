import React from "react";
import { IParsedInventory } from "../../../data/inventory";
import { Rarities } from "@data/Rarities";
import { combineBaseUrlWithPath } from "@utils/stringUtils";

type RarityCircleProps = {
    parsedInventory: IParsedInventory;
}

function RarityCircle({ parsedInventory }: RarityCircleProps) {
    const { rarityStats } = parsedInventory;

    const boxSize = 150;
    const centerX = boxSize / 2;
    const centerY = boxSize / 2;
    const radius = 20;

    const rarities = Object.entries(Rarities).filter(([rarity]) => rarity !== "Limited" && rarity !== "N/A");
    const numRarities = rarities.length;

    return (
        <div className="rarity-circle-container">
            {rarities.map(([rarity, rarityDetails], index) => {
                const angle = (index / numRarities) * 2 * Math.PI;

                const posX = centerX + radius * Math.cos(angle);
                const posY = centerY + radius * Math.sin(angle);

                const textAngle = angle * (180 / Math.PI);

                const stats = rarityStats[rarity];

                const isFlipped = textAngle > 90 && textAngle < 270;

                return (
                    <div key={rarity} className="rarity-circle" style={{
                        position: 'absolute',
                        left: `${posX}px`,
                        top: `${posY}px`,
                        background: rarityDetails.color
                    }}>
                        <div
                            className="rarity-text"
                            style={{
                                position: 'absolute',
                                left: '50%',
                                transform: `translateX(-50%) rotate(${textAngle}deg) translate(35px) ${isFlipped && stats ? "scale(-1)" : ''}`,
                                color: rarityDetails.color,
                                fontSize: '10px',
                                fontWeight: 900,
                                width: "200%",
                                whiteSpace: 'nowrap',
                                overflow: 'visible',
                                textAlign: isFlipped && stats ? 'right' : 'left',
                                transformOrigin: 'center center',
                            }}
                        >
                            {stats ?
                                (
                                    <>
                                        {rarityStats[rarity].owned}
                                        <span style={{ fontWeight: 'normal', color: "#7D7D7D" }}> / </span>
                                        {rarityStats[rarity].max}
                                    </>
                                )
                                : <img src={combineBaseUrlWithPath('/images/Other/icon_Disabled.png')}
                                       style={{ filter: "brightness(0) saturate(100%) invert(13%) sepia(89%) saturate(6206%) hue-rotate(359deg) brightness(116%) contrast(117%)" }}
                                       height="10px"
                                       alt="---"/>}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

export default RarityCircle;