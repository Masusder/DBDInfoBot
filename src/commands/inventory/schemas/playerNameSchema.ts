import { z } from "zod";

export const PlayerNameSchema = z.object({
    userId: z.string(),
    providerPlayerNames: z.record(z.string().optional()),
    playerName: z.string(),
});

export type DbdPlayerName = z.infer<typeof PlayerNameSchema>;