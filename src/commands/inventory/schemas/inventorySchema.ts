import { z } from "zod";

export const InventoryItemSchema = z.object({
    objectId: z.string(),
    quantity: z.number(),
    lastUpdateAt: z.number(),
});

// Response from API
export const DataInventorySchema = z.object({
    data: z.object({
        playerId: z.string(),
        inventory: z.array(InventoryItemSchema),
    }),
});

export type InventoryItem = z.infer<typeof InventoryItemSchema>;
export type DataInventory = z.infer<typeof DataInventorySchema>;