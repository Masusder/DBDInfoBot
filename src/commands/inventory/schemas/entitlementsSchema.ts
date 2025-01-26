import { z } from "zod";

export const DbdApiEntitlementsSchema = z.object({
    entitlements: z.array(z.string()),
});

export type DbdApiEntitlements = z.infer<typeof DbdApiEntitlementsSchema>;

const EntitlementInfo = z.object({
    purchaseDate: z.number(),
    isOwnerOfEntitlement: z.boolean(),
    productId: z.string(),
    isEntitled: z.boolean(),
    analyticEventSent: z.boolean(),
    ownerSteamId: z.string(),
    lastUpdate: z.number(),
    purchaseDateStr: z.string(),
});

export const DbdOwnedEntitlementsSchema = z.object({
    objectId: z.literal('ownedEntitlements'),
    data: z.record(
        z.object({
            entitlements: z.array(EntitlementInfo),
        })
    ),
    version: z.number(),
    schemaVersion: z.number(),
});

export type DbdEntitlements = z.infer<typeof DbdOwnedEntitlementsSchema>;