import React from "react";
import { IParsedInventory } from "../../../data/inventory";
import {
    compareItemRarityPriority,
    shortenText
} from "../../../utils";
import { Rarities } from "@data/Rarities";
import { combineBaseUrlWithPath } from "@utils/stringUtils";
import { Cosmetic } from "@tps/cosmetic";

const MAX_ITEMS = 20;

type CosmeticsProps = {
    parsedInventory: IParsedInventory;
    cosmeticData: Record<string, Cosmetic>;
}
function Cosmetics({ parsedInventory, cosmeticData }: CosmeticsProps) {
    // Combine all items and prioritize by rarity and outfit
    const sortedItems = Object.entries(parsedInventory.rarityStats)
        .flatMap(([rarity, { ownedItems }]) =>
            ownedItems.map((item: string) => ({
                item,
                rarity,
                isOutfit: parsedInventory.categoryStats?.outfit?.items.includes(item) ?? false,
            }))
        )
        .sort(compareItemRarityPriority)
        .sort((a, b) => Number(b.isOutfit) - Number(a.isOutfit));

    if (sortedItems.length === 0) return null;

    return (
        <div className="cosmetics-container">
            <div className="cosmetics-row">
                {sortedItems.slice(0, MAX_ITEMS).map((cosmetic, index) => (
                    <CosmeticItem
                        key={`${1}-${index}`}
                        index={index}
                        cosmetic={cosmeticData[cosmetic.item]}
                    />
                ))}
            </div>
            {sortedItems.length > MAX_ITEMS && (
                <div className="additional-cosmetics-count">
                    +{sortedItems.length - MAX_ITEMS}
                </div>
            )}
        </div>
    );
}

function CosmeticItem({ cosmetic, index }: { cosmetic: any, index: number }) {
    const rarity = cosmetic.Rarity as keyof typeof Rarities;

    return (
        <div
            className={`cosmetic-item-flex ${index === MAX_ITEMS - 1 ? "last-item" : ''} ${index === MAX_ITEMS - 2 ? "second-last-item" : ''}`}>
            <div className="cosmetic-item"
                 style={{ backgroundImage: `url(${Rarities[rarity].storeCustomizationPath})`, }}>
                <img
                    className="cosmetic-icon"
                    src={combineBaseUrlWithPath(cosmetic.IconFilePathList)} alt=""/>
                {cosmetic.Unbreakable ?
                    <img className="linked-set-icon" src={combineBaseUrlWithPath("/images/Other/CosmeticSetIcon.png")}
                         alt=""/>
                    : null}
            </div>
            <span style={{
                textAlign: "center",
                fontSize: "10px",
                fontWeight: "900",
                color: Rarities[rarity].color,
                textShadow: "0px 0px 4px rgba(0, 0, 0, 0.8)"
            }}>{shortenText(cosmetic.CosmeticName)}</span>
        </div>
    )
}

export default Cosmetics;