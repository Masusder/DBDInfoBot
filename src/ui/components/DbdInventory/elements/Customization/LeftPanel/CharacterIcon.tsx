import React from "react";
import { combineBaseUrlWithPath } from "@utils/stringUtils";
import { Role } from "@data/Role";
import { Character } from "@tps/character";
import { DbdCharacterItem } from "@commands/inventory/schemas/characterDataSchema";

type CharacterIconProps = {
    character: Character;
    profileCharacterData: DbdCharacterItem | null;
}

function CharacterIcon({ character, profileCharacterData }: CharacterIconProps) {
    const role = character.Role as "Killer" | "Survivor";
    const hasLegacyPrestige = profileCharacterData?.data?.legacyPrestigeLevel !== undefined &&
        profileCharacterData.data.legacyPrestigeLevel >= 3;

    return (
        <div style={{ position: "relative" }}>
            <img className="character-icon"
                 style={{ backgroundImage: `url(${hasLegacyPrestige ? combineBaseUrlWithPath('/images/Other/CharPortrait_Legacy.png') : Role[role].charPortrait})` }}
                 src={combineBaseUrlWithPath(character.IconFilePath)} alt="" width="200px"/>

                <img className="prestige-icon"
                     src={combineBaseUrlWithPath("/images/Prestige/PrestigeIcon_" + profileCharacterData?.data.prestigeLevel + ".png")}
                     alt="Prestige Icon"/>

        </div>
    );
}

export default CharacterIcon;