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

type CustomizationProps = {
    gameData: GameData;
    profileCharacterData: DbdCharacterItem | null;
    inventory: InventoryItem[];
    character: Character;
    characterIndex: string;
}

function Customization({
    gameData,
    profileCharacterData,
    inventory,
    character,
    characterIndex,
}: CustomizationProps) {
    const parsedInventory = parseInventoryData(gameData.cosmeticData, inventory, characterIndex, character);

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
                 style={{ background: `radial-gradient(circle 500px at 100% -10%, ${hexToRgba(Rarities[dominantRarity as keyof typeof Rarities].color, 0.25)}, #161616)` }}
            >
                <img className="character-background" src={combineBaseUrlWithPath(character.BackgroundImagePath)}
                     alt=""/>
                <Cosmetics parsedInventory={parsedInventory} cosmeticData={gameData.cosmeticData}/>
            </div>
        </div>
    );
}

export default Customization;