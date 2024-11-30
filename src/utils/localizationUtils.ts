import { Locale } from "discord.js";
import { DiscordLocaleToDbdLangCode } from "@data/Languages";
import i18next from "i18next";
import { ELocaleNamespace } from "@tps/enums/ELocaleNamespace";

export function localizeCacheKey(cacheKey: string, locale: Locale): string {
    const dbdLocale = mapDiscordLocaleToDbdLang(locale);
    return `${cacheKey}_${dbdLocale}`;
}

export function mapDiscordLocaleToDbdLang(discordLocale: Locale) {
    return DiscordLocaleToDbdLangCode[discordLocale] || 'en';
}

export function getTranslation(key: string, locale: Locale, ns: ELocaleNamespace = ELocaleNamespace.Commands): string {
    return i18next.t(key, { lng: mapDiscordLocaleToDbdLang(locale), ns });
}

export function commandLocalizationHelper(key: string, ns: ELocaleNamespace = ELocaleNamespace.Commands) {
    const languages = [
        Locale.EnglishUS,
        Locale.EnglishGB,
        Locale.German,
        Locale.SpanishES,
        Locale.SpanishLATAM,
        Locale.French,
        Locale.Italian,
        Locale.Japanese,
        Locale.Korean,
        Locale.Polish,
        Locale.PortugueseBR,
        Locale.Russian,
        Locale.Thai,
        Locale.Turkish,
        Locale.ChineseCN,
        Locale.ChineseTW
    ];

    const localizations: { [key: string]: string } = {};

    languages.forEach((lang) => {
        localizations[lang] = getTranslation(key, lang, ns);
    });

    return localizations;
}
