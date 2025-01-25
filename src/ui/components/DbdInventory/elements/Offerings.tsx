import React from "react";
import { Rarities } from "@data/Rarities";
import { combineBaseUrlWithPath } from "@utils/stringUtils";
import { GameData } from "@ui/components/DbdInventory/models";
import { DbdCharacterItem } from "@commands/inventory/schemas/characterDataSchema";

const MAX_ITEMS = 18;
const ROWS = 3;

type OfferingsProps = {
    profileCharacterData: DbdCharacterItem | null;
    gameData: GameData;
}

function Offerings({ profileCharacterData, gameData }: OfferingsProps) {
    if (!profileCharacterData) return null;

    const { offeringData } = gameData;

    const matchedItems = profileCharacterData.data.characterItems
        .map((item) => {
            const matched = offeringData[item.itemId];

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
        .filter((item) => item !== null)
        .sort((a, b) => a.priority - b.priority);

    const rows = Array.from({ length: ROWS }, (_, i) =>
        matchedItems.slice(i * (MAX_ITEMS / ROWS), (i + 1) * (MAX_ITEMS / ROWS))
    );

    if (matchedItems.length === 0) return null;

    return (
        <div className="offerings-inventory-container">
            {rows.map((row, rowIndex) => (
                <div key={rowIndex} className="offerings-row"
                     style={{ marginLeft: rowIndex === 1 ? "30px" : '' }}>
                    {row.map((item, index) => {
                        return (
                            <div
                                key={index}
                                className={`offering-item ${index === row.length - 1 && rowIndex == ROWS - 1 ? "last-item" : ''} ${index === row.length - 2 && rowIndex == ROWS - 1 ? "second-last-item" : ''}`}
                            >
                                <img
                                    className="inventory-offering-icon"
                                    style={{
                                        backgroundImage: `url(${Rarities[item.rarity as keyof typeof Rarities].offeringBackgroundPath})`
                                    }}
                                    src={combineBaseUrlWithPath(item.Image)}
                                    alt={item.Name}
                                />
                                <div className="inventory-item-quantity">x{item.quantity}</div>
                            </div>
                        );
                    })}
                </div>
            ))}
            {matchedItems.length > MAX_ITEMS && (
                <div className="additional-items-count">
                    +{matchedItems.length - MAX_ITEMS}
                </div>
            )}
        </div>
    );
}

export default Offerings;
