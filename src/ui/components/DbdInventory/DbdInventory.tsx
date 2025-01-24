import Header from "./elements/Header";
import Customization from "./elements/Customization/Customization";
import {
    findUserCharacterData
} from "./data/userCharacterData";
import MMR from "./elements/MMR";
import ItemsAddons from "./elements/ItemsAddons";
import Offerings from "./elements/Offerings";
import Footer from "./elements/Footer";
import React from "react";
import { GameData } from "@ui/components/DbdInventory/models";
import { InventoryItem } from "@commands/inventory/schemas/inventorySchema";
import { DbdCharacterItem } from "@commands/inventory/schemas/characterDataSchema";
import { DbdRatingsItem } from "@commands/inventory/schemas/ratingsSchema";
import { ConsumedCellsItem } from "@commands/inventory/schemas/consumedCellsSchema";
import {
    Locale,
    User
} from "discord.js";
import { DbdPlayerName } from "@commands/inventory/schemas/playerNameSchema";

type DbdInventoryProps = {
    inventory: InventoryItem[];
    userCharacterData: DbdCharacterItem[];
    ratings: DbdRatingsItem[];
    consumedCells: ConsumedCellsItem[],
    gameData: GameData;
    characterIndex: string;
    playerName: DbdPlayerName;
    isGDPR: boolean;
    locale: Locale;
    user: User;
}

function DbdInventory({
    inventory,
    gameData,
    userCharacterData,
    consumedCells,
    ratings,
    characterIndex,
    playerName,
    isGDPR,
    locale,
    user
}: DbdInventoryProps) {
    const { characterData } = gameData;

    const character = characterData[characterIndex];
    const profileCharacterData: DbdCharacterItem | null = findUserCharacterData(character, userCharacterData);

    return (
        <div className="inventory-infographic-wrapper">
            <Header character={character} playerName={playerName} locale={locale} user={user}/>
            <div className="inventory-content">
                <Customization gameData={gameData} profileCharacterData={profileCharacterData}
                               inventory={inventory} character={character} characterIndex={characterIndex}/>
                <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                    {isGDPR ? <MMR ratings={ratings} character={character}/> : null}
                    <ItemsAddons profileCharacterData={profileCharacterData} gameData={gameData} character={character}/>
                    <Offerings profileCharacterData={profileCharacterData} gameData={gameData}/>
                </div>
            </div>
            <Footer consumedCells={consumedCells} isGDPR={isGDPR}/>
        </div>
    )
}

export default DbdInventory
