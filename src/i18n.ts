import i18next from 'i18next';
import Backend from 'i18next-fs-backend';

async function initI18next() {
    try {
        await i18next
            .use(Backend)
            .init({
                lng: 'en',
                fallbackLng: 'en',
                preload: [
                    'en', 'de', 'es', 'es-MX', 'fr', 'it', 'ja',
                    'ko', 'pl', 'pt-BR', 'ru', 'th', 'tr', 'zh-Hans', 'zh-Hant'
                ],
                supportedLngs: [
                    'en', 'de', 'es', 'es-MX', 'fr', 'it', 'ja',
                    'ko', 'pl', 'pt-BR', 'ru', 'th', 'tr', 'zh-Hans', 'zh-Hant'
                ],
                ns: ['commands', 'messages'],
                defaultNS: 'commands',
                backend: {
                    loadPath: 'src/locales/{{lng}}/{{ns}}.json'
                },
                saveMissing: true // If true, saves missing translations for debugging
            });

        console.log('i18next initialized successfully');
    } catch (error) {
        console.error('i18next initialization failed:', error);
    }
}

export default initI18next;