import { Locale } from "discord.js";

// export type TLang =
//     'de'
//     | 'en'
//     | 'es'
//     | 'es-MX'
//     | 'fr'
//     | 'it'
//     | 'ja'
//     | 'ko'
//     | 'pl'
//     | 'pt-BR'
//     | 'ru'
//     | 'th'
//     | 'tr'
//     | 'zh-Hans'
//     | 'zh-Hant';

// interface ILang {
//     code: string;
//     name: string;
// }

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

// export const Languages: ILang[] = [
//     { code: 'de', name: 'Deutsch' },
//     { code: 'en', name: 'English' },
//     { code: 'es', name: 'Español' },
//     { code: 'es-MX', name: 'Español (Mexicano)' },
//     { code: 'fr', name: 'Français' },
//     { code: 'it', name: 'Italiano' },
//     { code: 'ja', name: '日本' },
//     { code: 'ko', name: '한국인' },
//     { code: 'pl', name: 'Polski' },
//     { code: 'pt-BR', name: 'Português (Brasil)' },
//     { code: 'ru', name: 'Русский' },
//     { code: 'th', name: 'เมืองไทย' },
//     { code: 'tr', name: 'Türkçe' },
//     { code: 'zh-Hans', name: '简体中文' },
//     { code: 'zh-Hant', name: '繁體中文' }
// ];