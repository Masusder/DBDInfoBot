import { Locale } from "discord.js";
import { DiscordLocaleToDbdLangCode } from "@data/Languages";
import i18next from "i18next";

export function localizeCacheKey(cacheKey: string, locale: Locale): string {
    const dbdLocale = mapDiscordLocaleToDbdLang(locale);
    return `${cacheKey}_${dbdLocale}`;
}

export function mapDiscordLocaleToDbdLang(discordLocale: Locale) {
    return DiscordLocaleToDbdLangCode[discordLocale] || 'en';
}

export function getTranslation(key: string, locale: Locale, ns: string = 'commands'): string {
    return i18next.t(key, { lng: mapDiscordLocaleToDbdLang(locale), ns });
}