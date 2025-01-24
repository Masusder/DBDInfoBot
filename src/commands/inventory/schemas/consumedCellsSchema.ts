import { z } from "zod";

export const ConsumedCellsDataSchema = z.object({
    objectId: z.string(),
    data: z.object({
        itemId: z.string(),
        amount: z.number()
    }),
    version: z.number(),
    schemaVersion: z.number()
});

export type ConsumedCellsItem = z.infer<typeof ConsumedCellsDataSchema>;