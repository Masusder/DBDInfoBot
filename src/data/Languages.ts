import { Locale } from "discord.js";

export const DiscordLocaleToDbdLangCode: Record<Locale, string> = {
    [Locale.EnglishUS]: 'en',
    [Locale.EnglishGB]: 'en',
    [Locale.German]: 'de',
    [Locale.SpanishES]: 'es',
    [Locale.SpanishLATAM]: 'es-MX',
    [Locale.French]: 'fr',
    [Locale.Italian]: 'it',
    [Locale.Japanese]: 'ja',
    [Locale.Korean]: 'ko',
    [Locale.Polish]: 'pl',
    [Locale.PortugueseBR]: 'pt-BR',
    [Locale.Russian]: 'ru',
    [Locale.Thai]: 'th',
    [Locale.Turkish]: 'tr',
    [Locale.ChineseCN]: 'zh-Hans',
    [Locale.ChineseTW]: 'zh-Hant',
    // Below ones aren't supported by the game
    // We will fall back to English
    [Locale.Indonesian]: 'en',
    [Locale.Bulgarian]: 'en',
    [Locale.Croatian]: 'en',
    [Locale.Czech]: 'en',
    [Locale.Danish]: 'en',
    [Locale.Dutch]: 'en',
    [Locale.Finnish]: 'en',
    [Locale.Greek]: 'en',
    [Locale.Hindi]: 'en',
    [Locale.Hungarian]: 'en',
    [Locale.Lithuanian]: 'en',
    [Locale.Norwegian]: 'en',
    [Locale.Romanian]: 'en',
    [Locale.Swedish]: 'en',
    [Locale.Ukrainian]: 'en',
    [Locale.Vietnamese]: 'en'
};