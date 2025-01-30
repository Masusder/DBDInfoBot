import { z } from "zod";
import { InventoryItemSchema } from "./inventorySchema";
import { DbdRatingsItemSchema } from "./ratingsSchema";
import { DbdCharacterItemSchema } from "./characterDataSchema";
import { ConsumedCellsDataSchema } from "@commands/inventory/schemas/consumedCellsSchema";
import { PlayerNameSchema } from "@commands/inventory/schemas/playerNameSchema";
import {
    DbdApiEntitlementsSchema,
    DbdOwnedEntitlementsSchema
} from "@commands/inventory/schemas/entitlementsSchema";

export const GDPRSchema = z.object({
    gdpr: z.object({
        playerInventory: z.array(InventoryItemSchema),
        playerName: PlayerNameSchema,
        splinteredState: z.object({
            "dbd-ratings": z.array(DbdRatingsItemSchema).optional(),
            "dbd_character_data": z.array(DbdCharacterItemSchema).optional(),
            "dbd-consume-cells": z.array(ConsumedCellsDataSchema).optional(),
            "dbd-entitlements": z.array(
                z.union([DbdOwnedEntitlementsSchema, z.object({}).passthrough()]) // I only care about trusted entitlements
            ).optional(),
        }).optional(),
    }),
});

export const UEParserSchema = z.object({
    UEParser: z.object({
        playerInventory: z.array(InventoryItemSchema),
        playerName: PlayerNameSchema,
        splinteredState: z.object({
            "dbd_character_data": z.array(DbdCharacterItemSchema).optional(),
            "dbd-entitlements": DbdApiEntitlementsSchema.optional(),
        }).optional(),
    }),
});

// Combined schema for both formats - GDPR and directly from API
export const CombinedSchema = z.union([UEParserSchema, GDPRSchema]);