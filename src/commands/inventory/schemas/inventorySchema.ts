import { z } from "zod";

export const InventoryItemSchema = z.object({
    objectId: z.string(),
    quantity: z.number(),
    lastUpdateAt: z.number(),
});

export type InventoryItem = z.infer<typeof InventoryItemSchema>;