import Constants from "../constants";
import { Locale } from "discord.js";
import { DiscordLocaleToDbdLangCode } from "../data/Languages";

export function extractInteractionId(customId: string): string | null {
    const parts = customId.split('::');
    return parts.length > 1 ? parts[1] : null;
}

export function combineBaseUrlWithPath(relativePath: string): string {
    return `${Constants.DBDINFO_BASE_URL}${relativePath}`;
}

export function formatInclusionVersion(inclusionVersion: string): string {
    return inclusionVersion === "Legacy" ? "Before 5.5.0" : inclusionVersion;
}

export function localizeCacheKey(cacheKey: string, locale: Locale): string {
    const dbdLocale = mapDiscordLocaleToDbdLang(locale);
    return `${cacheKey}_${dbdLocale}`;
}

export function mapDiscordLocaleToDbdLang(discordLocale: Locale) {
    return DiscordLocaleToDbdLangCode[discordLocale] || 'en';
}