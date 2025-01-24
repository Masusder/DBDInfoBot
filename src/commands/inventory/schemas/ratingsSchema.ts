import { z } from "zod";

// DBD's MMR
export const RatingSchema = z.object({
    mu: z.number(),
    phi: z.number(),
    sigma: z.number(),
});

const PendingEventSchema = z.object({
    rating: z.object({
        mu: z.number(),
        phi: z.number(),
        sigma: z.number(),
    }),
    outcome: z.number(),
});

export const DbdRatingsItemSchema = z.object({
    objectId: z.string(),
    data: z.object({
        rating: RatingSchema,
        ratingStatus: z.enum(['Rated', 'Unrated']),
        peakMMR: z.number().optional(),
        pendingEvents: z.array(PendingEventSchema).optional(),
        lastUpdate: z.number(),
    }),
    version: z.number(),
    schemaVersion: z.number(),
});

export type DbdRatingsItem = z.infer<typeof DbdRatingsItemSchema>;
