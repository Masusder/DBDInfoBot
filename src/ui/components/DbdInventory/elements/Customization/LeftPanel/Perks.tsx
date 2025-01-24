import React from "react";
import { Role } from "@data/Role";
import { combineBaseUrlWithPath } from "@utils/stringUtils";
import { Perk } from "@tps/perk";

type PerkProps = {
    perkData: Record<string, Perk>;
    characterIndex: string;
}

function Perks({ perkData, characterIndex }: PerkProps) {
    const perks = Object.entries(perkData)
        .filter(([_, perk]) => perk.Character === parseInt(characterIndex))
        .reduce((acc, [perkId, perk]) => {
            acc[perkId] = perk;
            return acc;
        }, {} as Record<string, Perk>);

    return (
        <div className="perks-container">
            {Object.values(perks).map((perk, index) => (
                <img key={index}
                     className="perk-icon"
                     style={{
                         backgroundImage: `url(${Role[perk.Role as "Survivor" | "Killer"].perkBackground})`,
                         width: "40px"
                     }}
                     src={combineBaseUrlWithPath(perk.IconFilePathList)} alt=""/>
            ))}
        </div>
    );
}

export default Perks;