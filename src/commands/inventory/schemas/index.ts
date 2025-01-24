import { z } from "zod";
import { InventoryItemSchema } from "./inventorySchema";
import { DbdRatingsItemSchema } from "./ratingsSchema";
import { DbdCharacterItemSchema } from "./characterDataSchema";
import { ConsumedCellsDataSchema } from "@commands/inventory/schemas/consumedCellsSchema";
import { PlayerNameSchema } from "@commands/inventory/schemas/playerNameSchema";

export const GDPRSchema = z.object({
    gdpr: z.object({
        playerInventory: z.array(InventoryItemSchema),
        playerName: PlayerNameSchema,
        splinteredState: z.object({
            "dbd-ratings": z.array(DbdRatingsItemSchema).optional(),
            "dbd_character_data": z.array(DbdCharacterItemSchema).optional(),
            "dbd-consume-cells": z.array(ConsumedCellsDataSchema).optional()
        }).optional(),
    }),
});

export const UEParserSchema = z.object({
    UEParser: z.object({
        playerInventory: z.array(InventoryItemSchema),
        playerName: PlayerNameSchema,
        splinteredState: z.object({
            "dbd_character_data": z.array(DbdCharacterItemSchema).optional(),
        }).optional(),
    }),
});

// Combined schema for both formats - GDPR and directly from API
export const CombinedSchema = z.union([UEParserSchema, GDPRSchema]);