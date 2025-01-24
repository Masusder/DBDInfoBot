import React from "react";
import { Rarities } from "@data/Rarities";
import { combineBaseUrlWithPath } from "@utils/stringUtils";
import { GameData } from "@ui/components/DbdInventory/models";
import { Character } from "@tps/character";
import { DbdCharacterItem } from "@commands/inventory/schemas/characterDataSchema";

const MAX_ITEMS = 18;

type ItemsAddonsProps = {
    profileCharacterData: DbdCharacterItem | null,
    gameData: GameData;
    character: Character;
}

function ItemsAddons({ profileCharacterData, gameData, character }: ItemsAddonsProps) {
    if (!profileCharacterData) return null;

    const { itemData, addonData } = gameData;

    const role = character.Role;
    const data = role === "Survivor" ? itemData : addonData;

    const matchedItems = profileCharacterData.data.characterItems
        .map((item: any) => {
            const matched = data[item.itemId];
            if (matched) {
                const rarity = Rarities[matched.Rarity as keyof typeof Rarities];
                return {
                    ...matched,
                    quantity: item.quantity,
                    rarity: matched.Rarity,
                    priority: rarity.priority
                };
            }
            return null;
        })
        .filter((item: any) => item !== null)
        .sort((a: any, b: any) => a.priority - b.priority);

    return (
        <div className="items-addons-inventory-container">
            {matchedItems.map((item: any, index: number) => {
                const icon = role === "Survivor" ? item.IconFilePathList : item.Image;

                return (
                    <div key={index}
                         className={`inventory-item ${index === MAX_ITEMS - 1 ? "last-item" : ''} ${index === MAX_ITEMS - 2 ? "second-last-item" : ''}`}>
                        <img className="inventory-item-addon-icon"
                             style={{ backgroundImage: `url(${Rarities[item.rarity as keyof typeof Rarities].itemsAddonsBackgroundPath})`, }}
                             src={combineBaseUrlWithPath(icon)} alt={item.name}/>
                        <div className="inventory-item-quantity">x{item.quantity}</div>
                    </div>
                )
            }).slice(0, MAX_ITEMS)}
            {matchedItems.length > MAX_ITEMS && (
                <div className="additional-items-count">
                    +{matchedItems.length - MAX_ITEMS}
                </div>
            )}
        </div>
    );
}

export default ItemsAddons;