export function extractCosmeticId(customId: string): string | null {
    const parts = customId.split('::');
    return parts.length > 1 ? parts[1] : null;
}