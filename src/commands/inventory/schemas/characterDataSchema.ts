import { z } from "zod";

export const CharacterItemSchema = z.object({
    itemId: z.string(),
    quantity: z.number(),
});

export const DbdCharacterItemSchema = z.object({
    objectId: z.string(),
    data: z.object({
        characterName: z.string(),
        legacyPrestigeLevel: z.number(),
        characterItems: z.array(CharacterItemSchema),
        bloodWebLevel: z.number(),
        // I won't be using bloodweb data, in case that changes in the future define proper schema
        bloodWebData: z.record(z.any()).optional(),
        prestigeLevel: z.number(),
    }),
    version: z.number(),
    schemaVersion: z.number()
});

export type CharacterItem = z.infer<typeof CharacterItemSchema>;
export type DbdCharacterItem = z.infer<typeof DbdCharacterItemSchema>;