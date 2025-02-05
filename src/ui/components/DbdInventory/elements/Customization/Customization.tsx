import CharacterIcon from "./LeftPanel/CharacterIcon";
import CosmeticCounter from "./LeftPanel/CosmeticCounter";
import { parseInventoryData } from "../../data/inventory";
import RarityCircle from "./LeftPanel/RarityCircle";
import EstimatedValue from "./LeftPanel/EstimatedValue";
import Perks from "./LeftPanel/Perks";
import Cosmetics from "./RightPanel/Cosmetics";
import {
    calculateDominantRarity,
    hexToRgba
} from "../../utils";
import React from "react";
import { Rarities } from "@data/Rarities";
import { combineBaseUrlWithPath } from "@utils/stringUtils";
import { FadingDivider } from "@ui/components/General/Dividers";
import { GameData } from "@ui/components/DbdInventory/models";
import { DbdCharacterItem } from "@commands/inventory/schemas/characterDataSchema";
import { Character } from "@tps/character";
import { InventoryItem } from "@commands/inventory/schemas/inventorySchema";
import {
    DbdApiEntitlements,
    DbdEntitlements
} from "@commands/inventory/schemas/entitlementsSchema";

type CustomizationProps = {
    gameData: GameData;
    profileCharacterData: DbdCharacterItem | null;
    inventory: InventoryItem[];
    character: Character;
    characterIndex: string;
    entitlements: DbdEntitlements[] | DbdApiEntitlements | null
    isGDPR: boolean;
}

function Customization({
    gameData,
    profileCharacterData,
    inventory,
    character,
    characterIndex,
    entitlements,
    isGDPR
}: CustomizationProps) {
    const parsedInventory = parseInventoryData(gameData, inventory, characterIndex, character, entitlements, isGDPR);

    const dominantRarity = calculateDominantRarity(parsedInventory.rarityStats);

    return (
        <div className="inventory-customization-container">
            <div className="inventory-customization-left-panel">
                <CharacterIcon character={character} profileCharacterData={profileCharacterData}/>
                <CosmeticCounter parsedInventory={parsedInventory}/>
                <FadingDivider height="1px" margin="10px 0 0px 0"/>
                <RarityCircle parsedInventory={parsedInventory}/>
                <FadingDivider height="1px" margin="0 0 10px 0"/>
                <EstimatedValue parsedInventory={parsedInventory}/>
                <FadingDivider height="1px" margin="10px 0 10px 0"/>
                <Perks perkData={gameData.perkData} characterIndex={characterIndex}/>
            </div>
            <div className="inventory-customization-right-panel"
                 style={{ background: `radial-gradient(circle 400px at 50% -10%, ${hexToRgba(Rarities[dominantRarity as keyof typeof Rarities].color, 0.25)}, #161616)` }}
            >
                <img className="character-background" src={combineBaseUrlWithPath(character.BackgroundImagePath)}
                     alt=""/>
                <Cosmetics parsedInventory={parsedInventory} cosmeticData={gameData.cosmeticData}/>
            </div>
        </div>
    );
}

export default Customization;