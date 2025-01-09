import { ChatInputCommandInteraction } from "discord.js";
import { Character } from "@tps/character";
import { Addon } from "@tps/addon";

export function constructFilters(
    interaction: ChatInputCommandInteraction,
    characterData: Record<string, Character>,
    characterIndexString: string | null
): Partial<Addon> {
    const parentItem = characterIndexString ? characterData[characterIndexString].ParentItem : null;
    const rarity = interaction.options.getString('rarity');
    const filters: Partial<Addon> = {};

    if (characterIndexString) filters.ParentItem = parentItem ? [parentItem] : undefined;
    if (rarity) filters.Rarity = rarity;

    return filters;
}