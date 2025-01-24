import { Addon } from "@tps/addon";
import { Offering } from "@tps/offering";
import { Item } from "@tps/item";
import { Perk } from "@tps/perk";
import { Cosmetic } from "@tps/cosmetic";
import { Character } from "@tps/character";

export interface GameData {
    addonData: Record<string, Addon>;
    offeringData: Record<string, Offering>;
    itemData: Record<string, Item>;
    perkData: Record<string, Perk>;
    cosmeticData: Record<string, Cosmetic>;
    characterData: Record<string, Character>;
}