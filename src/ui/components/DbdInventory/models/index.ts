import { Addon } from "@tps/addon";
import { Offering } from "@tps/offering";
import { Item } from "@tps/item";
import { Perk } from "@tps/perk";
import { Cosmetic } from "@tps/cosmetic";
import { Character } from "@tps/character";
import { DLC } from "@tps/dlc";

export interface GameData {
    addonData: Record<string, Addon>;
    offeringData: Record<string, Offering>;
    itemData: Record<string, Item>;
    perkData: Record<string, Perk>;
    cosmeticData: any;
    characterData: Record<string, Character>;
    dlcData: Record<string, DLC>;
}