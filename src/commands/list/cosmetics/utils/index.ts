import { ChatInputCommandInteraction } from "discord.js";
import { Cosmetic } from "@tps/cosmetic";
import { ICustomFilters } from "@services/cosmeticService";
import { ERole } from "@tps/enums/ERole";

export function constructFilters(interaction: ChatInputCommandInteraction): {
    filters: Partial<Cosmetic>,
    customFilters: Partial<ICustomFilters>
} {
    const characterIndexString = interaction.options.getString('character');
    const isLinked = interaction.options.getBoolean('linked');
    const isPurchasable = interaction.options.getBoolean('purchasable');
    const rarity = interaction.options.getString('rarity');
    const inclusionVersion = interaction.options.getString('inclusion_version');
    const type = interaction.options.getString('type');
    const role = interaction.options.getString('role');
    const onSale = interaction.options.getBoolean('on_sale');

    const filters: Partial<Cosmetic> = {};

    if (characterIndexString) filters.Character = parseInt(characterIndexString);
    if (isLinked !== null) filters.Unbreakable = isLinked;
    if (isPurchasable !== null) filters.Purchasable = isPurchasable;
    if (rarity !== null) filters.Rarity = rarity;
    if (inclusionVersion !== null) filters.InclusionVersion = inclusionVersion;
    if (type !== null) filters.Category = type;
    if (role !== null) filters.Role = role as ERole;
    if (onSale !== null) filters.IsDiscounted = onSale;

    const isLimited = interaction.options.getBoolean('limited');
    const query = interaction.options.getString('search');

    const customFilters: Partial<ICustomFilters> = {};

    if (isLimited !== null) customFilters.isLimited = isLimited;
    if (query !== null) customFilters.query = query;

    return { filters, customFilters };
}